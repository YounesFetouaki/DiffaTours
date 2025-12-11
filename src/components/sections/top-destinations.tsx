"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "@/lib/i18n/hooks";
import { motion } from "framer-motion";

const TopDestinations = () => {
  const t = useTranslations();
  const locale = useLocale();

  const destinations = [
    {
      id: "marrakech",
      name: "Marrakech",
      image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2072&auto=format&fit=crop",
      link: "/marrakech",
      count: "120+ Experiences"
    },
    {
      id: "agadir",
      name: "Agadir",
      image: "https://images.unsplash.com/photo-1577147443647-81856d5151af?q=80&w=2070&auto=format&fit=crop",
      link: "/agadir",
      count: "50+ Experiences"
    },
    {
      id: "taghazout",
      name: "Taghazout",
      image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2070&auto=format&fit=crop",
      link: "/taghazout",
      count: "30+ Experiences"
    },
    /* {
      id: "sahara",
      name: "Sahara Desert",
      image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2070&auto=format&fit=crop",
      link: "/circuits",
      count: "25+ Circuits"
    } */
  ];

  const translations = {
    fr: {
      title: "Évasions Incontournables",
      subtitle: "Découvrez les lieux incontournables du Maroc, entre paysages majestueux et richesses culturelles.",
      viewAll: "Voir toutes les destinations"
    },
    en: {
      title: "Unmissable Escapes",
      subtitle: "Discover Morocco’s must-see locations, from majestic landscapes to rich cultural treasures.",
      viewAll: "View all destinations"
    },
    it: {
      title: "I Nostri Viaggi Imperdibili",
      subtitle: "Scoprite i luoghi imperdibili del Marocco, tra paesaggi maestosi e ricchezze culturali.",
      viewAll: "Vedi tutte le destinazioni"
    },
    es: {
      title: "Escapadas Imprescindibles",
      subtitle: "Descubra los lugares imprescindibles de Marruecos, entre paisajes majestuosos y riquezas culturales.",
      viewAll: "Ver todos los destinos"
    }
  };

  const text = translations[locale as keyof typeof translations] || translations.fr;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground drop-shadow-sm">
            {text.title}
          </h2>
          <div className="w-24 h-1.5 bg-primary rounded-full" />
          <p className="text-muted-foreground text-xl max-w-2xl font-medium leading-relaxed">
            {text.subtitle}
          </p>

          <Link
            href={`/${locale}/nos-excursions`}
            className="group mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-primary font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-primary/20"
          >
            {text.viewAll}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <Link
              key={destination.id}
              href={`/${locale}${destination.link}`}
              className="group cursor-pointer block"
            >
              <div className="glass p-3 transition-transform duration-300 hover:-translate-y-2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[16px] mb-3">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-sm text-white/90 font-medium">
                      {destination.count}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopDestinations;
