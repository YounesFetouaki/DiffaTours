'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/sections/header';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useTranslations } from '@/lib/i18n/hooks';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Banknote, Info, AlertTriangle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

type AccommodationType = 'hotel' | 'riad';
type PaymentMethod = 'cash' | 'cmi';

// Helper function to safely get string value from field that might be a translation object
const getStringValue = (field: any, locale: string = 'en'): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.fr || field.es || field.it || '';
  }
  return String(field);
};

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { formatPrice, currency, exchangeRate, convertPrice } = useCurrency();
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [currentStep, setCurrentStep] = useState<'personal' | 'confirm'>('personal');
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [availabilityWarnings, setAvailabilityWarnings] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check if cart contains circuits
  const hasCircuits = cart.some(item => {
    const id = item.excursionId?.toLowerCase() || '';
    const name = item.excursionName?.toLowerCase() || '';
    // More precise circuit detection - check if it starts with 'circuit' or is in circuits section
    return id.startsWith('circuit-') ||
      id === 'circuit' ||
      item.excursionId?.includes('circuits/') ||
      (name.startsWith('circuit ') || name === 'circuit');
  });

  // Check if prices are hidden (total is 0)
  const hasPricesHidden = cartTotal === 0;

  // Show payment methods when there's a valid price and no circuits
  const shouldShowPaymentMethods = !hasCircuits && cartTotal > 0;

  // Debug logging
  useEffect(() => {
    console.log('=== Checkout Debug Info ===');
    console.log('Cart items:', cart.map(item => ({
      id: item.excursionId,
      name: item.excursionName,
      total: item.total
    })));
    console.log('hasCircuits:', hasCircuits);
    console.log('cartTotal:', cartTotal);
    console.log('hasPricesHidden:', hasPricesHidden);
    console.log('shouldShowPaymentMethods:', shouldShowPaymentMethods);
  }, [cart, hasCircuits, cartTotal, hasPricesHidden, shouldShowPaymentMethods]);

  // Check if CMI payment is enabled (based on environment variable)
  const [isCMIEnabled, setIsCMIEnabled] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    passport: '',
    city: '',
    accommodationType: 'hotel' as AccommodationType,
    hotelName: '',
    address: '',
    ageConfirmed: false,
    termsAccepted: false,
    paymentMethod: 'cash' as PaymentMethod,
  });

  // Auto-fill form with user data when logged in
  useEffect(() => {
    if (isUserLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.primaryEmailAddress?.emailAddress || prev.email,
        phone: user.primaryPhoneNumber?.phoneNumber || prev.phone,
      }));
    }
  }, [isUserLoaded, user]);

  // Check if CMI is configured
  useEffect(() => {
    // Check if CMI credentials are available
    fetch('/api/payment/cmi/status')
      .then(res => res.json())
      .then(data => setIsCMIEnabled(data.enabled))
      .catch(() => setIsCMIEnabled(false));
  }, []);

  // Wait for cart to load from localStorage before checking
  useEffect(() => {
    // Small delay to ensure cart is loaded from localStorage
    const timer = setTimeout(() => {
      setIsCartLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if cart is empty (only after cart is loaded and not confirming order)
  useEffect(() => {
    if (isCartLoaded && cart.length === 0 && !isConfirmingOrder) {
      router.push(`/${locale}/cart`);
    }
  }, [cart, locale, router, isCartLoaded, isConfirmingOrder]);

  // Check availability for all cart items when moving to confirm step
  const checkAllAvailability = async () => {
    setCheckingAvailability(true);
    const warnings: string[] = [];

    try {
      for (const item of cart) {
        const totalPeople = item.ageGroups['0-4'] + item.ageGroups['4-12'] + item.ageGroups['adult'];

        const response = await fetch(
          `/api/capacity/check?excursion_id=${encodeURIComponent(item.excursionId)}&date=${item.date}&people_count=${totalPeople}`
        );

        if (response.ok) {
          const data = await response.json();

          const excursionName = getStringValue(item.excursionName, locale);

          if (!data.canBook) {
            warnings.push(
              locale === 'fr'
                ? `${excursionName} (${new Date(item.date).toLocaleDateString(locale)}): Places insuffisantes`
                : `${excursionName} (${new Date(item.date).toLocaleDateString(locale)}): Insufficient spots`
            );
          } else if (data.availabilityStatus === 'limited' && data.hasCapacityLimit) {
            warnings.push(
              locale === 'fr'
                ? `${excursionName} (${new Date(item.date).toLocaleDateString(locale)}): Seulement ${data.availableSpots} places restantes`
                : `${excursionName} (${new Date(item.date).toLocaleDateString(locale)}): Only ${data.availableSpots} spots remaining`
            );
          }
        }
      }
    } catch (error) {
      console.error('Availability check failed:', error);
    } finally {
      setCheckingAvailability(false);
    }

    setAvailabilityWarnings(warnings);
    return warnings;
  };

  const handleInputChange = (field: string, value: any) => {
    // Phone validation: only allow numbers, spaces, +, -, (, )
    if (field === 'phone') {
      const phoneRegex = /^[0-9\s+\-()]*$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid characters
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePersonalInfo = () => {
    if (!formData.firstName.trim()) {
      toast.error(t('checkout.validation.firstName'));
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error(t('checkout.validation.lastName'));
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error(t('checkout.validation.phone'));
      return false;
    }
    // Validate phone format: must be at least 8 digits
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      toast.error(
        locale === 'fr'
          ? 'Le numéro de téléphone doit contenir au moins 8 chiffres'
          : locale === 'es'
            ? 'El número de teléfono debe contener al menos 8 dígitos'
            : locale === 'it'
              ? 'Il numero di telefono deve contenere almeno 8 cifre'
              : 'Phone number must contain at least 8 digits'
      );
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error(t('checkout.validation.email'));
      return false;
    }
    if (!formData.passport.trim()) {
      toast.error(t('checkout.validation.passport'));
      return false;
    }
    if (!formData.city.trim()) {
      toast.error(t('checkout.validation.city'));
      return false;
    }
    if (!formData.ageConfirmed) {
      toast.error(t('checkout.validation.age'));
      return false;
    }
    if (!formData.termsAccepted) {
      toast.error(t('checkout.validation.terms'));
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (validatePersonalInfo()) {
      // Check availability before moving to confirm step
      const warnings = await checkAllAvailability();

      // Block if any items are unavailable (canBook = false)
      const hasUnavailableItems = warnings.some(w =>
        w.includes('insuffisantes') || w.includes('Insufficient')
      );

      if (hasUnavailableItems) {
        toast.error(
          locale === 'fr'
            ? 'Certaines excursions ne sont plus disponibles. Veuillez mettre à jour votre panier.'
            : 'Some excursions are no longer available. Please update your cart.'
        );
        return;
      }

      setCurrentStep('confirm');
    }
  };

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsConfirmingOrder(true);

    try {
      const orderData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        passport: formData.passport.trim(),
        city: formData.city.trim(),
        accommodationType: formData.accommodationType,
        hotelName: formData.hotelName?.trim() || null,
        address: formData.address?.trim() || null,
        paymentMethod: hasCircuits ? 'cash' : formData.paymentMethod,
        cartItems: JSON.stringify(cart),
        totalMad: cartTotal,
        userClerkId: user?.id || undefined,
        locale: locale, // Add locale to order data
        currency,
        exchangeRate,
        totalInCurrency: convertPrice(cartTotal),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const order = await response.json();

      // For circuits, always go to confirmation (no payment gateway)
      if (hasCircuits) {
        clearCart();
        router.push(`/${locale}/order-confirmation/${order.orderNumber}`);
        return;
      }

      // For non-circuits with CMI payment
      if (formData.paymentMethod === 'cmi') {
        if (order.paymentUrl) {
          window.location.href = order.paymentUrl;
          return;
        } else {
          throw new Error('Payment URL not provided for online payment');
        }
      }

      // For cash payment
      clearCart();
      router.push(`/${locale}/order-confirmation/${order.orderNumber}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
      setIsSubmitting(false);
      setIsConfirmingOrder(false);
    }
  };

  // Show loading state while cart is loading
  if (!isCartLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main
        className="flex-1 pt-40 pb-16 px-4 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1701534008693-0eee0632d47a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2Vic2l0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => currentStep === 'personal' ? router.push(`/${locale}/cart`) : setCurrentStep('personal')}
            className="flex items-center gap-2 text-foreground hover:text-primary mb-6 transition-colors rounded-full px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">
              {currentStep === 'personal'
                ? (locale === 'fr' ? 'Retour au panier' : 'Back to Cart')
                : (locale === 'fr' ? 'Retour aux informations' : 'Back to Information')}
            </span>
          </button>

          {/* Tabs */}
          <div className="flex justify-center mb-8 border-b border-border">
            <button
              onClick={() => setCurrentStep('personal')}
              className={`px-6 py-3 font-medium transition-colors rounded-t-[20px] ${currentStep === 'personal'
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted'
                }`}
            >
              {t('checkout.tabs.personal')}
            </button>
            <button
              onClick={() => currentStep === 'confirm' && setCurrentStep('confirm')}
              className={`px-6 py-3 font-medium transition-colors rounded-t-[20px] ${currentStep === 'confirm'
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted'
                }`}
              disabled={currentStep === 'personal'}
            >
              {t('checkout.tabs.confirm')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 'personal' ? (
                <div className="bg-white rounded-[20px] shadow-md p-6">
                  <h2 className="text-2xl font-display mb-6">{t('checkout.personalInfo.title')}</h2>

                  <div className="space-y-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.firstName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.lastName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+212 XXX XXX XXX"
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                      <p className="text-xs text-muted mt-1">
                        {locale === 'fr'
                          ? 'Exemple: +212 600 123 456'
                          : locale === 'es'
                            ? 'Ejemplo: +212 600 123 456'
                            : locale === 'it'
                              ? 'Esempio: +212 600 123 456'
                              : 'Example: +212 600 123 456'}
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Passport or CIN */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.passport')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.passport}
                        onChange={(e) => handleInputChange('passport', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.city')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Accommodation Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.accommodationType')}
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="accommodationType"
                            value="hotel"
                            checked={formData.accommodationType === 'hotel'}
                            onChange={(e) => handleInputChange('accommodationType', e.target.value)}
                            className="mr-2"
                          />
                          {t('checkout.personalInfo.hotel')}
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="accommodationType"
                            value="riad"
                            checked={formData.accommodationType === 'riad'}
                            onChange={(e) => handleInputChange('accommodationType', e.target.value)}
                            className="mr-2"
                          />
                          {t('checkout.personalInfo.riad')}
                        </label>
                      </div>
                    </div>

                    {/* Hotel Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.hotelName')}
                      </label>
                      <input
                        type="text"
                        value={formData.hotelName}
                        onChange={(e) => handleInputChange('hotelName', e.target.value)}
                        placeholder={t('checkout.personalInfo.hotelNamePlaceholder')}
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('checkout.personalInfo.address')}
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder={t('checkout.personalInfo.addressPlaceholder')}
                        className="w-full px-4 py-2 border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Age Confirmation */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.ageConfirmed}
                          onChange={(e) => handleInputChange('ageConfirmed', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{t('checkout.personalInfo.ageConfirm')} <span className="text-red-500">*</span></span>
                      </label>
                    </div>

                    {/* Terms */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.termsAccepted}
                          onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {t('checkout.personalInfo.termsAccept')}{' '}
                          <a href={`/${locale}/terms`} className="text-primary hover:underline">
                            {t('checkout.personalInfo.termsLink')}
                          </a>
                          <span className="text-red-500"> *</span>
                        </span>
                      </label>
                    </div>

                    {/* Continue Button */}
                    <Button
                      onClick={handleContinue}
                      disabled={checkingAvailability}
                      className="w-full bg-primary hover:bg-primary/90 text-white mt-6 rounded-full"
                      size="lg"
                    >
                      {checkingAvailability
                        ? (locale === 'fr' ? 'Vérification de la disponibilité...' : 'Checking availability...')
                        : t('checkout.continue')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Availability Warnings */}
                  {availabilityWarnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-[20px] p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-yellow-800 mb-2">
                            {locale === 'fr' ? 'Avertissements de disponibilité' : 'Availability Warnings'}
                          </h3>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {availabilityWarnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Information Summary */}
                  <div className="bg-white rounded-[20px] shadow-md p-6">
                    <h3 className="text-xl font-display mb-4">{t('checkout.confirm.information')}</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">{t('checkout.personalInfo.name')}:</span> {formData.firstName} {formData.lastName}</p>
                      <p><span className="font-medium">{t('checkout.personalInfo.email')}:</span> {formData.email}</p>
                      <p><span className="font-medium">{t('checkout.personalInfo.phone')}:</span> {formData.phone}</p>
                      <p><span className="font-medium">{t('checkout.personalInfo.passport')}:</span> {formData.passport}</p>
                      <p><span className="font-medium">{t('checkout.personalInfo.type')}:</span> {formData.accommodationType === 'hotel' ? t('checkout.personalInfo.hotel') : t('checkout.personalInfo.riad')}</p>
                      {formData.hotelName && <p><span className="font-medium">{t('checkout.personalInfo.hotelName')}:</span> {formData.hotelName}</p>}
                      <p><span className="font-medium">{t('checkout.personalInfo.city')}:</span> {formData.city}</p>
                      {formData.address && <p><span className="font-medium">{t('checkout.personalInfo.address')}:</span> {formData.address}</p>}
                    </div>
                  </div>

                  {/* Payment Method - Hidden for circuits */}
                  {!hasCircuits && !hasPricesHidden && (
                    <div className="bg-white rounded-[20px] shadow-md p-6">
                      <h3 className="text-xl font-display mb-4">
                        {locale === 'fr' ? 'Méthode de paiement' : 'Payment Method'}
                      </h3>
                      <div className="space-y-4">
                        {/* Cash Payment */}
                        <label className={`flex items-start gap-3 p-4 border rounded-[20px] cursor-pointer transition-colors ${formData.paymentMethod === 'cash'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                          }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={formData.paymentMethod === 'cash'}
                            onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Banknote className="w-5 h-5 text-primary" />
                              <span className="font-medium">
                                {locale === 'fr' ? 'Paiement en espèces' : 'Cash Payment'}
                              </span>
                            </div>
                            <p className="text-sm text-muted">
                              {locale === 'fr'
                                ? 'Payez en espèces lors de la prise en charge'
                                : 'Pay in cash upon pickup'}
                            </p>
                          </div>
                        </label>

                        {/* CMI Online Payment */}
                        <label className={`flex items-start gap-3 p-4 border rounded-[20px] transition-colors ${!isCMIEnabled
                            ? 'opacity-50 cursor-not-allowed bg-gray-50'
                            : formData.paymentMethod === 'cmi'
                              ? 'border-primary bg-primary/5 cursor-pointer'
                              : 'border-border hover:border-primary/50 cursor-pointer'
                          }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cmi"
                            checked={formData.paymentMethod === 'cmi'}
                            onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
                            disabled={!isCMIEnabled}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-5 h-5 text-primary" />
                              <span className="font-medium">
                                {locale === 'fr' ? 'Paiement en ligne CMI' : 'CMI Online Payment'}
                              </span>
                              {!isCMIEnabled && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                  {locale === 'fr' ? 'Bientôt disponible' : 'Coming Soon'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted">
                              {locale === 'fr'
                                ? 'Payez en ligne de manière sécurisée avec votre carte bancaire'
                                : 'Pay online securely with your credit card'}
                            </p>
                            {!isCMIEnabled && (
                              <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-[20px] text-xs text-blue-700">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>
                                  {locale === 'fr'
                                    ? 'Le paiement en ligne sera bientôt disponible. Pour le moment, veuillez utiliser le paiement en espèces.'
                                    : 'Online payment will be available soon. For now, please use cash payment.'}
                                </span>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Circuit Reservation Notice */}
                  {(hasCircuits || hasPricesHidden) && (
                    <div className="bg-primary/10 border border-primary rounded-[20px] p-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-primary mb-2">
                            {locale === 'fr' ? 'Réservation de circuit' : 'Circuit Reservation'}
                          </h3>
                          <p className="text-sm text-foreground">
                            {locale === 'fr'
                              ? 'Votre demande de réservation sera envoyée à notre équipe. Nous vous contacterons dans les plus brefs délais pour confirmer les détails, la disponibilité et le prix de votre circuit.'
                              : 'Your reservation request will be sent to our team. We will contact you as soon as possible to confirm the details, availability and price of your circuit.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="bg-white rounded-[20px] shadow-md p-6">
                    <h3 className="text-xl font-display mb-4">{t('checkout.confirm.orderItems')}</h3>
                    <div className="space-y-4">
                      {cart.map((item) => {
                        const excursionName = getStringValue(item.excursionName, locale);
                        const isCircuit = item.excursionId?.toLowerCase().includes('circuit') ||
                          item.excursionName?.toLowerCase().includes('circuit');

                        return (
                          <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <Image
                                src={item.excursionImage}
                                alt={excursionName}
                                fill
                                className="object-cover rounded-[20px]"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm mb-1">{new Date(item.date).toLocaleDateString(locale)}</p>
                              <h4 className="font-semibold mb-1">{excursionName}</h4>
                              {!isCircuit && <p className="text-sm font-bold text-primary">{formatPrice(item.total)}</p>}
                              {isCircuit && (
                                <p className="text-sm font-semibold text-foreground italic">
                                  {locale === 'fr' ? 'Prix sur demande' : 'Price on request'}
                                </p>
                              )}
                              {item.selectedItems.length > 0 && (
                                <p className="text-xs text-muted mt-1">
                                  {t('checkout.confirm.youSelected')}: {item.selectedItems.map(si => getStringValue(si.label, locale)).join(', ')}
                                </p>
                              )}
                              {!isCircuit && (
                                <p className="text-xs text-muted">
                                  {t('checkout.confirm.adults')}: ({item.ageGroups['adult']} * {formatPrice(item.priceMAD)})
                                </p>
                              )}
                            </div>
                            {!isCircuit && (
                              <div className="text-right">
                                <p className="font-bold">{formatPrice(item.total)}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[20px] shadow-md p-6 sticky top-32">
                <h3 className="text-xl font-display mb-4">{t('checkout.summary.title')}</h3>

                {!hasCircuits && !hasPricesHidden && (
                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('checkout.summary.total')}:</span>
                      <span className="text-primary">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                )}

                {(hasCircuits || hasPricesHidden) && (
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-sm text-muted italic text-center">
                      {locale === 'fr'
                        ? 'Le prix sera confirmé par notre équipe'
                        : 'Price will be confirmed by our team'}
                    </p>
                  </div>
                )}

                {currentStep === 'confirm' && (
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                    size="lg"
                  >
                    {isSubmitting
                      ? (locale === 'fr' ? 'Traitement...' : 'Processing...')
                      : (hasCircuits || hasPricesHidden)
                        ? (locale === 'fr' ? 'Envoyer la demande' : 'Send Request')
                        : t('checkout.confirmButton')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}