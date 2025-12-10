import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { gmailTransporter } from '@/lib/gmail';
import { generateQRCodeBuffer } from '@/lib/qr-code';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import TouristBadge from '@/models/TouristBadge';
import User from '@/models/User';
import { randomUUID } from 'crypto';
import { generateLocalizedOrderConfirmationEmail } from '@/lib/email-templates';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Check Clerk authentication
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_ACCESS_REQUIRED' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Fetch order from database
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get locale from order or default to 'fr'
    const locale = order.locale || 'fr';

    // Check if badge exists for this order, if not create it automatically
    let badge = await TouristBadge.findOne({ orderNumber: order.orderNumber });

    if (!badge) {
      console.log(`Badge not found for order ${order.orderNumber}, creating automatically...`);
      
      // Parse cart items to get excursion details
      let cartItems: any[] = [];
      try {
        cartItems = typeof order.cartItems === 'string' 
          ? JSON.parse(order.cartItems) 
          : order.cartItems || [];
      } catch (parseError) {
        console.error('Error parsing cart items:', parseError);
        cartItems = [];
      }

      // Extract trip details from cart items
      const tripDetails = cartItems.map(item => ({
        excursionId: item.excursionId || item.id || 'N/A',
        excursionName: item.name || item.excursionName || 'N/A',
        date: item.date || 'N/A',
        adults: item.adults || 0,
        children: item.children || 0,
      }));

      // Create badge automatically
      try {
        // Generate unique badge code
        const badgeCode = `BADGE-${randomUUID().substring(0, 8).toUpperCase()}`;
        
        badge = await TouristBadge.create({
          badgeCode,
          touristName: `${order.firstName} ${order.lastName}`,
          email: order.email,
          phone: order.phone,
          orderNumber: order.orderNumber,
          tripDetails: JSON.stringify(tripDetails),
          status: 'active',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
          generatedAt: new Date(),
        });

        console.log(`✅ Badge created automatically: ${badge.badgeCode}`);
      } catch (badgeError) {
        console.error('Failed to create badge automatically:', badgeError);
        return NextResponse.json(
          {
            error: 'Failed to create badge for order',
            details: badgeError instanceof Error ? badgeError.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Get the request origin for building the full badge URL
    const origin = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000';
    const protocol = origin.includes('localhost') ? 'http://' : 'https://';
    const baseUrl = origin.startsWith('http') ? origin : `${protocol}${origin}`;
    
    // Build full badge URL with user's locale
    const badgeUrl = `${baseUrl}/${locale}/badge/${badge.badgeCode}`;

    // Generate QR code as buffer for email attachment
    const qrCodeBuffer = await generateQRCodeBuffer(badgeUrl);

    // Parse cart items
    let cartItems: any[] = [];
    try {
      cartItems = typeof order.cartItems === 'string' 
        ? JSON.parse(order.cartItems) 
        : order.cartItems || [];
    } catch (parseError) {
      console.error('Error parsing cart items:', parseError);
      cartItems = [];
    }

    // Generate localized email HTML
    const emailHtml = generateLocalizedOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      cartItems: cartItems,
      totalMad: order.totalMad,
      badgeCode: badge.badgeCode,
      badgeQrCodeUrl: 'cid:badge-qr-code', // Use Content-ID for inline attachment
      paymentMethod: order.paymentMethod || 'N/A',
      status: order.status || 'confirmed',
    }, locale);

    // Localized subject lines
    const subjects: Record<string, string> = {
      fr: `✅ Confirmation de réservation #${order.orderNumber} - DiffaTours`,
      en: `✅ Booking Confirmation #${order.orderNumber} - DiffaTours`,
      es: `✅ Confirmación de Reserva #${order.orderNumber} - DiffaTours`,
      it: `✅ Conferma Prenotazione #${order.orderNumber} - DiffaTours`,
      ar: `✅ تأكيد الحجز #${order.orderNumber} - DiffaTours`,
    };

    // Send email with inline QR code attachment
    const mailOptions = {
      from: `"DiffaTours Réservations" <${process.env.EMAIL_USER}>`,
      to: order.email,
      replyTo: process.env.EMAIL_USER,
      subject: subjects[locale] || subjects.fr,
      html: emailHtml,
      attachments: [
        {
          filename: 'badge-qr-code.png',
          content: qrCodeBuffer,
          cid: 'badge-qr-code', // Content-ID for inline embedding
        },
      ],
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'DiffaTours Booking System',
      }
    };

    await gmailTransporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
      badge: badge,
    });
  } catch (error) {
    console.error('Send confirmation email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send confirmation email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}