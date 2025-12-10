"use client";

import Header from '@/components/sections/header';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function NosExcursionsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { ref: categoriesRef, isVisible: categoriesVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const excursionCategories = [
    {
      id: 1,
      title: t('excursionsPage.categories.marrakech.title'),
      href: "/marrakech",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/spectacular-view-of-marrakech-morocco-vi-83509ed4-20251124020921.jpg",
      description: t('excursionsPage.categories.marrakech.description')
    },
    {
      id: 2,
      title: t('excursionsPage.categories.agadir.title'),
      href: "/agadir",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/beautiful-agadir-beach-coastline-morocco-08392506-20251124020921.jpg",
      description: t('excursionsPage.categories.agadir.description')
    },
    // HIDDEN: Circuits - keep for future use
    // {
    //   id: 3,
    //   title: t('excursionsPage.categories.circuits.title'),
    //   href: "/circuits",
    //   image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/moroccan-desert-circuit-route-map-camel--94b81e3f-20251124020921.jpg",
    //   description: t('excursionsPage.categories.circuits.description')
    // },
    {
      id: 6,
      title: t('excursionsPage.categories.taghazout.title'),
      href: "/taghazout",
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/taghazout-surf-village-morocco-picturesq-30cd958b-20251124020921.jpg",
      description: t('excursionsPage.categories.taghazout.description')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/wide-panoramic-view-of-diverse-moroccan--39051fac-20251124133346.jpg"
              alt={t('excursionsPage.hero.title')}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority
              className="z-0"
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
                {t('excursionsPage.hero.title')}
              </h1>
              <p className="font-secondary italic text-white text-lg md:text-xl lg:text-2xl font-normal">
                {t('excursionsPage.hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section ref={categoriesRef as any} className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className={`text-center mb-12 scroll-fade ${categoriesVisible ? 'visible' : ''}`}>
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-primary mb-4">
                {t('excursionsPage.categories.subtitle')}
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground">
                {t('excursionsPage.categories.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {excursionCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/${locale}${category.href}`}
                  className={`group block glass overflow-hidden shadow-lg card-hover scroll-fade ${categoriesVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="relative h-[300px] overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* 75% overlay that becomes 100% clear on hover */}
                    <div className="absolute inset-0 bg-black/75 group-hover:bg-black/0 transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="text-2xl md:text-3xl font-display mb-2 !text-white">
                        {category.title}
                      </h3>
                      <p className="text-sm md:text-base opacity-90 text-white">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between bg-white/90 backdrop-blur-sm">
                    <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                      {t('excursionsPage.categories.discover')}
                    </span>
                    <ArrowRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-2" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef as any} className="py-16 bg-gradient-to-br from-secondary to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          <div className={`max-w-4xl mx-auto text-center px-4 relative z-10 scroll-fade ${ctaVisible ? 'visible' : ''}`}>
            <div className="glass p-8 md:p-12">
              <p className="font-script italic text-2xl md:text-3xl text-gradient mb-8">
                {t('excursionsPage.cta.quote')}
              </p>
              <a
                href={`/${locale}/reservation`}
                className="btn btn-primary"
              >
                {t('excursionsPage.cta.bookNow')}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}