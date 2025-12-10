import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TouristBadge from '@/models/TouristBadge';
import Order from '@/models/Order';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { gmailTransporter } from '@/lib/gmail';
import { generateQRCode } from '@/lib/qr-code';

// Email template function
function generateOrderConfirmationEmail({
  orderNumber,
  firstName,
  lastName,
  email,
  phone,
  cartItems,
  totalMad,
  badgeCode,
  badgeQrCodeUrl,
  paymentMethod,
  status,
}: {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cartItems: any[];
  totalMad: number;
  badgeCode: string;
  badgeQrCodeUrl: string;
  paymentMethod: string;
  status: string;
}) {
  const itemsHtml = cartItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.name || item.excursionName || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.date || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.adults || 0} adultes, ${item.children || 0} enfants</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de réservation #${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Lexend Deca', Arial, sans-serif; background-color: #f0f7fb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f7fb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FFB73F, #e69d1a); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-family: 'Libre Baskerville', serif; font-size: 28px;">DiffaTours</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Confirmation de réservation</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 24px;">
                Merci pour votre réservation, ${firstName}!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Votre réservation a été confirmée. Voici les détails de votre commande:
              </p>
              
              <!-- Order Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Numéro de commande:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; font-weight: 600; text-align: right;">#${orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Email:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; text-align: right;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Téléphone:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; text-align: right;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Statut:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; text-align: right; text-transform: uppercase;">${status}</td>
                </tr>
              </table>
              
              <!-- Cart Items -->
              <h3 style="margin: 30px 0 15px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 20px;">
                Vos excursions
              </h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 4px;">
                <thead>
                  <tr style="background-color: #f0f7fb;">
                    <th style="padding: 12px; text-align: left; color: #1a1a1a; font-weight: 600;">Excursion</th>
                    <th style="padding: 12px; text-align: left; color: #1a1a1a; font-weight: 600;">Date</th>
                    <th style="padding: 12px; text-align: left; color: #1a1a1a; font-weight: 600;">Participants</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700;">Total:</td>
                  <td style="padding: 15px 0; color: #FFB73F; font-size: 24px; font-weight: 700; text-align: right;">${totalMad.toFixed(2)} MAD</td>
                </tr>
              </table>
              
              <!-- Badge Section -->
              <div style="margin: 40px 0; padding: 30px; background-color: #f0f7fb; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 20px;">
                  Votre Badge Touristique
                </h3>
                <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px;">
                  Présentez ce QR code lors de vos excursions
                </p>
                <img src="${badgeQrCodeUrl}" alt="QR Code Badge" style="width: 200px; height: 200px; margin: 0 auto; display: block;" />
                <p style="margin: 20px 0 0 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                  Code: ${badgeCode}
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Si vous avez des questions, n'hésitez pas à nous contacter.<br>
                Nous vous souhaitons d'excellentes excursions!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1a1a1a; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 14px;">
                © ${new Date().getFullYear()} DiffaTours. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { orderNumber, orderId } = body;

    // Validate that at least one identifier is provided
    if (!orderNumber && !orderId) {
      return NextResponse.json({ 
        error: "Either orderNumber or orderId must be provided",
        code: "MISSING_ORDER_IDENTIFIER" 
      }, { status: 400 });
    }

    // Fetch order from database
    let order;
    if (orderId) {
      order = await Order.findById(orderId).lean();
      
      if (!order) {
        return NextResponse.json({ 
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND' 
        }, { status: 404 });
      }
    } else {
      order = await Order.findOne({ orderNumber }).lean();
      
      if (!order) {
        return NextResponse.json({ 
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND' 
        }, { status: 404 });
      }
    }

    // Check if badge already exists for this order
    const existingBadge = await TouristBadge.findOne({ orderNumber: order.orderNumber }).lean();

    if (existingBadge) {
      return NextResponse.json({ 
        error: 'Badge already exists for this order',
        code: 'BADGE_ALREADY_EXISTS',
        badge: existingBadge
      }, { status: 400 });
    }

    // Generate unique badge code
    const badgeCode = randomUUID();

    // Extract tourist info
    const touristName = `${order.firstName} ${order.lastName}`;
    const email = order.email;
    const phone = order.phone;

    // Parse cartItems for trip details
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

    // Calculate validity period
    const validFrom = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 365);
    const validUntil = validUntilDate;

    const generatedAt = new Date();

    // Insert badge into database
    const newBadge = await TouristBadge.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      badgeCode,
      touristName,
      email,
      phone,
      tripDetails: JSON.stringify(tripDetails),
      status: 'active',
      validFrom,
      validUntil,
      generatedAt,
    });

    // Get the request origin for building the full badge URL
    const origin = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000';
    const protocol = origin.includes('localhost') ? 'http://' : 'https://';
    const baseUrl = origin.startsWith('http') ? origin : `${protocol}${origin}`;
    
    // Build full badge URL (default to /fr locale)
    const badgeUrl = `${baseUrl}/fr/badge/${badgeCode}`;

    // Generate QR code with full URL
    let qrCodeDataUrl: string;
    try {
      qrCodeDataUrl = await generateQRCode(badgeUrl);
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      return NextResponse.json({
        ...newBadge.toObject(),
        emailSent: false,
        emailError: 'Failed to generate QR code'
      }, { status: 201 });
    }

    // Send confirmation email with badge
    try {
      const emailHtml = generateOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        phone: order.phone,
        cartItems: cartItems,
        totalMad: order.totalMad,
        badgeCode: badgeCode,
        badgeQrCodeUrl: qrCodeDataUrl,
        paymentMethod: order.paymentMethod || 'N/A',
        status: order.status || 'confirmed',
      });

      const mailOptions = {
        from: `"DiffaTours Réservations" <${process.env.EMAIL_USER}>`,
        to: order.email,
        subject: `✅ Confirmation de réservation #${order.orderNumber} - DiffaTours`,
        html: emailHtml,
      };

      await gmailTransporter.sendMail(mailOptions);
      
      console.log(`Confirmation email sent to ${order.email} with badge ${badgeCode}`);

      return NextResponse.json({
        ...newBadge.toObject(),
        emailSent: true
      }, { status: 201 });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Badge was created successfully, but email failed
      return NextResponse.json({
        ...newBadge.toObject(),
        emailSent: false,
        emailError: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get authentication from Clerk
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Fetch user from database by clerkId
    const user = await User.findOne({ clerkId }).lean();

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check admin authorization
    if (user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED' 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate limit and offset
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter',
        code: 'INVALID_LIMIT' 
      }, { status: 400 });
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter',
        code: 'INVALID_OFFSET' 
      }, { status: 400 });
    }

    // Build query with filters
    const filter: any = {};

    // Status filter
    if (status) {
      const validStatuses = ['active', 'revoked', 'expired', 'used'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status parameter',
          code: 'INVALID_STATUS' 
        }, { status: 400 });
      }
      filter.status = status;
    }

    // Search filter (touristName, email, orderNumber, badgeCode)
    if (search) {
      filter.$or = [
        { touristName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { badgeCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await TouristBadge.countDocuments(filter);

    // Execute query with filters, pagination and sorting
    const badgesData = await TouristBadge.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    // Transform data to match expected format
    const badgesWithScans = badgesData.map(badge => ({
      id: badge._id,
      badge_code: badge.badgeCode,
      order_number: badge.orderNumber,
      tourist_name: badge.touristName,
      tourist_email: badge.email,
      trip_info: badge.tripDetails,
      status: badge.status,
      valid_until: badge.validUntil,
      created_at: badge.createdAt,
      scans_count: 0 // TODO: Implement actual scan counting from badgeScans collection
    }));

    return NextResponse.json({
      badges: badgesWithScans,
      total,
      limit,
      offset
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}