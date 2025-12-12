'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/hooks';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/sections/header';
import Image from 'next/image';
import { Calendar, MapPin, Clock, Users, Star, ArrowLeft, Facebook, Twitter, Instagram, Linkedin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { WishlistButton } from '@/components/WishlistButton';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';

// Helper function to safely get string value from field that might be a translation object
const getStringValue = (field: any, locale: string = 'en'): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.fr || field.es || field.it || '';
  }
  return String(field);
};

// Helper function to extract array items
const getLocalizedArray = (field: any, locale: string): string[] => {
  if (!field || !Array.isArray(field)) return [];
  return field.map(item => getStringValue(item, locale)).filter(Boolean);
};

// Helper function to check if a date is available based on availableDays
const isDateAvailable = (dateString: string, availableDays?: string[]): boolean => {
  if (!availableDays || availableDays.length === 0 || availableDays.includes('everyday')) {
    return true;
  }

  const date = new Date(dateString);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return availableDays.includes(dayOfWeek);
};

// Helper function to format available days for display
const formatAvailableDays = (days?: string[], locale?: string): string => {
  if (!days || days.length === 0 || days.includes('everyday')) {
    return locale === 'fr' ? 'Tous les jours' : 'Every day';
  }

  const dayNames: Record<string, Record<string, string>> = {
    monday: { fr: 'Lundi', en: 'Monday' },
    tuesday: { fr: 'Mardi', en: 'Tuesday' },
    wednesday: { fr: 'Mercredi', en: 'Wednesday' },
    thursday: { fr: 'Jeudi', en: 'Thursday' },
    friday: { fr: 'Vendredi', en: 'Friday' },
    saturday: { fr: 'Samedi', en: 'Saturday' },
    sunday: { fr: 'Dimanche', en: 'Sunday' }
  };

  const lang = locale || 'en';
  return days.map(d => dayNames[d]?.[lang] || d).join(', ');
};

