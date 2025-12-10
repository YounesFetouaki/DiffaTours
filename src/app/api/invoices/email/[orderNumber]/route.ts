import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { gmailTransporter } from '@/lib/gmail';

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    // Get locale from request body or order
    const requestLocale = body?.locale;

    console.log('[EMAIL] Starting email send for order:', orderNumber);
    console.log('[EMAIL] EMAIL_USER configured:', !!process.env.EMAIL_USER);
    console.log('[EMAIL] EMAIL_PASSWORD configured:', !!process.env.EMAIL_PASSWORD);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('[EMAIL] Missing email configuration');
      return NextResponse.json(
        { error: 'Server email configuration missing' },
        { status: 500 }
      );
    }

    await connectDB();
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      console.log('[EMAIL] Order not found:', orderNumber);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Use request locale, order locale, or default to 'fr'
    const locale = requestLocale || order.locale || 'fr';

    console.log('[EMAIL] Order found, generating PDF with locale:', locale);

    // Parse cart items
    let cartItems = [];
    try {
      cartItems = JSON.parse(order.cartItems || '[]');
    } catch (e) {
      console.warn('Failed to parse cart items:', e);
      cartItems = [];
    }

    // Transform cart items to match PDF generator interface
    const transformedCartItems = cartItems.map((item: any) => {
      // Transform ageGroups from object to array
      const ageGroupsArray = item.ageGroups
        ? Object.entries(item.ageGroups)
          .filter(([_, count]) => (count as number) > 0)
          .map(([ageGroup, count]) => ({
            ageGroup,
            count: count as number,
            price: 0, // Price is already included in total
          }))
        : [];

      return {
        excursionName: item.excursionName || '',
        excursionPrice: item.priceMAD || item.total || 0,
        selectedItems: item.selectedItems || [],
        ageGroups: ageGroupsArray,
      };
    });

    // Generate PDF with locale
    const pdfBuffer = await generateInvoicePDF(
      {
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        phone: order.phone,
        passport: order.passport,
        city: order.city,
        accommodationType: order.accommodationType,
        hotelName: order.hotelName,
        address: order.address,
        cartItems: transformedCartItems,
        totalMad: order.totalMad,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
      locale
    );

    console.log('[EMAIL] PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Email translations
    const translations = {
      fr: {
        subject: `Facture - Commande ${orderNumber}`,
        greeting: `Bonjour ${order.firstName} ${order.lastName},`,
        body: `
          <p>Merci pour votre réservation avec DiffaTours !</p>
          <p>Veuillez trouver ci-joint votre facture pour la commande <strong>${orderNumber}</strong>.</p>
          <p><strong>Montant total :</strong> ${order.totalMad.toFixed(2)} MAD</p>
          <p><strong>Mode de paiement :</strong> ${order.paymentMethod === 'cash' ? 'Espèces (à la prise en charge)' : 'Paiement en ligne'}</p>
          <p><strong>Statut :</strong> ${order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;">
          <p style="color: #666; font-size: 12px;">
            Pour toute question, n'hésitez pas à nous contacter.<br>
            Email: contact@diffatours.com<br>
            Téléphone: +212 XXX XXX XXX
          </p>
        `,
      },
      en: {
        subject: `Invoice - Order ${orderNumber}`,
        greeting: `Hello ${order.firstName} ${order.lastName},`,
        body: `
          <p>Thank you for your booking with DiffaTours!</p>
          <p>Please find attached your invoice for order <strong>${orderNumber}</strong>.</p>
          <p><strong>Total amount:</strong> ${order.totalMad.toFixed(2)} MAD</p>
          <p><strong>Payment method:</strong> ${order.paymentMethod === 'cash' ? 'Cash (upon pickup)' : 'Online Payment'}</p>
          <p><strong>Status:</strong> ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;">
          <p style="color: #666; font-size: 12px;">
            For any questions, please contact us.<br>
            Email: contact@diffatours.com<br>
            Phone: +212 XXX XXX XXX
          </p>
        `,
      },
      es: {
        subject: `Factura - Pedido ${orderNumber}`,
        greeting: `Hola ${order.firstName} ${order.lastName},`,
        body: `
          <p>¡Gracias por su reserva con DiffaTours!</p>
          <p>Adjunto encontrará su factura para el pedido <strong>${orderNumber}</strong>.</p>
          <p><strong>Monto total:</strong> ${order.totalMad.toFixed(2)} MAD</p>
          <p><strong>Método de pago:</strong> ${order.paymentMethod === 'cash' ? 'Efectivo (al recoger)' : 'Pago en línea'}</p>
          <p><strong>Estado:</strong> ${order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;">
          <p style="color: #666; font-size: 12px;">
            Para cualquier pregunta, contáctenos.<br>
            Email: contact@diffatours.com<br>
            Teléfono: +212 XXX XXX XXX
          </p>
        `,
      },
      it: {
        subject: `Fattura - Ordine ${orderNumber}`,
        greeting: `Ciao ${order.firstName} ${order.lastName},`,
        body: `
          <p>Grazie per la tua prenotazione con DiffaTours!</p>
          <p>In allegato troverai la fattura per l'ordine <strong>${orderNumber}</strong>.</p>
          <p><strong>Importo totale:</strong> ${order.totalMad.toFixed(2)} MAD</p>
          <p><strong>Metodo di pagamento:</strong> ${order.paymentMethod === 'cash' ? 'Contanti (al ritiro)' : 'Pagamento online'}</p>
          <p><strong>Stato:</strong> ${order.paymentStatus === 'paid' ? 'Pagato' : 'In attesa'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e5e5;">
          <p style="color: #666; font-size: 12px;">
            Per qualsiasi domanda, contattaci.<br>
            Email: contact@diffatours.com<br>
            Telefono: +212 XXX XXX XXX
          </p>
        `,
      },
    };

    const t = translations[locale as keyof typeof translations] || translations.fr;

    console.log('[EMAIL] Sending email to:', order.email);
    console.log('[EMAIL] Subject:', t.subject);

    // Send email with Gmail Transporter
    const mailOptions = {
      from: `"DiffaTours Facturation" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: t.subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #FFB73F, #e69d1a);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                background: #ffffff;
                padding: 30px 20px;
                border: 1px solid #e5e5e5;
                border-top: none;
                border-radius: 0 0 8px 8px;
              }
              .content p {
                margin: 15px 0;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                color: #999;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DIFFATOURS</h1>
            </div>
            <div class="content">
              <h2 style="color: #FFB73F; margin-top: 0;">${t.greeting}</h2>
              ${t.body}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} DiffaTours. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `invoice-${orderNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await gmailTransporter.sendMail(mailOptions);

    console.log('[EMAIL] Email sent successfully via Gmail');

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
    });
  } catch (error) {
    console.error('[EMAIL] Email invoice error:', error);
    console.error('[EMAIL] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to send invoice email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}