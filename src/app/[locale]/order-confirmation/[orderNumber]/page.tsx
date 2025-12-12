'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Package, Mail, Phone, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/sections/header';
import { toast } from 'sonner';

interface Order {
  id: number;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  totalMad: number;
  status: string;
  cartItems: string;
  currency?: string;
  totalInCurrency?: number;
  exchangeRate?: number;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/number/${orderNumber}`);

        if (!response.ok) {
          throw new Error('Order not found');
        }

        const orderData = await response.json();
        setOrder(orderData);

        // If payment method is CMI (online payment), redirect to payment page
        if (orderData.paymentMethod === 'cmi') {
          router.push(`/${locale}/payment/${orderNumber}`);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        router.push(`/${locale}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [locale, orderNumber, router]);

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/invoices/download/${orderNumber}?locale=${locale}`);

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        locale === 'fr' ? 'Facture téléchargée avec succès' :
          locale === 'es' ? 'Factura descargada con éxito' :
            locale === 'it' ? 'Fattura scaricata con successo' :
              locale === 'ar' ? 'تم تنزيل الفاتورة بنجاح' :
                'Invoice downloaded successfully'
      );
    } catch (error) {
      console.error('Download error:', error);
      toast.error(
        locale === 'fr' ? 'Erreur lors du téléchargement' :
          locale === 'es' ? 'Error al descargar' :
            locale === 'it' ? 'Errore durante il download' :
              locale === 'ar' ? 'خطأ في التنزيل' :
                'Download failed'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendInvoiceEmail = async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch(`/api/invoices/email/${orderNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success(
        locale === 'fr' ? 'Facture envoyée par email avec succès' :
          locale === 'es' ? 'Factura enviada por correo electrónico con éxito' :
            locale === 'it' ? 'Fattura inviata via email con successo' :
              locale === 'ar' ? 'تم إرسال الفاتورة بالبريد الإلكتروني بنجاح' :
                'Invoice sent via email successfully'
      );
    } catch (error) {
      console.error('Email error:', error);
      toast.error(
        locale === 'fr' ? 'Erreur lors de l\'envoi de l\'email' :
          locale === 'es' ? 'Error al enviar el correo electrónico' :
            locale === 'it' ? 'Errore durante l\'invio dell\'email' :
              locale === 'ar' ? 'خطأ في إرسال البريد الإلكتروني' :
                'Failed to send email'
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading || !order || order.paymentMethod === 'cmi') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  const cartItems = JSON.parse(order.cartItems || '[]');
  const isCircuit = order.totalMad === 0;

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1701534008693-0eee0632d47a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2Vic2l0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D)'
      }}
    >
      <Header />

      <main className="flex-1 pt-40 pb-16 px-4">
        <div className="container max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2">
              {isCircuit
                ? (locale === 'fr' ? 'Demande de Réservation Envoyée !' :
                  locale === 'es' ? '¡Solicitud de Reserva Enviada!' :
                    locale === 'it' ? 'Richiesta di Prenotazione Inviata!' :
                      locale === 'ar' ? 'تم إرسال طلب الحجز!' :
                        'Booking Request Sent!')
                : (locale === 'fr' ? 'Commande Confirmée !' :
                  locale === 'es' ? '¡Pedido Confirmado!' :
                    locale === 'it' ? 'Ordine Confermato!' :
                      locale === 'ar' ? 'تم تأكيد الطلب!' :
                        'Order Confirmed!')}
            </h1>
            <p className="text-lg text-muted">
              {locale === 'fr' ? 'Nous vous contacterons bientôt' :
                locale === 'es' ? 'Te contactaremos pronto' :
                  locale === 'it' ? 'Ti contatteremo presto' :
                    locale === 'ar' ? 'سنتصل بك قريباً' :
                      "We'll contact you soon"}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-green-500/20 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">
                {locale === 'fr' ? 'Détails de la Commande' :
                  locale === 'es' ? 'Detalles del Pedido' :
                    locale === 'it' ? 'Dettagli Ordine' :
                      locale === 'ar' ? 'تفاصيل الطلب' :
                        'Order Details'}
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted">
                  {locale === 'fr' ? 'Numéro de commande' :
                    locale === 'es' ? 'Número de pedido' :
                      locale === 'it' ? 'Numero ordine' :
                        locale === 'ar' ? 'رقم الطلب' :
                          'Order Number'}:
                </span>
                <span className="font-mono font-semibold">{order.orderNumber}</span>
              </div>

              {/* Total Amount - Show differently for circuits */}
              <div className="flex justify-between items-center">
                <span className="text-muted">
                  {locale === 'fr' ? 'Montant Total' :
                    locale === 'es' ? 'Total' :
                      locale === 'it' ? 'Totale' :
                        locale === 'ar' ? 'المجموع' :
                          'Total Amount'}:
                </span>
                {isCircuit ? (
                  <span className="text-lg font-semibold text-primary italic">
                    {locale === 'fr' ? 'Prix sur demande' :
                      locale === 'es' ? 'Precio a consultar' :
                        locale === 'it' ? 'Prezzo su richiesta' :
                          locale === 'ar' ? 'السعر عند الطلب' :
                            'Price on request'}
                  </span>
                ) : order.totalInCurrency && order.currency && order.currency !== 'MAD' ? (
                  <span className="text-2xl font-bold text-primary">
                    {order.totalInCurrency.toFixed(2)} {order.currency}
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-primary">{order.totalMad.toFixed(2)} MAD</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted">
                  {locale === 'fr' ? 'Mode de paiement' :
                    locale === 'es' ? 'Método de pago' :
                      locale === 'it' ? 'Metodo di pagamento' :
                        locale === 'ar' ? 'طريقة الدفع' :
                          'Payment Method'}:
                </span>
                <span className="font-semibold">
                  {order.paymentMethod === 'cash'
                    ? (locale === 'fr' ? 'Espèces (à la prise en charge)' :
                      locale === 'es' ? 'Efectivo (en recogida)' :
                        locale === 'it' ? 'Contanti (al ritiro)' :
                          locale === 'ar' ? 'نقداً (عند الاستلام)' :
                            'Cash (upon pickup)')
                    : order.paymentMethod}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3">
                {locale === 'fr' ? 'Informations de Contact' :
                  locale === 'es' ? 'Información de Contacto' :
                    locale === 'it' ? 'Informazioni di Contatto' :
                      locale === 'ar' ? 'معلومات الاتصال' :
                        'Contact Information'}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted">Email:</span>
                  <span className="font-medium">{order.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-muted">
                    {locale === 'fr' ? 'Téléphone' :
                      locale === 'es' ? 'Teléfono' :
                        locale === 'it' ? 'Telefono' :
                          locale === 'ar' ? 'الهاتف' :
                            'Phone'}:
                  </span>
                  <span className="font-medium">{order.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Actions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-display font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {locale === 'fr' ? 'Facture & Reçu' :
                locale === 'es' ? 'Factura y Recibo' :
                  locale === 'it' ? 'Fattura e Ricevuta' :
                    locale === 'ar' ? 'الفاتورة والإيصال' :
                      'Invoice & Receipt'}
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              {locale === 'fr' ? 'Téléchargez ou recevez votre facture par email' :
                locale === 'es' ? 'Descarga o recibe tu factura por correo electrónico' :
                  locale === 'it' ? 'Scarica o ricevi la tua fattura via email' :
                    locale === 'ar' ? 'قم بتنزيل أو استلام فاتورتك عبر البريد الإلكتروني' :
                      'Download or receive your invoice via email'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {locale === 'fr' ? 'Téléchargement...' :
                      locale === 'es' ? 'Descargando...' :
                        locale === 'it' ? 'Download...' :
                          locale === 'ar' ? 'جاري التنزيل...' :
                            'Downloading...'}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {locale === 'fr' ? 'Télécharger PDF' :
                      locale === 'es' ? 'Descargar PDF' :
                        locale === 'it' ? 'Scarica PDF' :
                          locale === 'ar' ? 'تنزيل PDF' :
                            'Download PDF'}
                  </>
                )}
              </Button>
              <Button
                onClick={handleSendInvoiceEmail}
                disabled={isSendingEmail}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    {locale === 'fr' ? 'Envoi...' :
                      locale === 'es' ? 'Enviando...' :
                        locale === 'it' ? 'Invio...' :
                          locale === 'ar' ? 'جاري الإرسال...' :
                            'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {locale === 'fr' ? 'Envoyer par Email' :
                      locale === 'es' ? 'Enviar por Email' :
                        locale === 'it' ? 'Invia via Email' :
                          locale === 'ar' ? 'إرسال بالبريد الإلكتروني' :
                            'Send via Email'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Information Message - Different for circuits */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <h3 className="font-display font-bold text-blue-900 mb-3">
              {locale === 'fr' ? '📞 Prochaines Étapes' :
                locale === 'es' ? '📞 Próximos Pasos' :
                  locale === 'it' ? '📞 Prossimi Passi' :
                    locale === 'ar' ? '📞 الخطوات التالية' :
                      '📞 Next Steps'}
            </h3>
            {isCircuit ? (
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    {locale === 'fr' ? 'Nous avons reçu votre demande de réservation pour ce circuit' :
                      locale === 'es' ? 'Hemos recibido tu solicitud de reserva para este circuito' :
                        locale === 'it' ? 'Abbiamo ricevuto la tua richiesta di prenotazione per questo circuito' :
                          locale === 'ar' ? 'تلقينا طلب حجزك لهذه الجولة' :
                            "We've received your booking request for this circuit"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    {locale === 'fr' ? 'Notre équipe vous contactera sous peu pour discuter de votre itinéraire personnalisé et vous fournir un devis détaillé' :
                      locale === 'es' ? 'Nuestro equipo te contactará pronto para discutir tu itinerario personalizado y proporcionarte un presupuesto detallado' :
                        locale === 'it' ? 'Il nostro team ti contatterà a breve per discutere il tuo itinerario personalizzato e fornirti un preventivo dettagliato' :
                          locale === 'ar' ? 'سيتصل بك فريقنا قريبًا لمناقشة مسار رحلتك المخصص وتزويدك بعرض أسعار مفصل' :
                            'Our team will contact you shortly to discuss your personalized itinerary and provide you with a detailed quote'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    {locale === 'fr' ? 'Les tarifs et les options de paiement seront convenus lors de notre conversation' :
                      locale === 'es' ? 'Los precios y las opciones de pago se acordarán durante nuestra conversación' :
                        locale === 'it' ? 'I prezzi e le opzioni di pagamento saranno concordati durante la nostra conversazione' :
                          locale === 'ar' ? 'سيتم الاتفاق على الأسعار وخيارات الدفع خلال محادثتنا' :
                            'Pricing and payment options will be agreed upon during our conversation'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>
                    {locale === 'fr' ? 'Un email de confirmation avec tous les détails vous sera envoyé après notre discussion' :
                      locale === 'es' ? 'Se te enviará un email de confirmación con todos los detalles después de nuestra conversación' :
                        locale === 'it' ? 'Riceverai un\'email di conferma con tutti i dettagli dopo la nostra discussione' :
                          locale === 'ar' ? 'سيتم إرسال بريد إلكتروني تأكيد يحتوي على جميع التفاصيل بعد مناقشتنا' :
                            'A confirmation email with all details will be sent after our discussion'}
                  </span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    {locale === 'fr' ? 'Nous avons reçu votre commande et allons la traiter dans les plus brefs délais' :
                      locale === 'es' ? 'Hemos recibido tu pedido y lo procesaremos lo antes posible' :
                        locale === 'it' ? 'Abbiamo ricevuto il tuo ordine e lo elaboreremo al più presto' :
                          locale === 'ar' ? 'تلقينا طلبك وسنعالجه في أقرب وقت ممكن' :
                            "We've received your order and will process it as soon as possible"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    {locale === 'fr' ? 'Notre équipe vous contactera par téléphone ou par email pour confirmer les détails' :
                      locale === 'es' ? 'Nuestro equipo te contactará por teléfono o email para confirmar los detalles' :
                        locale === 'it' ? 'Il nostro team ti contatterà per telefono o email per confermare i dettagli' :
                          locale === 'ar' ? 'سيتصل بك فريقنا عبر الهاتف أو البريد الإلكتروني لتأكيد التفاصيل' :
                            'Our team will contact you by phone or email to confirm the details'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    {locale === 'fr' ? 'Le paiement en espèces sera effectué lors de la prise en charge' :
                      locale === 'es' ? 'El pago en efectivo se realizará en el momento de la recogida' :
                        locale === 'it' ? 'Il pagamento in contanti verrà effettuato al momento del ritiro' :
                          locale === 'ar' ? 'سيتم الدفع نقداً عند الاستلام' :
                            'Cash payment will be made upon pickup'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>
                    {locale === 'fr' ? 'Un email de confirmation avec tous les détails vous sera envoyé' :
                      locale === 'es' ? 'Se te enviará un email de confirmación con todos los detalles' :
                        locale === 'it' ? 'Riceverai un\'email di conferma con tutti i dettagli' :
                          locale === 'ar' ? 'سيتم إرسال بريد إلكتروني تأكيد يحتوي على جميع التفاصيل' :
                            'A confirmation email with all details will be sent to you'}
                  </span>
                </li>
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push(`/${locale}`)}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              {locale === 'fr' ? 'Retour à l\'Accueil' :
                locale === 'es' ? 'Volver al Inicio' :
                  locale === 'it' ? 'Torna alla Home' :
                    locale === 'ar' ? 'العودة إلى الصفحة الرئيسية' :
                      'Back to Home'}
            </Button>
            <Button
              onClick={() => router.push(`/${locale}/nos-excursions`)}
              size="lg"
              variant="outline"
            >
              {locale === 'fr' ? 'Voir Plus d\'Excursions' :
                locale === 'es' ? 'Ver Más Excursiones' :
                  locale === 'it' ? 'Vedi Altre Escursioni' :
                    locale === 'ar' ? 'عرض المزيد من الرحلات' :
                      'View More Excursions'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}