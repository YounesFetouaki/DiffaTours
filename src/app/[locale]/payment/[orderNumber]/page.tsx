'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Order {
  id: number;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  totalMad: number;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = params.locale as string;
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/number/${orderNumber}`);
        
        if (!response.ok) {
          throw new Error('Order not found');
        }

        const orderData = await response.json();
        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const handlePayNow = async () => {
    if (!order) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          amount: order.totalMad,
          email: order.email,
          customerName: `${order.firstName} ${order.lastName}`,
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }

      const data = await response.json();

      // Redirect to CMI payment gateway
      window.location.href = data.redirectUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/mes-reservations`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">{t('payment.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-4">{t('payment.orderNotFound')}</h1>
          <p className="text-muted mb-6">{error || t('payment.orderNotFoundMessage')}</p>
          <Button onClick={() => router.push(`/${locale}`)}>{t('payment.returnHome')}</Button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md mb-6 p-6 border-t-4 border-pink-500">
          <h1 className="text-3xl font-bold text-pink-500">{t('payment.title')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md p-6">
              <div className="mb-6 pb-4 border-b-2 border-pink-500">
                <h2 className="text-xl font-bold text-pink-500 mb-2">{t('payment.paymentDetails')}</h2>
                <p className="text-sm text-gray-600">{currentDate}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">{t('payment.paymentMethods')}</label>
                <div className="flex gap-2 mb-4">
                  <div className="h-8 w-14 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div className="h-8 w-14 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                  <div className="h-8 w-14 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">CMI</div>
                  <div className="h-8 w-14 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>{t('payment.securePaymentNotice')}</strong>
                </p>
                <p className="text-sm text-blue-700">
                  {t('payment.redirectNotice')}
                </p>
              </div>

              <p className="text-xs text-gray-600 mb-6 italic">{t('payment.confidentialityNotice')}</p>

              <div className="flex gap-4">
                <Button
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                >
                  {isProcessing ? t('payment.processing') : t('payment.payNow')}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  size="lg"
                >
                  {t('payment.cancel')}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-600">
              <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">CMI</div>
              <span>{t('payment.cmiFooter')}</span>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow-md p-6">
              <h3 className="text-lg font-bold text-pink-500 mb-4 pb-3 border-b border-gray-200">
                {t('payment.orderDetails')}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">{t('payment.identifier')}</span>
                  <span className="ml-2">:</span>
                  <p className="mt-1">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="font-semibold">{t('payment.amount')}</span>
                  <span className="ml-2">:</span>
                  <p className="mt-1 text-lg font-bold">{order.totalMad.toFixed(2)} MAD</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md p-6">
              <h3 className="text-lg font-bold text-pink-500 mb-4 pb-3 border-b border-gray-200">
                {t('payment.merchantDetails')}
              </h3>
              <div className="text-sm">
                <span className="font-semibold">{t('payment.merchantName')}</span>
                <span className="ml-2">:</span>
                <p className="mt-1">DIFFA TOURS (600003685)</p>
              </div>
            </div>

            <div className="bg-white shadow-md p-6">
              <h3 className="text-lg font-bold text-pink-500 mb-4 pb-3 border-b border-gray-200">
                {t('payment.clientInfo')}
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">{t('payment.name')}</span>
                  <span className="ml-2">:</span>
                  <span className="ml-2">{order.firstName} {order.lastName}</span>
                </div>
                {order.address && (
                  <div>
                    <span className="font-semibold">{t('payment.address')}</span>
                    <span className="ml-2">:</span>
                    <span className="ml-2">{order.address}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold">{t('payment.phone')}</span>
                  <span className="ml-2">:</span>
                  <span className="ml-2">{order.phone}</span>
                </div>
                <div>
                  <span className="font-semibold">{t('payment.email')}</span>
                  <span className="ml-2">:</span>
                  <span className="ml-2">{order.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="h-10 px-3 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                Verified by VISA
              </div>
              <div className="h-10 px-3 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                MasterCard SecureCode
              </div>
              <div className="h-10 px-3 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-xs font-bold">
                Norton Secured
              </div>
              <div className="h-10 px-3 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                PCI DSS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}