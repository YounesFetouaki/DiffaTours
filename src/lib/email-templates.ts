// Localized email templates for order confirmations

interface EmailTemplateParams {
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
}

interface EmailTranslations {
  title: string;
  greeting: string;
  intro: string;
  orderInfo: string;
  orderNumber: string;
  email: string;
  phone: string;
  status: string;
  excursions: string;
  excursionColumn: string;
  dateColumn: string;
  participantsColumn: string;
  adults: string;
  children: string;
  total: string;
  badgeTitle: string;
  badgeSubtitle: string;
  badgeCode: string;
  footer: string;
  copyright: string;
}

const translations: Record<string, EmailTranslations> = {
  fr: {
    title: 'Confirmation de réservation',
    greeting: 'Merci pour votre réservation',
    intro: 'Votre réservation a été confirmée. Voici les détails de votre commande:',
    orderInfo: 'Informations de la commande',
    orderNumber: 'Numéro de commande',
    email: 'Email',
    phone: 'Téléphone',
    status: 'Statut',
    excursions: 'Vos excursions',
    excursionColumn: 'Excursion',
    dateColumn: 'Date',
    participantsColumn: 'Participants',
    adults: 'adultes',
    children: 'enfants',
    total: 'Total',
    badgeTitle: 'Votre Badge Touristique',
    badgeSubtitle: 'Présentez ce QR code lors de vos excursions',
    badgeCode: 'Code',
    footer: 'Si vous avez des questions, n\'hésitez pas à nous contacter.<br>Nous vous souhaitons d\'excellentes excursions!',
    copyright: 'Tous droits réservés',
  },
  en: {
    title: 'Booking Confirmation',
    greeting: 'Thank you for your booking',
    intro: 'Your booking has been confirmed. Here are the details of your order:',
    orderInfo: 'Order Information',
    orderNumber: 'Order Number',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    excursions: 'Your Excursions',
    excursionColumn: 'Excursion',
    dateColumn: 'Date',
    participantsColumn: 'Participants',
    adults: 'adults',
    children: 'children',
    total: 'Total',
    badgeTitle: 'Your Tourist Badge',
    badgeSubtitle: 'Present this QR code during your excursions',
    badgeCode: 'Code',
    footer: 'If you have any questions, please don\'t hesitate to contact us.<br>We wish you excellent excursions!',
    copyright: 'All rights reserved',
  },
  es: {
    title: 'Confirmación de Reserva',
    greeting: 'Gracias por su reserva',
    intro: 'Su reserva ha sido confirmada. Aquí están los detalles de su pedido:',
    orderInfo: 'Información del Pedido',
    orderNumber: 'Número de Pedido',
    email: 'Email',
    phone: 'Teléfono',
    status: 'Estado',
    excursions: 'Sus Excursiones',
    excursionColumn: 'Excursión',
    dateColumn: 'Fecha',
    participantsColumn: 'Participantes',
    adults: 'adultos',
    children: 'niños',
    total: 'Total',
    badgeTitle: 'Su Insignia Turística',
    badgeSubtitle: 'Presente este código QR durante sus excursiones',
    badgeCode: 'Código',
    footer: 'Si tiene alguna pregunta, no dude en contactarnos.<br>¡Le deseamos excelentes excursiones!',
    copyright: 'Todos los derechos reservados',
  },
  it: {
    title: 'Conferma Prenotazione',
    greeting: 'Grazie per la tua prenotazione',
    intro: 'La tua prenotazione è stata confermata. Ecco i dettagli del tuo ordine:',
    orderInfo: 'Informazioni Ordine',
    orderNumber: 'Numero Ordine',
    email: 'Email',
    phone: 'Telefono',
    status: 'Stato',
    excursions: 'Le Tue Escursioni',
    excursionColumn: 'Escursione',
    dateColumn: 'Data',
    participantsColumn: 'Partecipanti',
    adults: 'adulti',
    children: 'bambini',
    total: 'Totale',
    badgeTitle: 'Il Tuo Badge Turistico',
    badgeSubtitle: 'Presenta questo codice QR durante le tue escursioni',
    badgeCode: 'Codice',
    footer: 'Se hai domande, non esitare a contattarci.<br>Ti auguriamo ottime escursioni!',
    copyright: 'Tutti i diritti riservati',
  },
  ar: {
    title: 'تأكيد الحجز',
    greeting: 'شكراً لحجزك',
    intro: 'تم تأكيد حجزك. إليك تفاصيل طلبك:',
    orderInfo: 'معلومات الطلب',
    orderNumber: 'رقم الطلب',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    status: 'الحالة',
    excursions: 'رحلاتك',
    excursionColumn: 'الرحلة',
    dateColumn: 'التاريخ',
    participantsColumn: 'المشاركون',
    adults: 'بالغين',
    children: 'أطفال',
    total: 'المجموع',
    badgeTitle: 'شارة السائح الخاصة بك',
    badgeSubtitle: 'قدم رمز الاستجابة السريعة هذا أثناء رحلاتك',
    badgeCode: 'الرمز',
    footer: 'إذا كان لديك أي أسئلة، لا تتردد في الاتصال بنا.<br>نتمنى لك رحلات ممتعة!',
    copyright: 'جميع الحقوق محفوظة',
  },
};

