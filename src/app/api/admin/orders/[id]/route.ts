import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Notification from '@/models/Notification';
import TouristBadge from '@/models/TouristBadge';
import { gmailTransporter } from '@/lib/gmail';
import { randomUUID } from 'crypto';
import { generateQRCode } from '@/lib/qr-code';

// Email template for order confirmation with badge
function generateConfirmationEmailWithBadge({
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
          <tr>
            <td style="background: linear-gradient(135deg, #FFB73F, #e69d1a); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-family: 'Libre Baskerville', serif; font-size: 28px;">DiffaTours</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">✅ Réservation Confirmée</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 24px;">
                Excellente nouvelle, ${firstName}!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Votre réservation a été <strong style="color: #4CAF50;">confirmée</strong> par notre équipe. Nous avons hâte de vous accueillir pour vos excursions!
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Numéro de commande:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; font-weight: 600; text-align: right;">#${orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Statut:</td>
                  <td style="padding: 10px 0; color: #4CAF50; font-weight: 600; text-align: right;">CONFIRMÉE</td>
                </tr>
              </table>
              
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
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700;">Total:</td>
                  <td style="padding: 15px 0; color: #FFB73F; font-size: 24px; font-weight: 700; text-align: right;">${totalMad.toFixed(2)} MAD</td>
                </tr>
              </table>
              
              <!-- Badge Section -->
              <div style="margin: 40px 0; padding: 30px; background-color: #f0f7fb; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 20px;">
                  🎫 Votre Badge Touristique
                </h3>
                <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px;">
                  Présentez ce QR code lors de vos excursions
                </p>
                <img src="${badgeQrCodeUrl}" alt="QR Code Badge" style="width: 200px; height: 200px; margin: 0 auto; display: block;" />
                <p style="margin: 20px 0 0 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                  Code: ${badgeCode}
                </p>
              </div>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #f0f7fb; border-radius: 8px; border-left: 4px solid #FFB73F;">
                <p style="margin: 0; color: #1a1a1a; font-size: 14px; line-height: 1.6;">
                  <strong>Prochaines étapes:</strong><br>
                  • Nous vous contacterons 48h avant chaque excursion<br>
                  • Préparez votre badge (numérique ou imprimé)<br>
                  • Préparez une pièce d'identité pour le jour J<br>
                  • N'hésitez pas à nous contacter pour toute question
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Nous vous souhaitons d'excellentes excursions!<br><br>
                L'équipe DiffaTours
              </p>
            </td>
          </tr>
          
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

// Email template for order confirmation
function generateConfirmationEmail(order: any, cartItems: any[]) {
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
  <title>Confirmation de réservation #${order.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Lexend Deca', Arial, sans-serif; background-color: #f0f7fb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f7fb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #FFB73F, #e69d1a); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-family: 'Libre Baskerville', serif; font-size: 28px;">DiffaTours</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">✅ Réservation Confirmée</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 24px;">
                Excellente nouvelle, ${order.firstName}!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Votre réservation a été <strong style="color: #4CAF50;">confirmée</strong> par notre équipe. Nous avons hâte de vous accueillir pour vos excursions!
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Numéro de commande:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; font-weight: 600; text-align: right;">#${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Statut:</td>
                  <td style="padding: 10px 0; color: #4CAF50; font-weight: 600; text-align: right;">CONFIRMÉE</td>
                </tr>
              </table>
              
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
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700;">Total:</td>
                  <td style="padding: 15px 0; color: #FFB73F; font-size: 24px; font-weight: 700; text-align: right;">${order.totalMad.toFixed(2)} MAD</td>
                </tr>
              </table>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #f0f7fb; border-radius: 8px; border-left: 4px solid #FFB73F;">
                <p style="margin: 0; color: #1a1a1a; font-size: 14px; line-height: 1.6;">
                  <strong>Prochaines étapes:</strong><br>
                  • Nous vous contacterons 48h avant chaque excursion<br>
                  • Préparez une pièce d'identité pour le jour J<br>
                  • N'hésitez pas à nous contacter pour toute question
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Nous vous souhaitons d'excellentes excursions!<br><br>
                L'équipe DiffaTours
              </p>
            </td>
          </tr>
          
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

// Email template for order rejection/cancellation
function generateRejectionEmail(order: any, cartItems: any[]) {
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
  <title>Annulation de réservation #${order.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Lexend Deca', Arial, sans-serif; background-color: #f0f7fb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f7fb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #c67b5c, #a66b4f); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-family: 'Libre Baskerville', serif; font-size: 28px;">DiffaTours</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">❌ Réservation Annulée</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 24px;">
                Cher(e) ${order.firstName},
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Nous regrettons de vous informer que votre réservation a été <strong style="color: #c67b5c;">annulée</strong>.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Numéro de commande:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; font-weight: 600; text-align: right;">#${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">Statut:</td>
                  <td style="padding: 10px 0; color: #c67b5c; font-weight: 600; text-align: right;">ANNULÉE</td>
                </tr>
              </table>
              
              <h3 style="margin: 30px 0 15px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 20px;">
                Détails de la réservation
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
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700;">Montant:</td>
                  <td style="padding: 15px 0; color: #1a1a1a; font-size: 24px; font-weight: 700; text-align: right;">${order.totalMad.toFixed(2)} MAD</td>
                </tr>
              </table>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #FFB73F;">
                <p style="margin: 0; color: #1a1a1a; font-size: 14px; line-height: 1.6;">
                  <strong>Raisons possibles de l'annulation:</strong><br>
                  • Indisponibilité à la date demandée<br>
                  • Problème avec les informations de réservation<br>
                  • Capacité maximale atteinte<br><br>
                  
                  <strong>Que faire maintenant?</strong><br>
                  • Contactez-nous pour plus d'informations<br>
                  • Si vous avez effectué un paiement, vous serez remboursé sous 7-10 jours<br>
                  • Vous pouvez effectuer une nouvelle réservation à une autre date
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Nous sommes désolés pour ce désagrément. N'hésitez pas à nous contacter pour toute question ou pour effectuer une nouvelle réservation.<br><br>
                L'équipe DiffaTours
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px; background-color: #1a1a1a; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 14px;">
                © ${new Date().getFullYear()} DiffaTours. Tous droits réservés.
              </p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                Besoin d'aide? Contactez-nous: ${process.env.EMAIL_USER}
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📝 Updating admin order...');
    
    await connectDB();
    console.log('✅ Database connected');

    // Check Clerk authentication
    let clerkUserId: string | null = null;
    try {
      const authResult = await auth();
      clerkUserId = authResult?.userId || null;
      console.log('🔐 Clerk admin user ID:', clerkUserId);
    } catch (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed: ' + (authError as Error).message, code: 'AUTH_FAILED' },
        { status: 401 }
      );
    }

    if (!clerkUserId) {
      console.error('❌ No user ID found in auth');
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findOne({ clerkId: clerkUserId });
    console.log('🔍 User lookup result:', user ? `Found user ${user._id}` : 'User not found');

    if (!user) {
      console.error('❌ User not found for clerkId:', clerkUserId);
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.error('❌ Admin access denied for user:', user._id, 'Role:', user.role);
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_ACCESS_REQUIRED' },
        { status: 403 }
      );
    }

    console.log('✅ Admin access verified for user:', user._id);

    const { id } = await params;
    console.log('🔍 Looking up order with ID:', id);

    // Check if order exists
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      console.error('❌ Order not found with ID:', id);
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    console.log('✅ Order found:', existingOrder.orderNumber);

    // Parse request body
    const body = await request.json();
    const { status, paymentStatus } = body;
    console.log('📋 Update request body:', { status, paymentStatus });

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'paid', 'cancelled'];
    if (status !== undefined && !validStatuses.includes(status)) {
      console.error('❌ Invalid status provided:', status);
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate payment status if provided
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus)) {
      console.error('❌ Invalid payment status provided:', paymentStatus);
      return NextResponse.json(
        {
          error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`,
          code: 'INVALID_PAYMENT_STATUS',
        },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
      
      // If payment is confirmed, also set paidAt timestamp
      if (paymentStatus === 'paid') {
        updateData.paidAt = Math.floor(Date.now() / 1000);
      }
    }

    console.log('📝 Applying updates:', updateData);

    // Update order
    const updated = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      console.error('❌ Failed to update order:', id);
      return NextResponse.json(
        { error: 'Failed to update order', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    console.log('✅ Order updated successfully:', updated.orderNumber);

    // Parse cart items for email templates
    let cartItems: any[] = [];
    try {
      cartItems = typeof updated.cartItems === 'string' 
        ? JSON.parse(updated.cartItems) 
        : updated.cartItems || [];
      console.log('📦 Parsed cart items:', cartItems.length, 'items');
    } catch (parseError) {
      console.error('❌ Error parsing cart items:', parseError);
      cartItems = [];
    }

    // Notify user about order confirmation (in-app notification only)
    if (status === 'confirmed') {
      console.log('📧 Creating in-app notification for order:', updated.orderNumber);
      
      if (updated.userClerkId) {
        try {
          // Create in-app notification only (no email)
          await Notification.create({
            userId: updated.userClerkId,
            type: 'order_confirmed',
            title: 'Commande confirmée',
            message: `Votre commande (${updated.orderNumber.substring(0, 8)}...) a été confirmée !`,
            orderId: updated._id.toString(),
            orderNumber: updated.orderNumber,
            read: false,
          });
          console.log('✅ In-app notification created for order confirmation');
        } catch (notifError) {
          console.error('❌ Failed to create user notification:', notifError);
        }
      }
    }

    // Notify user about order rejection/cancellation
    if (status === 'cancelled') {
      console.log('📧 Sending cancellation notifications for order:', updated.orderNumber);
      
      if (updated.userClerkId) {
        try {
          // Create in-app notification
          await Notification.create({
            userId: updated.userClerkId,
            type: 'order_rejected',
            title: 'Commande annulée',
            message: `Votre commande (${updated.orderNumber.substring(0, 8)}...) a été annulée. Veuillez contacter le support pour plus d'informations.`,
            orderId: updated._id.toString(),
            orderNumber: updated.orderNumber,
            read: false,
          });
          console.log('✅ User notification created for order cancellation');

          // Send rejection/cancellation email
          try {
            const emailHtml = generateRejectionEmail(updated, cartItems);
            const mailOptions = {
              from: `"DiffaTours Réservations" <${process.env.EMAIL_USER}>`,
              to: updated.email,
              subject: `❌ Annulation de votre réservation #${updated.orderNumber} - DiffaTours`,
              html: emailHtml,
            };
            await gmailTransporter.sendMail(mailOptions);
            console.log('✅ Cancellation email sent to user:', updated.email);
          } catch (emailError) {
            console.error('❌ Failed to send cancellation email:', emailError);
            // Don't fail the request if email fails
          }
        } catch (notifError) {
          console.error('❌ Failed to create user notification:', notifError);
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('❌ PUT admin order error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ Deleting admin order...');
    
    await connectDB();
    console.log('✅ Database connected');

    // Check Clerk authentication
    let clerkUserId: string | null = null;
    try {
      const authResult = await auth();
      clerkUserId = authResult?.userId || null;
      console.log('🔐 Clerk admin user ID:', clerkUserId);
    } catch (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed: ' + (authError as Error).message, code: 'AUTH_FAILED' },
        { status: 401 }
      );
    }

    if (!clerkUserId) {
      console.error('❌ No user ID found in auth');
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findOne({ clerkId: clerkUserId });
    console.log('🔍 User lookup result:', user ? `Found user ${user._id}` : 'User not found');

    if (!user) {
      console.error('❌ User not found for clerkId:', clerkUserId);
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.error('❌ Admin access denied for user:', user._id, 'Role:', user.role);
      return NextResponse.json(
        { error: 'Admin access required', code: 'ADMIN_ACCESS_REQUIRED' },
        { status: 403 }
      );
    }

    console.log('✅ Admin access verified for user:', user._id);

    const { id } = await params;
    console.log('🔍 Looking up order to delete with ID:', id);

    // Check if order exists
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      console.error('❌ Order not found with ID:', id);
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    console.log('✅ Order found, deleting:', existingOrder.orderNumber);

    // Delete the order
    await Order.findByIdAndDelete(id);

    console.log('✅ Order deleted successfully:', existingOrder.orderNumber);

    return NextResponse.json(
      { 
        success: true,
        message: 'Order deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ DELETE admin order error:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}