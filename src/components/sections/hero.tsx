"use client";

import Image from "next/image";
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from '@/lib/i18n/hooks';
import { Search, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TrustBar } from '@/components/ui/trust-bar';

const Hero = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Search States
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const heroImages = [
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/stunning-wide-panoramic-view-of-moroccan-948b1144-20251123184351.jpg",
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/breathtaking-moroccan-travel-scene-showi-74294209-20251123184351.jpg",
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/moroccan-sahara-desert-adventure-off-roa-54eb8f40-20251124020921.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (date) params.set('date', date);

    // If specific destination selected, go there, otherwise search all
    let path = '/nos-excursions';
    if (destination === 'Marrakech') path = '/marrakech';
    if (destination === 'Agadir') path = '/agadir';
    if (destination === 'Taghazout') path = '/taghazout';
    if (destination === 'Circuits') path = '/circuits';

    router.push(`${path}?${params.toString()}`);
  };

  return (
    <section className="relative flex items-center justify-center min-h-[600px] lg:h-[85vh] w-full text-white overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 w-full h-full">
        {heroImages.map((image, index) => (
          <div key={image} className="absolute inset-0 w-full h-full">
            <Image
              src={image}
              alt="Morocco Travel"
              fill
              sizes="100vw"
              className={`object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
              priority={index === 0}
            />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center pt-20">

        {/* Headlines */}
        {/* Headlines wrapped in Glass Card */}
        <div
          className="mb-12 p-8 md:p-12 lg:p-16 animate-scaleIn max-w-5xl mx-auto rounded-none md:rounded-lg"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))',
            backdropFilter: 'blur(8px) saturate(110%)',
            WebkitBackdropFilter: 'blur(8px) saturate(110%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(2, 8, 23, 0.4), 0 0 20px rgba(0, 0, 0, 0.1) inset'
          }}
        >
          <h1
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl shadow-sm mb-6 tracking-tight text-[#FFB73F]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('hero.title') || "Discover the real Morocco"}
          </h1>
          <p className="font-secondary italic text-lg sm:text-xl md:text-2xl text-white/95 font-normal shadow-sm">
            {t('hero.subtitle') || "Unforgettable tours, activities and authenticated experiences"}
          </p>
        </div>

        {/* Search Box - Big & Central */}
        <div className="w-full max-w-5xl animate-fadeInUp delay-200">
          <form onSubmit={handleSearch} className="bg-white rounded-[24px] md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-center gap-2">

            {/* Destination Input */}
            <div className="flex-1 relative w-full md:border-r border-gray-100 group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full h-14 pl-14 pr-10 bg-transparent border-none outline-none text-foreground font-medium text-lg appearance-none cursor-pointer focus:ring-0"
              >
                <option value="" className="text-muted-foreground">{t('reservation.destination') || "Destination"}</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Agadir">Agadir</option>
                <option value="Taghazout">Taghazout</option>
              </select>
            </div>

            {/* Date Input */}
            <div className="flex-1 relative w-full group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 pl-14 pr-4 bg-transparent border-none outline-none text-foreground font-medium text-lg focus:ring-0 placeholder:text-muted-foreground"
                placeholder={t('reservation.departDate') || "mm/dd/yyyy"}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-8 h-12 md:h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-[20px] md:rounded-full transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 min-w-[160px]"
            >
              <Search className="w-5 h-5" />
              <span>{t('reservation.search') || "Rechercher"}</span>
            </button>
          </form>

          {/* Trust Bar attached to search */}
          <div className="hidden md:block">
            <TrustBar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;