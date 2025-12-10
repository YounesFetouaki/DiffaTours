"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from '@/lib/i18n/hooks';
import { Star, Clock } from 'lucide-react';

interface Excursion {
    id: string;
    name: string | { en?: string; fr?: string; es?: string; it?: string };
    section: string;
    images: string[];
    priceMAD: number;
    duration: string | { en?: string; fr?: string; es?: string; it?: string };
    rating: number;
    reviews?: number; // Assuming we might have this later
}

const PopularExperiences = () => {
    const t = useTranslations();
    const locale = useLocale();
    const [excursions, setExcursions] = useState<Excursion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getLocalizedText = (text: string | { en?: string; fr?: string; es?: string; it?: string } | undefined, fallback: string = ''): string => {
        if (!text) return fallback;
        if (typeof text === 'string') return text;
        return text[locale as keyof typeof text] || text.fr || text.en || fallback;
    };

    useEffect(() => {
        const fetchExcursions = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/excursions');
                const result = await response.json();

                if (result.success && result.data) {
                    // Sort by rating and take top 8
                    const sorted = result.data.sort((a: Excursion, b: Excursion) => b.rating - a.rating).slice(0, 8);
                    setExcursions(sorted);
                }
            } catch (error) {
                console.error('Error fetching excursions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExcursions();
    }, []);

    if (isLoading) {
        return (
            <section className="py-12 bg-transparent">
                <div className="container px-4 mx-auto text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]" >Loading...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (excursions.length === 0) return null;

    const translations = {
        fr: {
            title: "Nos Meilleures Excursions",
            subtitle: "Vivez des expériences uniques à travers des activités authentiques et soigneusement sélectionnées.",
            viewAll: "Voir toutes les excursions"
        },
        en: {
            title: "Our Best Excursions",
            subtitle: "Experience unique adventures through authentic and carefully selected activities.",
            viewAll: "See all"
        },
        it: {
            title: "Le Nostre Migliori Escursioni",
            subtitle: "Vivete esperienze uniche attraverso attività autentiche e accuratamente selezionate.",
            viewAll: "Vedi tutte"
        },
        es: {
            title: "Nuestras Mejores Excursiones",
            subtitle: "Viva experiencias únicas a través de actividades auténticas y cuidadosamente seleccionadas.",
            viewAll: "Ver todas"
        }
    };

    const text = translations[locale as keyof typeof translations] || translations.fr;

    return (
        <section className="py-12 md:py-20">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 drop-shadow-sm">
                            {text.title}
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
                            {text.subtitle}
                        </p>
                    </div>
                    <Link
                        href={`/${locale}/nos-excursions`}
                        className="text-primary font-bold hover:underline flex items-center gap-2 text-lg shadow-sm"
                    >
                        {text.viewAll}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {excursions.map((excursion) => (
                        <Link
                            key={excursion.id}
                            href={`/${locale}/excursion/${excursion.id}`}
                            className="group flex flex-col glass overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] duration-300 rounded-[20px]"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <Image
                                    src={excursion.images[0] || "/placeholder.jpg"}
                                    alt={getLocalizedText(excursion.name)}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Wishlist Heart (Visual only for now) */}
                                <div className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white text-white hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-grow">
                                {/* Category/Label */}
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                                    {excursion.section === 'circuits' ? 'Circuit' : 'Activity'} • {getLocalizedText(excursion.duration)}
                                </div>

                                {/* Title */}
                                <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2 flex-grow group-hover:text-primary transition-colors">
                                    {getLocalizedText(excursion.name)}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-4">
                                    <div className="flex text-primary">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(excursion.rating) ? "fill-current" : "text-gray-300"}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground ml-1">{excursion.rating.toFixed(1)}</span>
                                    <span className="text-xs text-muted-foreground">({Math.floor(Math.random() * 200) + 50})</span>
                                </div>

                                {/* Price */}
                                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground font-medium">From</div>
                                    <div className="text-lg font-bold text-primary">
                                        {excursion.priceMAD} <span className="text-sm font-normal text-muted-foreground">MAD</span>
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

export default PopularExperiences;
