import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import TouristBadge from '@/models/TouristBadge';
import { gmailTransporter } from '@/lib/gmail';
import { generateQRCode } from '@/lib/qr-code';
import { sendBookingConfirmation, scheduleReminder } from '@/lib/sms';
import { sendBookingConfirmationWhatsApp, scheduleWhatsAppReminder } from '@/lib/whatsapp';
import { generateLocalizedOrderConfirmationEmail } from '@/lib/email-templates';
import { randomUUID } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

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

    // Generate QR code with full URL
    let qrCodeDataUrl: string;
    try {
      qrCodeDataUrl = await generateQRCode(badgeUrl);
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate QR code',
        details: qrError instanceof Error ? qrError.message : 'Unknown error'
      }, { status: 500 });
    }

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
      badgeQrCodeUrl: qrCodeDataUrl,
      paymentMethod: order.paymentMethod || 'N/A',
      status: order.status || 'confirmed',
      currency: order.currency || 'MAD',
      totalInCurrency: order.totalInCurrency,
    }, locale);

    // Localized subject lines
    const subjects: Record<string, string> = {
      fr: `✅ Confirmation de réservation #${order.orderNumber} - DiffaTours`,
      en: `✅ Booking Confirmation #${order.orderNumber} - DiffaTours`,
      es: `✅ Confirmación de Reserva #${order.orderNumber} - DiffaTours`,
      it: `✅ Conferma Prenotazione #${order.orderNumber} - DiffaTours`,
      ar: `✅ تأكيد الحجز #${order.orderNumber} - DiffaTours`,
    };

    // Send email
    const mailOptions = {
      from: `"DiffaTours Réservations" <${process.env.EMAIL_USER}>`,
      to: order.email,
      replyTo: process.env.EMAIL_USER,
      subject: subjects[locale] || subjects.fr,
      html: emailHtml,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'DiffaTours Booking System',
      }
    };

    await gmailTransporter.sendMail(mailOptions);

    // Send SMS booking confirmation
    try {
      const firstExcursion = cartItems[0];
      const excursionName = firstExcursion?.name || firstExcursion?.excursionName || 'Excursion';
      const excursionDate = firstExcursion?.date || 'Date à confirmer';

      // Calculate total participants
      const totalParticipants = cartItems.reduce((sum, item) => {
        return sum + (item.adults || 0) + (item.children || 0);
      }, 0);

      // Send booking confirmation SMS
      await sendBookingConfirmation({
        phoneNumber: order.phone,
        orderId: order._id.toString(),
        customerName: order.firstName,
        excursionName: cartItems.length > 1 ? `${cartItems.length} excursions` : excursionName,
        date: excursionDate,
        participants: totalParticipants,
        totalPrice: order.totalMad,
        userId: order.userClerkId
      });

      console.log(`✅ SMS booking confirmation sent to ${order.phone}`);

      // Schedule reminder SMS for each excursion (24 hours before)
      for (const item of cartItems) {
        if (item.date) {
          try {
            const excursionDate = new Date(item.date);
            const pickupTime = item.pickupTime || '08:00';
            const pickupLocation = order.accommodationType === 'hotel'
              ? (order.hotelName || 'Votre hôtel')
              : (order.address || 'Votre adresse');

            await scheduleReminder({
              phoneNumber: order.phone,
              orderId: order._id.toString(),
              customerName: order.firstName,
              excursionName: item.name || item.excursionName || 'Excursion',
              pickupTime,
              pickupLocation,
              excursionDate,
              userId: order.userClerkId
            });

            console.log(`✅ SMS reminder scheduled for ${item.name || 'excursion'} on ${item.date}`);
          } catch (reminderError) {
            console.error('Failed to schedule reminder SMS:', reminderError);
          }
        }
      }
    } catch (smsError) {
      console.error('SMS notification error:', smsError);
      // Don't fail the request if SMS fails
    }

    // Send WhatsApp booking confirmation
    try {
      const firstExcursion = cartItems[0];
      const excursionName = firstExcursion?.name || firstExcursion?.excursionName || 'Excursion';
      const excursionDate = firstExcursion?.date || 'Date à confirmer';

      // Calculate total participants
      const totalParticipants = cartItems.reduce((sum, item) => {
        return sum + (item.adults || 0) + (item.children || 0);
      }, 0);

      // Format excursion date
      const formattedDate = excursionDate !== 'Date à confirmer'
        ? new Date(excursionDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'it' ? 'it-IT' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : excursionDate;

      // Send booking confirmation WhatsApp
      const whatsappResult = await sendBookingConfirmationWhatsApp({
        phoneNumber: order.phone,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        excursionName: cartItems.length > 1 ? `${cartItems.length} excursions` : excursionName,
        excursionDate: formattedDate,
        participants: totalParticipants,
        totalPrice: `${order.totalMad.toFixed(2)} MAD`,
      });

      if (whatsappResult.success) {
        console.log(`✅ WhatsApp booking confirmation sent to ${order.phone} (Message ID: ${whatsappResult.messageId})`);
      } else {
        console.error(`❌ WhatsApp booking confirmation failed: ${whatsappResult.error}`);
      }

      // Schedule reminder WhatsApp for each excursion (24 hours before)
      for (const item of cartItems) {
        if (item.date) {
          try {
            const excursionDate = new Date(item.date);
            const pickupTime = item.pickupTime || '08:00';
            const pickupLocation = order.accommodationType === 'hotel'
              ? (order.hotelName || 'Votre hôtel')
              : (order.address || 'Votre adresse');

            const formattedExcursionDate = excursionDate.toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'it' ? 'it-IT' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const reminderResult = await scheduleWhatsAppReminder({
              phoneNumber: order.phone,
              orderId: order._id.toString(),
              excursionName: item.name || item.excursionName || 'Excursion',
              excursionDate: formattedExcursionDate,
              pickupTime,
              pickupLocation,
            });

            if (reminderResult.success) {
              console.log(`✅ WhatsApp reminder scheduled for ${item.name || 'excursion'} on ${item.date} (Scheduled ID: ${reminderResult.scheduledId})`);
            } else {
              console.error(`❌ WhatsApp reminder scheduling failed: ${reminderResult.error}`);
            }
          } catch (reminderError) {
            console.error('Failed to schedule reminder WhatsApp:', reminderError);
          }
        }
      }
    } catch (whatsappError) {
      console.error('WhatsApp notification error:', whatsappError);
      // Don't fail the request if WhatsApp fails
    }

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