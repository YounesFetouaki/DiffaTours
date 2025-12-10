"use client";

import Header from '@/components/sections/header';
import ContactForm from '@/components/contact-form';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useTranslations } from '@/lib/i18n/hooks';
import { Link } from '@/i18n/routing';

export default function ContactPage() {
  const [scrollY, setScrollY] = useState(0);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation();
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section with Parallax */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 z-0"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          >
            <div className="absolute inset-0">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/9956bb_cdd31c8975c34219ab5897156b24f808mv2-1-2.avif"
                alt="Diffa Tours Interior"
                fill
                style={{ objectFit: 'cover' }}
                priority
                unoptimized
              />
            </div>
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
              <h6 className="font-secondary uppercase text-xs tracking-[3px] mb-4 text-white/90">
                {t('contact.hero.subtitle')}
              </h6>
              <h1
                className="font-display text-[36px] md:text-[56px] lg:text-[64px] leading-tight font-bold mb-6 text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('contact.hero.title')}
              </h1>
              <p className="font-secondary italic text-white text-lg md:text-xl lg:text-2xl font-normal">
                {t('contact.hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section ref={cardsRef as any} className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Address Card */}
              <div className={`text-center glass p-8 card-hover group scroll-fade ${cardsVisible ? 'visible' : ''}`}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-2xl mb-4 text-foreground group-hover:text-primary transition-colors duration-300">{t('contact.info.address')}</h3>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {t('contact.info.addressText')}
                </p>
              </div>

              {/* Phone Card */}
              <div className={`text-center glass p-8 card-hover group scroll-fade ${cardsVisible ? 'visible' : ''}`} style={{ animationDelay: '0.1s' }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-10 h-10 text-accent" />
                </div>
                <h3 className="font-display text-2xl mb-4 text-foreground group-hover:text-accent transition-colors duration-300">{t('contact.info.phone')}</h3>
                <a href="tel:+212661822441" className="text-sm text-muted hover:text-primary transition-colors inline-block hover:scale-105 transform">
                  +212 661 822 441
                </a>
              </div>

              {/* Email Card */}
              <div className={`text-center glass p-8 card-hover group scroll-fade ${cardsVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-2xl mb-4 text-foreground group-hover:text-primary transition-colors duration-300">{t('contact.info.email')}</h3>
                <a href="mailto:Contact@palaisriadberbere.com" className="text-sm text-muted hover:text-primary transition-colors break-all inline-block hover:scale-105 transform">
                  Contact@palaisriadberbere.com
                </a>
              </div>

              {/* Hours Card */}
              <div className={`text-center glass p-8 card-hover group scroll-fade ${cardsVisible ? 'visible' : ''}`} style={{ animationDelay: '0.3s' }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-10 h-10 text-accent" />
                </div>
                <h3 className="font-display text-2xl mb-4 text-foreground group-hover:text-accent transition-colors duration-300">{t('contact.info.hours')}</h3>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {t('contact.info.hoursText')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section ref={formRef as any} className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"></div>

          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left: Form Introduction */}
              <div className="space-y-8 animate-fadeInUp">
                <div>
                  <h6 className="font-secondary uppercase text-xs tracking-[3px] text-accent mb-4">
                    {t('contact.form.subtitle')}
                  </h6>
                  <h2 className="font-display text-4xl md:text-5xl mb-6 text-foreground">
                    {t('contact.form.title')}
                  </h2>
                  <p className="text-body-lg text-muted mb-8 leading-relaxed">
                    {t('contact.form.description')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-6 group">
                    <div className="w-16 h-16 rounded-[1rem] glass-light flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl mb-2 group-hover:text-primary transition-colors">{t('contact.form.location.title')}</h4>
                      <p className="text-sm text-muted leading-relaxed">
                        {t('contact.form.location.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-16 h-16 rounded-[1rem] glass-light flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl mb-2 group-hover:text-accent transition-colors">{t('contact.form.call.title')}</h4>
                      <p className="text-sm text-muted leading-relaxed">
                        {t('contact.form.call.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-16 h-16 rounded-[1rem] glass-light flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl mb-2 group-hover:text-primary transition-colors">{t('contact.form.write.title')}</h4>
                      <p className="text-sm text-muted leading-relaxed">
                        {t('contact.form.write.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                  <div className="w-3 h-3 rounded-full border-2 border-primary animate-pulse"></div>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                </div>
              </div>

              {/* Right: Contact Form */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="h-[500px] w-full relative">
          <div className="absolute inset-0 shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.4956856989486!2d-8.0089!3d31.6295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDM3JzQ2LjIiTiA4wrAwMCczMi4wIlc!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Diffa Tours Location"
              className="grayscale-[30%] hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef as any} className="py-24 px-6 bg-gradient-to-br from-white via-gray-50 to-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

          <div className="max-w-[900px] mx-auto relative z-10">
            <div className="glass rounded-[2rem] p-8 md:p-12 lg:p-16">
              <h6 className="font-secondary uppercase text-xs tracking-[3px] text-accent mb-4">
                {t('contact.cta.subtitle')}
              </h6>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground">
                {t('contact.cta.title')}
              </h2>
              <p className="text-body-lg text-muted mb-10 leading-relaxed max-w-[700px] mx-auto">
                {t('contact.cta.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/nos-excursions" className="btn-primary text-base px-10 py-5">
                  {t('contact.cta.bookNow')}
                </Link>
                <Link href="/nos-excursions" className="btn-secondary text-base px-10 py-5">
                  {t('contact.cta.discoverRooms')}
                </Link>
              </div>

              <div className="flex items-center justify-center gap-3 mt-12">
                <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <div className="w-3 h-3 rounded-full border-2 border-primary animate-pulse"></div>
                <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}