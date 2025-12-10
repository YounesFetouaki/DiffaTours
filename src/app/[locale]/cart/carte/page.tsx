'use client';

import Header from '@/components/sections/header';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslations } from '@/lib/i18n/hooks';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const { formatPrice } = useCurrency();
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-muted mb-6" />
            <h1 className="text-4xl font-display mb-4">{t('cart.empty.title')}</h1>
            <p className="text-muted mb-8">{t('cart.empty.description')}</p>
            <Button
              onClick={() => router.push(`/${locale}/nos-excursions`)}
              className="bg-primary hover:bg-primary/90 rounded-full"
            >
              {t('cart.empty.browseExcursions')}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground hover:text-primary mb-6 transition-colors rounded-full px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('cart.backButton')}</span>
          </button>

          <h1 className="text-4xl font-display mb-8">{t('cart.title')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[20px] shadow-md overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Image */}
                    <div className="relative w-full sm:w-32 h-32 flex-shrink-0">
                      <Image
                        src={item.excursionImage}
                        alt={item.excursionName}
                        fill
                        className="object-cover rounded-[20px]"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {item.excursionName}
                      </h3>
                      
                      <p className="text-sm text-muted mb-2">
                        <span className="font-medium">{t('cart.date')}:</span> {new Date(item.date).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>

                      {/* Age Groups */}
                      <div className="text-sm text-muted mb-2">
                        <span className="font-medium">{t('cart.people')}:</span>{' '}
                        {item.ageGroups['0-4'] > 0 && `${item.ageGroups['0-4']} ${t('cart.baby')}, `}
                        {item.ageGroups['4-12'] > 0 && `${item.ageGroups['4-12']} ${t('cart.child')}, `}
                        {item.ageGroups['adult']} ${t('cart.adult')}
                      </div>

                      {/* Selected Items */}
                      {item.selectedItems.length > 0 && (
                        <div className="text-sm text-muted mb-2">
                          <span className="font-medium">{t('cart.extras')}:</span>{' '}
                          {item.selectedItems.map(si => si.label).join(', ')}
                        </div>
                      )}

                      <div className="text-lg font-bold text-primary mt-2">
                        {formatPrice(item.total)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="self-start p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="text-sm text-destructive hover:underline rounded-full px-4 py-2"
              >
                {t('cart.clearAll')}
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[20px] shadow-md p-6 sticky top-32">
                <h2 className="text-2xl font-display mb-4">{t('cart.summary')}</h2>
                
                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span>{t('cart.items')}:</span>
                    <span>{cart.length}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>{t('cart.total')}:</span>
                  <span className="text-primary">{formatPrice(cartTotal)}</span>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                  size="lg"
                  onClick={() => router.push(`/${locale}/checkout`)}
                >
                  {t('cart.proceedToCheckout')}
                </Button>

                <button
                  onClick={() => router.push(`/${locale}/nos-excursions`)}
                  className="w-full mt-4 text-sm text-primary hover:underline rounded-full px-4 py-2"
                >
                  {t('cart.continueShopping')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}