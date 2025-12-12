'use client';

import Header from '@/components/sections/header';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function CartPage() {
  const { cart, removeFromCart, cartTotal, cartCount } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const emptyCartTitle = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Votre panier est vide';
    if (l === 'es') return 'Tu carrito está vacío';
    if (l === 'ar') return 'سلة التسوق فارغة';
    if (l === 'it') return 'Il tuo carrello è vuoto';
    return 'Your cart is empty';
  })();

  const emptyCartMessage = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Découvrez nos excursions et ajoutez-les à votre panier';
    if (l === 'es') return 'Descubre nuestras excursiones y añádelas a tu carrito';
    if (l === 'ar') return 'اكتشف رحلاتنا وأضفها إلى سلة التسوق';
    if (l === 'it') return 'Scopri le nostre escursioni e aggiungile al carrello';
    return 'Discover our excursions and add them to your cart';
  })();

  const viewExcursionsText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Voir les excursions';
    if (l === 'es') return 'Ver excursiones';
    if (l === 'ar') return 'عرض الرحلات';
    if (l === 'it') return 'Visualizza escursioni';
    return 'View Excursions';
  })();

  // Check if any items have contact-based pricing OR are circuits
  const hasContactPricing = cart.some(item => item.priceMAD === 0 || item.total === 0);
  const hasCircuits = cart.some(item => {
    // Check if excursionId or excursionName contains 'circuit'
    const id = item.excursionId?.toLowerCase() || '';
    const name = item.excursionName?.toLowerCase() || '';
    return id.includes('circuit') || name.includes('circuit');
  });
  const shouldShowContact = hasContactPricing || hasCircuits;

  if (cartCount === 0) {
    return (
      <div
        className="min-h-screen section-overlay"
        style={{
          backgroundImage: 'url(https://miro.medium.com/v2/1*iAu65xDmvpVdBJgps6EDEw.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <Header />
        <div className="container mx-auto px-4 pt-40 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingBag className="w-24 h-24 mx-auto text-white opacity-50" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">
              {emptyCartTitle}
            </h1>
            <p className="text-lg text-white/90 mb-8">
              {emptyCartMessage}
            </p>
            <Button
              onClick={() => router.push(`/${locale}/nos-excursions`)}
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full"
            >
              {viewExcursionsText}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cartTitle = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Votre Panier';
    if (l === 'es') return 'Tu Carrito';
    if (l === 'ar') return 'سلة التسوق';
    if (l === 'it') return 'Il Tuo Carrello';
    return 'Your Cart';
  })();

  const itemsInCart = (() => {
    const l = String(locale);
    if (l === 'fr') return `${cartCount} article${cartCount > 1 ? 's' : ''} dans votre panier`;
    if (l === 'es') return `${cartCount} artículo${cartCount > 1 ? 's' : ''} en tu carrito`;
    if (l === 'ar') return `${cartCount} عنصر في سلة التسوق`;
    if (l === 'it') return `${cartCount} articolo${cartCount > 1 ? 'i' : ''} nel tuo carrello`;
    return `${cartCount} item${cartCount > 1 ? 's' : ''} in your cart`;
  })();

  const dateText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Date:';
    if (l === 'es') return 'Fecha:';
    if (l === 'ar') return 'التاريخ:';
    if (l === 'it') return 'Data:';
    return 'Date:';
  })();

  const optionsText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Options:';
    if (l === 'es') return 'Opciones:';
    if (l === 'ar') return 'الخيارات:';
    if (l === 'it') return 'Opzioni:';
    return 'Options:';
  })();

  const basePriceText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Prix unitaire:';
    if (l === 'es') return 'Precio base:';
    if (l === 'ar') return 'السعر الأساسي:';
    if (l === 'it') return 'Prezzo base:';
    return 'Base price:';
  })();

  const priceOnRequestText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Prix sur demande';
    if (l === 'es') return 'Precio a consultar';
    if (l === 'ar') return 'السعر عند الطلب';
    if (l === 'it') return 'Prezzo su richiesta';
    return 'Price on request';
  })();

  const summaryText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Résumé';
    if (l === 'es') return 'Resumen';
    if (l === 'ar') return 'الملخص';
    if (l === 'it') return 'Riepilogo';
    return 'Summary';
  })();

  const subtotalText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Sous-total';
    if (l === 'es') return 'Subtotal';
    if (l === 'ar') return 'المجموع الفرعي';
    if (l === 'it') return 'Subtotale';
    return 'Subtotal';
  })();

  const itemsText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Articles';
    if (l === 'es') return 'Artículos';
    if (l === 'ar') return 'العناصر';
    if (l === 'it') return 'Articoli';
    return 'Items';
  })();

  const totalText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Total';
    if (l === 'es') return 'Total';
    if (l === 'ar') return 'المجموع';
    if (l === 'it') return 'Totale';
    return 'Total';
  })();

  const proceedToCheckoutText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Procéder au paiement';
    if (l === 'es') return 'Proceder al pago';
    if (l === 'ar') return 'متابعة الدفع';
    if (l === 'it') return 'Procedi al pagamento';
    return 'Proceed to Checkout';
  })();

  const reserveNowText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Réserver maintenant';
    if (l === 'es') return 'Reservar ahora';
    if (l === 'ar') return 'احجز الآن';
    if (l === 'it') return 'Prenota ora';
    return 'Reserve Now';
  })();

  const continueShoppingText = (() => {
    const l = String(locale);
    if (l === 'fr') return 'Continuer les achats';
    if (l === 'es') return 'Continuar comprando';
    if (l === 'ar') return 'متابعة التسوق';
    if (l === 'it') return 'Continua lo shopping';
    return 'Continue Shopping';
  })();

  const customQuoteRequiredTitle = (() => {
    const l = String(locale);
    if (l === 'fr') return hasCircuits ? 'Réservation de circuit' : 'Devis personnalisé requis';
    if (l === 'es') return hasCircuits ? 'Reserva de circuito' : 'Presupuesto personalizado requerido';
    if (l === 'ar') return hasCircuits ? 'حجز الدائرة' : 'مطلوب عرض أسعار مخصص';
    if (l === 'it') return hasCircuits ? 'Prenotazione circuito' : 'Preventivo personalizzato richiesto';
    return hasCircuits ? 'Circuit Reservation' : 'Custom quote required';
  })();

  const customQuoteMessage = (() => {
    const l = String(locale);
    if (l === 'fr') {
      return hasCircuits
        ? 'Votre demande de réservation sera envoyée à notre équipe. Nous vous recontacterons dans les plus brefs délais pour confirmer les détails et le prix.'
        : 'Certains articles nécessitent un devis personnalisé. Veuillez nous contacter pour finaliser votre réservation.';
    }
    if (l === 'es') {
      return hasCircuits
        ? 'Tu solicitud de reserva será enviada a nuestro equipo. Te contactaremos lo antes posible para confirmar los detalles y el precio.'
        : 'Algunos artículos requieren un presupuesto personalizado. Por favor contáctanos para finalizar tu reserva.';
    }
    if (l === 'ar') {
      return hasCircuits
        ? 'سيتم إرسال طلب الحجز الخاص بك إلى فريقنا. سنتواصل معك في أقرب وقت ممكن لتأكيد التفاصيل والسعر.'
        : 'بعض العناصر تتطلب عرض أسعار مخصص. يرجى الاتصال بنا لإتمام حجزك.';
    }
    if (l === 'it') {
      return hasCircuits
        ? 'La tua richiesta di prenotazione sarà inviata al nostro team. Ti contatteremo il prima possibile per confermare i dettagli e il prezzo.'
        : 'Alcuni articoli richiedono un preventivo personalizzato. Contattaci per finalizzare la prenotazione.';
    }
    return hasCircuits
      ? 'Your reservation request will be sent to our team. We will contact you as soon as possible to confirm the details and price.'
      : 'Some items require a custom quote. Please contact us to finalize your booking.';
  })();

  return (
    <div
      className="min-h-screen section-overlay"
      style={{
        backgroundImage: 'url(https://miro.medium.com/v2/1*iAu65xDmvpVdBJgps6EDEw.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />
      <div className="container mx-auto px-4 pt-40 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-white">
              {cartTitle}
            </h1>
            <p className="text-lg text-white/90">
              {itemsInCart}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const isContactPricing = item.priceMAD === 0 || item.total === 0;
                const isCircuit = item.excursionId?.toLowerCase().includes('circuit') ||
                  item.excursionName?.toLowerCase().includes('circuit');

                return (
                  <div
                    key={item.id}
                    className="bg-white/95 backdrop-blur-sm rounded-[20px] shadow-md overflow-hidden border border-white/20"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
                        <Image
                          src={item.excursionImage}
                          alt={item.excursionName}
                          fill
                          className="object-cover"
                        />
                        {isCircuit && (
                          <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Circuit
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{item.excursionName}</h3>
                            <p className="text-sm text-muted mb-2">
                              {dateText} {new Date(item.date).toLocaleDateString(locale)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Age Groups */}
                        <div className="space-y-1 mb-3">
                          {item.ageGroups['0-4'] > 0 && (
                            <p className="text-sm text-muted">
                              {String(locale) === 'fr' ? '0-4 ans:' : String(locale) === 'es' ? '0-4 años:' : String(locale) === 'ar' ? '0-4 سنوات:' : '0-4 years:'} {item.ageGroups['0-4']}
                            </p>
                          )}
                          {item.ageGroups['4-12'] > 0 && (
                            <p className="text-sm text-muted">
                              {String(locale) === 'fr' ? '4-12 ans:' : String(locale) === 'es' ? '4-12 años:' : String(locale) === 'ar' ? '4-12 سنة:' : '4-12 years:'} {item.ageGroups['4-12']}
                            </p>
                          )}
                          {item.ageGroups['adult'] > 0 && (
                            <p className="text-sm text-muted">
                              {String(locale) === 'fr' ? 'Adultes:' : String(locale) === 'es' ? 'Adultos:' : String(locale) === 'ar' ? 'البالغين:' : 'Adults:'} {item.ageGroups['adult']}
                            </p>
                          )}
                        </div>

                        {/* Selected Items */}
                        {item.selectedItems.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">
                              {optionsText}
                            </p>
                            <ul className="text-sm text-muted space-y-1">
                              {item.selectedItems.map((selectedItem) => (
                                <li key={selectedItem.id}>
                                  • {selectedItem.label}
                                  {!isContactPricing && !isCircuit && ` (+${formatPrice(selectedItem.price)})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex justify-between items-center pt-3 border-t border-border">
                          {isContactPricing || isCircuit ? (
                            <span className="text-lg font-semibold text-foreground italic">
                              {priceOnRequestText}
                            </span>
                          ) : (
                            <>
                              <span className="text-sm text-muted">
                                {basePriceText} {formatPrice(item.priceMAD)}
                              </span>
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(item.total)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-[20px] shadow-md border border-white/20 p-6 sticky top-32">
                <h2 className="text-2xl font-bold mb-6">
                  {summaryText}
                </h2>

                {shouldShowContact ? (
                  <div className="mb-6">
                    <div className="bg-primary/10 border border-primary rounded-[20px] p-4 mb-4">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {customQuoteRequiredTitle}
                      </p>
                      <p className="text-sm text-muted">
                        {customQuoteMessage}
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(`/${locale}/checkout`)}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                      size="lg"
                    >
                      {reserveNowText}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6 pb-6 border-b border-border">
                      <div className="flex justify-between text-muted">
                        <span>{subtotalText}</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted">
                        <span>{itemsText}</span>
                        <span>{cartCount}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-6 text-xl font-bold">
                      <span>{totalText}</span>
                      <span className="text-primary">{formatPrice(cartTotal)}</span>
                    </div>

                    <Button
                      onClick={() => router.push(`/${locale}/checkout`)}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                      size="lg"
                    >
                      {proceedToCheckoutText}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </>
                )}

                <Button
                  onClick={() => router.push(`/${locale}/nos-excursions`)}
                  variant="outline"
                  className="w-full mt-3 rounded-full"
                >
                  {continueShoppingText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}