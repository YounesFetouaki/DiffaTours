'use client';

import Header from '@/components/sections/header';
import Image from 'next/image';
import { ActivityGridWithCalendar } from '@/components/ActivityGridWithCalendar';
import { useTranslations } from '@/lib/i18n/hooks';
import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useParams } from 'next/navigation';

// Helper function to extract text from multilingual field or string
const getLocalizedText = (field: any, locale: string): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field[locale] || field.en || field.fr || Object.values(field)[0] || '';
  }
  return '';
};

// Helper function to validate image URLs
const getValidImageUrl = (imageUrl: string): string => {
  if (!imageUrl || imageUrl === 'test' || imageUrl.trim() === '') {
    return 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  return 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80';
};

export default function MarrakechPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string || 'fr';
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrice, setShowPrice] = useState(true);
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch excursions with section filter
        const excursionsResponse = await fetch('/api/excursions?section=marrakech');
        if (!excursionsResponse.ok) {
          throw new Error('Failed to fetch excursions');
        }
        const excursionsResult = await excursionsResponse.json();
        const excursions = excursionsResult.data || [];

        // Fetch price visibility settings
        const settingsResponse = await fetch('/api/excursion-settings');
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          const marrakechSetting = settings.find((s: any) => s.section === 'marrakech');
          if (marrakechSetting) {
            setShowPrice(marrakechSetting.showPrice);
          }
        }

        // Map excursions directly (already filtered by API)
        const marrakechActivities = excursions.map((excursion: any) => {
          const rawImage = excursion.images?.[0] || excursion.image || '';
          return {
            id: excursion.id,
            name: getLocalizedText(excursion.name, locale),
            image: getValidImageUrl(rawImage),
            priceMAD: excursion.priceMAD,
            location: getLocalizedText(excursion.location, locale),
            productId: excursion.id,
            productSlug: excursion.id,
            availableDays: excursion.availableDays
          };
        });

        setActivities(marrakechActivities);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  return (
    <div className="min-h-screen bg-background">
      {/* Dark gradient overlay behind header */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-40 pointer-events-none" />

      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/spectacular-view-of-marrakech-morocco-vi-83509ed4-20251124020921.jpg"
              alt={t('marrakechPage.hero.title')}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-black/75 z-10" />

          <div className="relative z-20 text-center text-white px-4 max-w-5xl mx-auto">
            <div
              className="p-8 md:p-12 lg:p-16 animate-scaleIn"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                backdropFilter: 'blur(8px) saturate(110%)',
                WebkitBackdropFilter: 'blur(8px) saturate(110%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 12px rgba(2, 8, 23, 0.4), 0 0 20px rgba(0, 0, 0, 0.02) inset'
              }}
            >
              <h1
                className="font-display text-[36px] md:text-[56px] lg:text-[64px] leading-tight font-bold mb-6 text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('marrakechPage.hero.title')}
              </h1>
              <p className="font-secondary italic text-white text-lg md:text-xl lg:text-2xl font-normal">
                {t('marrakechPage.hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Activity Grid with Calendar Sidebar */}
        <section ref={sectionRef as any} className="py-16 md:py-24 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className={`text-center py-12 scroll-fade ${isVisible ? 'visible' : ''}`}>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className={`text-center py-12 scroll-fade ${isVisible ? 'visible' : ''}`}>
                <p className="text-red-500">{error}</p>
              </div>
            ) : activities.length === 0 ? (
              <div className={`text-center py-12 scroll-fade ${isVisible ? 'visible' : ''}`}>
                <p className="text-muted">{t('excursions.noResults')}</p>
              </div>
            ) : (
              <div className={`scroll-fade ${isVisible ? 'visible' : ''}`}>
                <ActivityGridWithCalendar
                  activities={activities}
                  categoryName="Marrakech"
                  showPrice={showPrice}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}