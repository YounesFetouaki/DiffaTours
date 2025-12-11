"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { useTranslations } from '@/lib/i18n/hooks';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    id: 1,
    quote: "testimonial.quote", // Key for existing quote
    author: "Sarah Martin",
    role: "France",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    quote: "Un voyage parfaitement organisé. Le guide était exceptionnel et nous a fait découvrir des endroits magnifiques que nous n'aurions jamais trouvés seuls.",
    author: "Thomas Dubois",
    role: "Belgique",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    quote: "Une expérience magique dans le désert. Tout était pris en charge, nous n'avions qu'à profiter. Merci Diffa Tours !",
    author: "Elena Rossi",
    role: "Italie",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
  }
];

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
      className="relative bg-[#1A1A1A] bg-cover bg-center section-overlay overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-[100px] text-center text-white max-w-7xl mx-auto">
        <div className={`scroll-fade ${isVisible ? 'visible' : ''} mb-12`}>
          <h6 className="font-display text-xs font-bold uppercase tracking-[2px] text-primary mb-4">
            {t('testimonial.subtitle')}
          </h6>
          <h2 className="font-display text-[36px] md:text-[42px] leading-tight text-white">
            TÉMOIGNAGES DE NOS VOYAGEURS
          </h2>
        </div>

        <div className={`w-full max-w-4xl scroll-fade ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-full lg:basis-full">
                  <div className="p-4">
                    <div className="glass-strong p-8 md:p-12 relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                      <Quote className="w-10 h-10 text-primary/40 mb-6 mx-auto" />

                      <p className="font-secondary italic leading-[1.6] text-xl md:text-2xl text-white/95 mb-8">
                        "{testimonial.id === 1 ? t('testimonial.quote') : testimonial.quote}"
                      </p>

                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <h4 className="font-bold text-lg text-white">{testimonial.author}</h4>
                          <p className="text-sm text-white/60">{testimonial.role}</p>
                        </div>
                        <div className="flex gap-1 text-[#FFB73F]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex bg-white/10 hover:bg-white/20 border-white/10" />
            <CarouselNext className="hidden md:flex bg-white/10 hover:bg-white/20 border-white/10" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;