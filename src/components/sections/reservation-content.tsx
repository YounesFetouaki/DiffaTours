'use client';

import React, { useState, useEffect } from "react";
import { useTranslations } from '@/lib/i18n/hooks';
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Star } from 'lucide-react';

interface Excursion {
  id: number;
  name: any;
  slug: string;
  images: string[];
  priceMAD: number;
  duration: any;
  location: any;
  average_rating: number;
  review_count: number;
}

// Helper function to extract text from multilingual field
const getLocalizedText = (field: any, locale: string): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field[locale] || field.en || field.fr || Object.values(field)[0] || '';
  }
  return '';
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
  
  return 'https://images.unsplash.com/photo-539635278303-d4002c07eae3?w=800&q=80';
};

export default function ReservationContent() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const { currency, convertPrice } = useCurrency();
  
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10450 });
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025

  // Fetch top-rated excursions
  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/excursions');
        if (!response.ok) throw new Error('Failed to fetch excursions');
        
        const result = await response.json();
        const data = result.data || [];
        
        // Sort by rating (stars) in descending order
        const sortedByRating = data.sort((a: Excursion, b: Excursion) => {
          const ratingA = a.average_rating || 0;
          const ratingB = b.average_rating || 0;
          return ratingB - ratingA;
        });
        
        setExcursions(sortedByRating);
        
        // Set price range based on fetched data
        if (sortedByRating.length > 0) {
          const prices = sortedByRating.map((e: Excursion) => e.priceMAD);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: 0, max: maxPrice });
        }
      } catch (error) {
        console.error('Error fetching excursions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExcursions();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const filteredExcursions = excursions.filter(
    excursion => excursion.priceMAD >= priceRange.min && excursion.priceMAD <= priceRange.max
  );

  const handleBookNow = (slug: string) => {
    router.push(`/${locale}/excursion/${slug}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-8">
        {/* Left Sidebar - Filters */}
        <div className="bg-white rounded-[20px] shadow-md p-6 h-fit sticky top-24">
          <div className="mb-8">
            <button 
              onClick={() => setPriceRange({ min: 0, max: excursions.length > 0 ? Math.max(...excursions.map(e => e.priceMAD)) : 10450 })}
              className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors"
            >
              {t('reservationPage.clearFilter')}
            </button>
          </div>

          {/* Calendar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-base">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[
                t('days.monday'),
                t('days.tuesday'),
                t('days.wednesday'),
                t('days.thursday'),
                t('days.friday'),
                t('days.saturday'),
                t('days.sunday')
              ].map((day, idx) => (
                <div key={idx} className="text-center text-xs font-semibold py-2 uppercase">
                  {day.substring(0, 3)}
                </div>
              ))}
              
              {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isWeekend = ((startingDayOfWeek + i) % 7 === 0) || ((startingDayOfWeek + i) % 7 === 6);
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    className={`
                      text-center py-2 text-sm rounded-full hover:bg-accent/20 transition-colors
                      ${isWeekend ? 'text-red-500' : 'text-foreground'}
                      ${selectedDate?.getDate() === day ? 'bg-accent text-white' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base">{t('reservationPage.price')}</h3>
              <button className="text-primary text-sm hover:text-primary/80">{t('reservationPage.ok')}</button>
            </div>

            <div className="relative pt-6 pb-4">
              <Slider
                min={0}
                max={excursions.length > 0 ? Math.max(...excursions.map(e => e.priceMAD)) : 10450}
                step={50}
                value={[priceRange.max]}
                onValueChange={(value) => setPriceRange({ ...priceRange, max: value[0] })}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-4 text-sm">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-full text-center"
                />
                <span className="mx-2">-</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || (excursions.length > 0 ? Math.max(...excursions.map(e => e.priceMAD)) : 10450) })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-full text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Excursions Grid */}
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-display font-light mb-2">{t('reservationPage.title')}</h1>
            <p className="text-muted">{t('reservationPage.subtitle')}</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExcursions.map((excursion) => (
                  <div
                    key={excursion.id}
                    className="bg-white rounded-[20px] shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-[250px]">
                      <Image
                        src={getValidImageUrl(excursion.images?.[0] || '')}
                        alt={getLocalizedText(excursion.name, locale)}
                        fill
                        className="object-cover"
                      />
                      {/* Rating Badge */}
                      {excursion.average_rating > 0 && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-semibold text-sm">{excursion.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                        {getLocalizedText(excursion.name, locale)}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{getLocalizedText(excursion.duration, locale)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{getLocalizedText(excursion.location, locale)}</span>
                        </div>
                      </div>
                      
                      {/* Rating and Review Count */}
                      {excursion.review_count > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(excursion.average_rating)
                                    ? 'fill-primary text-primary'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted">
                            ({excursion.review_count} {excursion.review_count === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {convertPrice(excursion.priceMAD)} {currency}
                        </div>
                        <button 
                          onClick={() => handleBookNow(excursion.slug)}
                          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors text-sm font-semibold"
                        >
                          {t('common.bookNow')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredExcursions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted text-lg">{t('reservationPage.noTours')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}