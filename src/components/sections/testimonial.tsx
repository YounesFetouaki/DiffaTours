"use client";

import React, { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { useTranslations } from '@/lib/i18n/hooks';

const TestimonialSection = () => {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#1A1A1A] bg-cover bg-center section-overlay"
    >
      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-[100px] text-center text-white">
        <div className={`scroll-fade ${isVisible ? 'visible' : ''}`}>
          <h6 className="font-display text-xs font-bold uppercase tracking-[2px] text-primary mb-4">
            {t('testimonial.subtitle')}
          </h6>
          <h2 className="font-display text-[36px] md:text-[42px] leading-tight text-white mb-8">
            TÉMOIGNAGES DE NOS VOYAGEURS
          </h2>
        </div>
        
        <blockquote className={`relative my-8 max-w-[800px] scroll-fade ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="glass-strong p-8 md:p-12">
            <Quote className="w-12 h-12 text-primary/30 mb-6 mx-auto" />
            <p className="font-secondary italic leading-[1.6] text-[clamp(1.25rem,2.5vw,1.5rem)] text-white/95">
              {t('testimonial.quote')}
            </p>
          </div>
        </blockquote>

        <div className={`text-2xl tracking-widest text-[#FFB73F] scroll-fade ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.3s' }}>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;