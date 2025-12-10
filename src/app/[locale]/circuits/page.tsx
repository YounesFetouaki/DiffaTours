'use client';

import Header from '@/components/sections/header';
import Image from 'next/image';
import { CircuitsCarousel } from '@/components/CircuitsCarousel';
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

// Helper function to extract array items
const getLocalizedArray = (field: any, locale: string): string[] => {
  if (!field || !Array.isArray(field)) return [];
  return field.map(item => getLocalizedText(item, locale)).filter(Boolean);
};

// Helper function to validate and get proper image URL
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

export default function CircuitsPage() {
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
        const excursionsResponse = await fetch('/api/excursions?section=circuits');
        if (!excursionsResponse.ok) {
          throw new Error('Failed to fetch excursions');
        }
        const excursionsResult = await excursionsResponse.json();
        const excursions = excursionsResult.data || [];
        
        // Fetch price visibility settings
        const settingsResponse = await fetch('/api/excursion-settings');
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          const circuitsSetting = settings.find((s: any) => s.section === 'circuits');
          if (circuitsSetting) {
            setShowPrice(circuitsSetting.showPrice);
          }
        }
        
        // Map excursions directly (already filtered by API)
        const circuitsActivities = excursions.map((excursion: any) => ({
          id: excursion.id,
          name: getLocalizedText(excursion.name, locale),
          image: getValidImageUrl(excursion.images?.[0] || excursion.image || ''),
          priceMAD: excursion.priceMAD,
          location: getLocalizedText(excursion.location, locale),
          productId: excursion.id,
          productSlug: excursion.id,
          description: getLocalizedText(excursion.description, locale),
          duration: getLocalizedText(excursion.duration, locale),
          highlights: getLocalizedArray(excursion.highlights, locale)
        }));
        
        setActivities(circuitsActivities);
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
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/moroccan-desert-circuit-route-map-camel--94b81e3f-20251124020921.jpg"
              alt={t('circuitsPage.hero.title')}
              fill
              className="object-cover object-top"
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
                {t('circuitsPage.hero.title')}
              </h1>
              <p className="font-secondary italic text-white text-lg md:text-xl lg:text-2xl font-normal">
                {t('circuitsPage.hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Circuits Carousel Section */}
        <section ref={sectionRef as any} className="py-16 md:py-24 px-4 relative">
          {/* Background Image */}
          <div className="absolute inset-0 -z-20">
            <Image
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"
              alt="Circuits background"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Dark overlay - increased to 85% */}
          <div className="absolute inset-0 bg-black/85 -z-10" />
          
          {/* Stars effect */}
          <div 
            className="absolute inset-0 opacity-40 -z-10"
            style={{
              backgroundImage: `radial-gradient(1px 1px at 25% 25%, white, rgba(0, 0, 0, 0)),
                               radial-gradient(1px 1px at 50% 50%, white, rgba(0, 0, 0, 0)),
                               radial-gradient(2px 2px at 75% 75%, white, rgba(0, 0, 0, 0))`,
              backgroundSize: '200px 200px, 300px 300px, 400px 400px',
              backgroundRepeat: 'repeat'
            }}
          />
          
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className={`text-center py-12 scroll-fade ${isVisible ? 'visible' : ''}`}>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-white">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className={`text-center py-12 scroll-fade ${isVisible ? 'visible' : ''}`}>
                <p className="text-red-500">{error}</p>
              </div>
            ) : activities.length === 0 ? (
              <div className={`text-center py-12 scroll-fade ${isVisible ? 'visible' : ''}`}>
                <p className="text-white">{t('excursions.noResults')}</p>
              </div>
            ) : (
              <div className={`scroll-fade ${isVisible ? 'visible' : ''}`}>
                <div className="text-center mb-12">
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                    {t('circuitsPage.carousel.title') || 'Discover Our Circuits'}
                  </h2>
                  <p className="font-secondary italic text-white/80 text-lg">
                    {t('circuitsPage.carousel.subtitle') || 'Click on any card to reveal more details'}
                  </p>
                </div>
                
                {/* Add dark background container around carousel */}
                <div className="relative py-8 px-4 rounded-[20px]" style={{
                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.7), rgba(26, 26, 26, 0.8))',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <CircuitsCarousel circuits={activities} showPrice={showPrice} locale={locale} />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}