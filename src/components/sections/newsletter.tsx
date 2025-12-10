"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from '@/lib/i18n/hooks';

const Newsletter = () => {
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
      className="relative py-20 px-4 md:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/stunning-wide-panoramic-view-of-moroccan-948b1144-20251123184351.jpg"
          alt="Contact background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Black Overlay - 75% */}
      <div className="absolute inset-0 bg-black/75 z-10" />

      <div className="container mx-auto max-w-4xl relative z-20">
        <div className={`text-center mb-12 scroll-fade ${isVisible ? 'visible' : ''}`}>
          <h2 className="font-display text-primary mb-4">CONTACTEZ-NOUS</h2>
          <p className="text-white text-body-lg max-w-2xl mx-auto">
            Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans l'organisation de votre séjour.
          </p>
        </div>

        <div className={`flex justify-center scroll-fade ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
          <Link href="/contact" className="btn btn-primary px-8 py-3">
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;