"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from '@/lib/i18n/hooks';

const galleryImages = [
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/2-1-370x463-3.png",
    alt: "Hébergement de charme au Maroc",
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/Design-sans-titre-68-370x463-4.png",
    alt: "Découverte de la gastronomie marocaine",
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/Design-sans-titre-70-370x463-5.png",
    alt: "Aventure en quad dans le désert",
  },
  {
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/8-370x463-6.png",
    alt: "Excursion à dos de chameau",
  },
];

const ExperienceGallery = () => {
    const t = useTranslations();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
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
        <section ref={sectionRef} className="bg-gradient-to-b from-white to-gray-50 py-16 lg:py-20 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-3xl" />
            
            <div className="relative z-10">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory py-8 px-4 lg:px-24 lg:justify-center"
                >
                    {galleryImages.map((image, index) => (
                        <div key={index} className={`flex-shrink-0 snap-center scroll-fade ${isVisible ? 'visible' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="relative w-[280px] h-[280px] overflow-hidden">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    width={280}
                                    height={280}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className={`text-center mt-12 px-4 scroll-fade ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.4s' }}>
                <div className="glass p-6 max-w-2xl mx-auto">
                    <p className="font-script text-2xl italic text-gradient">
                        {t('gallery.quote')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ExperienceGallery;