export default function ExcursionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = params.locale as string;
  const t = useTranslations();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [ageGroups, setAgeGroups] = useState({
    '0-4': 0,
    '4-12': 0,
    'adult': 1
  });
  const [excursion, setExcursion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrice, setShowPrice] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check if this is a circuit excursion
  const isCircuit = excursion ? (
    excursion.id?.toLowerCase().startsWith('circuit-') ||
    excursion.id === 'circuit' ||
    excursion.id?.includes('circuits/') ||
    getStringValue(excursion.name, locale).toLowerCase().startsWith('circuit ')
  ) : false;

  // Fetch excursion data from API
  useEffect(() => {
    const fetchExcursion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/excursions/${slug}`);

        if (!response.ok) {
          throw new Error('Excursion not found');
        }

        const result = await response.json();
        setExcursion(result.data);

        // Fetch price visibility settings
        const settingsResponse = await fetch('/api/excursion-settings');
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          const section = result.data.section?.toLowerCase();
          const setting = settings.find((s: any) => s.section === section);
          if (setting) {
            setShowPrice(setting.showPrice);
          }
        }

        // Initialize selected items
        if (result.data.items) {
          const initial: Record<string, boolean> = {};
          result.data.items.forEach((item: any) => {
            initial[item.id] = item.defaultChecked;
          });
          setSelectedItems(initial);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExcursion();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f7fb] flex flex-col">
        <Header />
        <div className="flex-1 pt-40 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !excursion) {
    return (
      <div className="min-h-screen bg-[#f0f7fb] flex flex-col">
        <Header />
        <div className="flex-1 pt-40 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-display mb-4">{t('excursionDetail.notFound.title')}</h1>
            <p className="text-muted mb-6">{t('excursionDetail.notFound.description')}</p>
            <Button onClick={() => router.push(`/${locale}/nos-excursions`)}>
              {locale === 'fr' ? 'Voir les excursions' : 'View Excursions'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    // Calculate base price per person type
    const totalPeople = ageGroups['0-4'] + ageGroups['4-12'] + ageGroups['adult'];

    if (totalPeople === 0) return 0;

    // Base price for all adults (children might have different pricing in future)
    let baseTotal = excursion.priceMAD * ageGroups['adult'];

    // Add children pricing (same as adult for now)
    baseTotal += excursion.priceMAD * ageGroups['4-12'];
    baseTotal += excursion.priceMAD * ageGroups['0-4'];

    // Add selected extra items cost
    let extrasTotal = 0;
    excursion.items?.forEach((item: any) => {
      if (selectedItems[item.id]) {
        extrasTotal += item.price * totalPeople;
      }
    });

    return baseTotal + extrasTotal;
  };

  const checkAvailability = async () => {
    if (!selectedDate) {
      return true; // No date selected yet
    }

    const totalPeople = ageGroups['0-4'] + ageGroups['4-12'] + ageGroups['adult'];

    if (totalPeople === 0) {
      return true;
    }

    setCheckingAvailability(true);
    try {
      const response = await fetch(
        `/api/capacity/check?excursion_id=${encodeURIComponent(excursion.id)}&date=${selectedDate}&people_count=${totalPeople}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.canBook;
      }

      return true; // If check fails, allow booking (fail open)
    } catch (error) {
      console.error('Availability check failed:', error);
      return true; // Fail open
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedDate) {
      toast.error(t('excursionDetail.pleaseSelectDate'));
      return;
    }

    // Validate date against availableDays
    if (!isDateAvailable(selectedDate, excursion.availableDays)) {
      toast.error(
        locale === 'fr'
          ? 'Cette excursion n\'est pas disponible le jour sélectionné. Veuillez choisir un autre jour.'
          : 'This excursion is not available on the selected day. Please choose another day.'
      );
      return;
    }

    const totalPeople = ageGroups['0-4'] + ageGroups['4-12'] + ageGroups['adult'];
    if (totalPeople === 0) {
      toast.error(locale === 'fr' ? 'Veuillez sélectionner au moins une personne' : 'Please select at least one person');
      return;
    }

    // Check availability before adding to cart
    const isAvailable = await checkAvailability();

    if (!isAvailable) {
      toast.error(
        locale === 'fr'
          ? 'Cette excursion est complète pour la date sélectionnée'
          : 'This excursion is full for the selected date'
      );
      return;
    }

    const selectedItemsList = excursion.items
      ?.filter((item: any) => selectedItems[item.id])
      .map((item: any) => ({
        id: item.id,
        label: getStringValue(item.label, locale),
        price: item.price
      })) || [];

    const cartItem = {
      id: `${excursion.id}-${Date.now()}`,
      excursionId: excursion.id,
      excursionName: getStringValue(excursion.name, locale),
      excursionImage: excursion.images[0],
      date: selectedDate,
      selectedItems: selectedItemsList,
      ageGroups: { ...ageGroups },
      priceMAD: excursion.priceMAD,
      total: calculateTotal()
    };

    addToCart(cartItem);
    toast.success(t('excursionDetail.addedToCart'));

    // Redirect to cart page
    router.push(`/${locale}/cart`);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? excursion.images.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === excursion.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f7fb] flex flex-col">
      <Header />
      {/* Dark gradient overlay behind header */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-40 pointer-events-none" />
      <main className="flex-1 pt-40 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('excursionDetail.backButton')}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden mb-4 bg-secondary">
                <Image
                  src={excursion.images[currentImageIndex]}
                  alt={getStringValue(excursion.name, locale)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
                {/* Circuit Badge */}
                {isCircuit && (
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Circuit
                  </div>
                )}
                {excursion.images.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {excursion.images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {excursion.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 rounded-[20px] overflow-hidden border-2 transition-all ${index === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <Image
                        src={image}
                        alt={`${getStringValue(excursion.name, locale)} - ${index + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Description Section - Moved under image */}
              <div className="mt-8 bg-white rounded-[20px] p-8">
                <h2 className="text-xl font-semibold mb-4 text-[#4a9fb8]">{t('excursionDetail.description')}</h2>
                <div className="prose max-w-none">
                  <p className="text-muted leading-relaxed mb-6">{getStringValue(excursion.description, locale)}</p>

                  {/* Highlights */}
                  {excursion.highlights && excursion.highlights.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">{t('excursionDetail.highlights')}</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {excursion.highlights.map((highlight: any, index: number) => (
                          <li key={index} className="text-muted">{getStringValue(highlight, locale)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What's Included */}
                  {excursion.included && excursion.included.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">{t('excursionDetail.included')}</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {excursion.included.map((item: any, index: number) => (
                          <li key={index} className="text-muted">{getStringValue(item, locale)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Not Included */}
                  {excursion.notIncluded && excursion.notIncluded.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">{t('excursionDetail.notIncluded')}</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {excursion.notIncluded.map((item: any, index: number) => (
                          <li key={index} className="text-muted">{getStringValue(item, locale)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="mb-2">
                      <span className="font-medium">{t('excursionDetail.time')}: </span>
                      <span className="text-muted">
                        {getStringValue(excursion.duration, locale)?.split(' ')[0] || '8:00'} - {parseInt(getStringValue(excursion.duration, locale)) + 1 || 5}:30PM
                      </span>
                    </p>

                    <p className="text-sm font-medium mb-1">
                      {t('excursionDetail.priceIncludes')}
                    </p>
                    <p className="text-sm text-muted mb-4">
                      {getStringValue(excursion.priceIncludes, locale) || t('excursionDetail.priceIncludesText')}
                    </p>

                    <p className="text-sm text-muted italic">
                      <span className="font-medium">Cancellation: </span>
                      {getStringValue(excursion.cancellationPolicy, locale) || t('excursionDetail.cancellation')}
                    </p>

                    <p className="text-sm text-muted italic mt-2">
                      <span className="font-medium">Participants: </span>
                      {getStringValue(excursion.minParticipants, locale) || t('excursionDetail.minParticipants')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Booking Form */}
            <div className="bg-[#e8f4f8] rounded-[20px] p-6">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-foreground flex-1">
                  {getStringValue(excursion.name, locale)}
                </h1>
                <WishlistButton
                  excursionId={excursion.id}
                  excursionName={getStringValue(excursion.name, locale)}
                  variant="icon-only"
                  className="flex-shrink-0"
                />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= excursion.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>

              {/* Available Days Info */}
              {excursion.availableDays && !excursion.availableDays.includes('everyday') && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-[20px] flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">
                      {locale === 'fr' ? 'Jours disponibles' : 'Available Days'}
                    </p>
                    <p className="text-sm text-blue-700">
                      {formatAvailableDays(excursion.availableDays, locale)}
                    </p>
                  </div>
                </div>
              )}

              {/* Time Slots Info */}
              {excursion.timeSlots && excursion.timeSlots.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-[20px] flex items-start gap-2">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">
                      {locale === 'fr' ? 'Horaires disponibles' : 'Available Time Slots'}
                    </p>
                    <div className="text-sm text-amber-700 space-y-1">
                      {excursion.timeSlots.map((slot: any, index: number) => (
                        <div key={index}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Price - Hide for circuits or show "Price on request" */}
              {isCircuit || !showPrice ? (
                <div className="mb-6">
                  <div className="text-lg font-semibold text-foreground italic">
                    {locale === 'fr' ? 'Prix sur demande' : 'Price on request'}
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {locale === 'fr' ? 'Contactez-nous pour plus d\'informations' : 'Contact us for more information'}
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-3xl font-bold text-foreground">
                    {formatPrice(excursion.priceMAD)}
                    <span className="text-sm font-normal text-muted ml-2">
                      {locale === 'fr' ? 'par personne' : 'per person'}
                    </span>
                  </div>
                </div>
              )}

              {/* Item Selection - Hidden as per request */}
              {/* {excursion.items && excursion.items.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3 text-[#4a9fb8]">
                    {t('excursionDetail.selectMoreItems')}
                  </p>
                  <div className="space-y-3">
                    {excursion.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          id={item.id}
                          checked={selectedItems[item.id] || false}
                          onCheckedChange={(checked) =>
                            setSelectedItems((prev) => ({
                              ...prev,
                              [item.id]: checked as boolean
                            }))
                          }
                        />
                        <label
                          htmlFor={item.id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {getStringValue(item.label, locale)} {showPrice && `(${formatPrice(item.price)})`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Number of People */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">{t('excursionDetail.numberOfPeople')}</p>

                <div className="space-y-4">
                  {/* Adults */}
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      {t('excursionDetail.ageGroups.adult')} (12+ {locale === 'fr' ? 'ans' : 'years'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={ageGroups['adult']}
                      onChange={(e) =>
                        setAgeGroups((prev) => ({
                          ...prev,
                          adult: Math.max(0, parseInt(e.target.value) || 0)
                        }))
                      }
                      className="w-full px-3 py-2 border border-border rounded-md"
                    />
                  </div>

                  {!excursion.isAdultsOnly && (
                    <>
                      {/* Children 4-12 */}
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          {t('excursionDetail.ageGroups.child')} (4-12 {locale === 'fr' ? 'ans' : 'years'})
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={ageGroups['4-12']}
                          onChange={(e) =>
                            setAgeGroups((prev) => ({
                              ...prev,
                              '4-12': Math.max(0, parseInt(e.target.value) || 0)
                            }))
                          }
                          className="w-full px-3 py-2 border border-border rounded-md"
                        />
                      </div>

                      {/* Babies 0-4 */}
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          {t('excursionDetail.ageGroups.baby')} (0-4 {locale === 'fr' ? 'ans' : 'years'})
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={ageGroups['0-4']}
                          onChange={(e) =>
                            setAgeGroups((prev) => ({
                              ...prev,
                              '0-4': Math.max(0, parseInt(e.target.value) || 0)
                            }))
                          }
                          className="w-full px-3 py-2 border border-border rounded-md"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Date Selection with Availability Calendar */}
              <div className="mb-6">
                <label className="text-sm font-semibold block mb-4">
                  {t('excursionDetail.dateOfBooking')} <span className="text-red-500">*</span>
                </label>

                {/* Show warning if selected date is not available */}
                {selectedDate && !isDateAvailable(selectedDate, excursion.availableDays) && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[20px] flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      {locale === 'fr'
                        ? 'Cette excursion n\'est pas disponible le jour sélectionné.'
                        : 'This excursion is not available on the selected day.'}
                    </p>
                  </div>
                )}

                {/* Show selected date */}
                {selectedDate && (
                  <div className="mb-3 p-4 bg-primary/10 border-2 border-primary rounded-[20px]">
                    <p className="text-sm font-medium text-foreground">
                      {locale === 'fr' ? 'Date sélectionnée:' : 'Selected date:'}
                      <span className="ml-2 text-primary font-bold">
                        {new Date(selectedDate).toLocaleDateString(locale, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </p>
                  </div>
                )}

                <AvailabilityCalendar
                  excursionId={excursion.id}
                  selectedDate={selectedDate}
                  onDateSelect={(date) => setSelectedDate(date)}
                  locale={locale}
                  availableDays={excursion.availableDays}
                />
              </div>

              {/* Total Price Display - Hide for circuits */}
              {!isCircuit && showPrice && (
                <div className="mb-4 p-4 bg-white rounded-[20px]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{locale === 'fr' ? 'Prix total' : 'Total Price'}:</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={checkingAvailability}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 mb-4 rounded-full"
                size="lg"
              >
                {checkingAvailability
                  ? (locale === 'fr' ? 'Vérification...' : 'Checking...')
                  : isCircuit
                    ? (locale === 'fr' ? 'Réserver maintenant' : 'Reserve Now')
                    : t('excursionDetail.addToCart')}
              </Button>

              {/* Share with Friends */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">{t('excursionDetail.shareWithFriends')}</p>
                <div className="flex gap-3">
                  <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}