export function generateLocalizedOrderConfirmationEmail(
  params: EmailTemplateParams,
  locale: string = 'fr'
): string {
  const t = translations[locale] || translations.fr;

  const itemsHtml = params.cartItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.name || item.excursionName || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.date || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.adults || 0} ${t.adults}, ${item.children || 0} ${t.children}</td>
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
  <title>${t.title} #${params.orderNumber}</title>
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
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">${t.title}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 24px;">
                ${t.greeting}, ${params.firstName}!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ${t.intro}
              </p>
              
              <!-- Order Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 10px 0; color: #666666;">${t.orderNumber}:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; font-weight: 600; text-align: right;">#${params.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">${t.email}:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; text-align: right;">${params.email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">${t.phone}:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; text-align: right;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666666;">${t.status}:</td>
                  <td style="padding: 10px 0; color: #1a1a1a; text-align: right; text-transform: uppercase;">${params.status}</td>
                </tr>
              </table>
              
              <!-- Cart Items -->
              <h3 style="margin: 30px 0 15px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 20px;">
                ${t.excursions}
              </h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 4px;">
                <thead>
                  <tr style="background-color: #f0f7fb;">
                    <th style="padding: 12px; text-align: left; color: #1a1a1a; font-weight: 600;">${t.excursionColumn}</th>
                    <th style="padding: 12px; text-align: left; color: #1a1a1a; font-weight: 600;">${t.dateColumn}</th>
                    <th style="padding: 12px; text-align: left; color: #1a1a1a; font-weight: 600;">${t.participantsColumn}</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 700;">${t.total}:</td>
                  <td style="padding: 15px 0; color: #FFB73F; font-size: 24px; font-weight: 700; text-align: right;">${params.totalMad.toFixed(2)} MAD</td>
                </tr>
              </table>
              
              <!-- Badge Section -->
              <div style="margin: 40px 0; padding: 30px; background-color: #f0f7fb; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-family: 'Libre Baskerville', serif; font-size: 20px;">
                  ${t.badgeTitle}
                </h3>
                <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px;">
                  ${t.badgeSubtitle}
                </p>
                <img src="${params.badgeQrCodeUrl}" alt="QR Code Badge" style="width: 200px; height: 200px; margin: 0 auto; display: block;" />
                <p style="margin: 20px 0 0 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                  ${t.badgeCode}: ${params.badgeCode}
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                ${t.footer}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1a1a1a; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 14px;">
                © ${new Date().getFullYear()} DiffaTours. ${t.copyright}.
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