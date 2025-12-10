'use client';

import Image from 'next/image';
import { Car, Plane, Hotel, Users, MapPin, Utensils, Building2, Calendar, Sparkles, Crown, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import Header from '@/components/sections/header';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, useEffect } from 'react';

const services = [
  {
    icon: Car,
    title: "Location de véhicules",
    description: "Louez des véhicules confortables avec ou sans chauffeur pour vos déplacements au Maroc. Options 4x4, minibus et voitures de luxe disponibles.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/luxury-suv-4x4-vehicle-on-moroccan-deser-c09aa1c0-20251129021707.jpg"
  },
  {
    icon: Plane,
    title: "Transferts aéroport",
    description: "Service de transfert professionnel depuis et vers tous les aéroports du Maroc. Ponctualité et confort garantis.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/airport-transfer-service-in-morocco-prof-1116b76b-20251129021706.jpg"
  },
  {
    icon: Hotel,
    title: "Réservation d'hébergements",
    description: "Réservation de riads, hôtels et hébergements traditionnels dans toutes les villes du Maroc selon votre budget.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/traditional-moroccan-riad-interior-court-6705742c-20251129021706.jpg"
  },
  {
    icon: Users,
    title: "Guides privés",
    description: "Guides touristiques professionnels parlant plusieurs langues pour vous accompagner lors de vos visites.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/professional-multilingual-tour-guide-in--5b9cdd95-20251129021722.jpg"
  },
  {
    icon: MapPin,
    title: "Circuits sur mesure",
    description: "Conception d'itinéraires personnalisés adaptés à vos envies, votre budget et la durée de votre séjour.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/custom-morocco-tour-itinerary-planning-m-ae0b3f6a-20251129021725.jpg"
  },
  {
    icon: Utensils,
    title: "Expériences culinaires",
    description: "Cours de cuisine marocaine, dîners traditionnels et découverte de la gastronomie locale avec des chefs.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/moroccan-cooking-class-chef-teaching-tra-c09089e7-20251129021723.jpg"
  }
];

const premiumServices = [
  {
    icon: Crown,
    title: "Gold Palace",
    description: "Salle de réception luxueuse pour vos événements d'exception : mariages, galas, soirées de prestige dans un cadre raffiné et élégant."
  },
  {
    icon: Building2,
    title: "Congress Palace",
    description: "Centre de congrès moderne équipé des dernières technologies pour vos séminaires, conférences et événements professionnels d'envergure."
  },
  {
    icon: Calendar,
    title: "Organisation d'événements",
    description: "De la conception à la réalisation, nous orchestrons vos événements corporate et privés avec professionnalisme et créativité."
  },
  {
    icon: Sparkles,
    title: "Services VIP",
    description: "Expérience haut de gamme avec conciergerie privée, accès privilégiés et prestations sur mesure pour une expérience inoubliable."
  }
];

export default function AutresServicesPage() {
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  const { ref: premiumRef, isVisible: premiumVisible } = useScrollAnimation();
  const { ref: venueRef, isVisible: venueVisible } = useScrollAnimation();
  const { ref: golfRef, isVisible: golfVisible } = useScrollAnimation();

  // Get current locale from URL
  const [currentLocale, setCurrentLocale] = useState('fr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/');
      const locale = pathSegments[1] || 'fr';
      setCurrentLocale(locale);
    }
  }, []);

  // Helper function to get string value from translation object or string
  const getStringValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return value[currentLocale as keyof typeof value] || value.en || value.fr || '';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/professional-travel-services-scene-in-mo-0a833c10-20251124133346.jpg"
              alt="Autres Services - Diffa Tours"
              fill
              style={{ objectFit: 'cover' }}
              priority
              className="z-0"
              unoptimized
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
                Autres Services
              </h1>
              <p className="font-secondary italic text-white text-lg md:text-xl lg:text-2xl font-normal">
                Des services complets pour un voyage sans souci
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section ref={contentRef as any} className="py-16 md:py-24 px-4 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 scroll-fade ${contentVisible ? 'visible' : ''}`}>
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
                SERVICES COMPLÉMENTAIRES
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">
                Tous les services pour votre voyage au Maroc
              </h2>
              <p className="text-body-lg text-muted max-w-3xl mx-auto leading-relaxed">
                En plus de nos excursions et circuits, Diffa Tours vous propose une gamme complète de services
                pour faciliter votre voyage et enrichir votre expérience au Maroc.
              </p>
            </div>

            {/* Services Grid with Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 scroll-fade ${contentVisible ? 'visible' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-500 hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/90 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl mb-3 text-foreground">
                        {getStringValue(service.title)}
                      </h3>
                      <p className="text-muted leading-relaxed">
                        {getStringValue(service.description)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Golf Section - Enhanced */}
        <section ref={golfRef as any} className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-12 scroll-fade ${golfVisible ? 'visible' : ''}`}>
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
                SPORT & LOISIRS
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">
                Golf à Marrakech
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
              {/* Left Column - Text Content */}
              <div className={`scroll-fade ${golfVisible ? 'visible' : ''}`}>
                <div className="space-y-6 text-muted text-base leading-relaxed">
                  <p>
                    While Marrakech is renowned for its breathtaking setting, allowing you to spend a unique vacation combining varied landscapes and a very rich culture, you should also know that the former king Hassan II had the ambition for the imperial city to quickly become the epicenter of golf in the Mediterranean basin.
                  </p>
                  <p>
                    Today, Marrakech boasts some of the most prestigious golf courses in North Africa, designed by world-renowned architects. These exceptional courses blend seamlessly with the stunning Moroccan landscape, offering golfers an unforgettable experience against the backdrop of the Atlas Mountains.
                  </p>
                  <p>
                    Whether you're a seasoned golfer or a beginner, we can arrange tee times at the finest courses, provide equipment rental, organize lessons with professional instructors, and even plan golf tournaments for groups.
                  </p>

                  <div className="bg-primary/5 p-6 mt-8">
                    <h4 className="font-display text-lg mb-4 text-foreground">Nos Services Golf Incluent :</h4>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start">
                        <span className="text-primary mr-3">✓</span>
                        <span>Réservation de tee times sur les meilleurs parcours</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3">✓</span>
                        <span>Location d'équipement professionnel</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3">✓</span>
                        <span>Leçons avec des instructeurs certifiés PGA</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3">✓</span>
                        <span>Transferts vers et depuis les parcours</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3">✓</span>
                        <span>Organisation de tournois privés</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-3">✓</span>
                        <span>Packages golf et hébergement</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Main Image */}
              <div className={`scroll-fade ${golfVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
                <div className="relative h-[400px] md:h-[500px] overflow-hidden shadow-lg">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/panoramic-view-of-a-luxury-golf-course-i-2eade5e5-20251129021706.jpg"
                    alt="Golf Course Marrakech"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Golf Gallery - 3 Unique Images */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 scroll-fade ${golfVisible ? 'visible' : ''}`} style={{ animationDelay: '0.4s' }}>
              <div className="relative h-[250px] overflow-hidden shadow-md">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/panoramic-view-of-a-luxury-golf-course-i-2eade5e5-20251129021706.jpg"
                  alt="Golf Course Panoramic View"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-110"
                  unoptimized
                />
              </div>
              <div className="relative h-[250px] overflow-hidden shadow-md">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/close-up-of-golf-green-with-flag-on-a-mo-6eeac1da-20251129021706.jpg"
                  alt="Golf Green Close-up"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-110"
                  unoptimized
                />
              </div>
              <div className="relative h-[250px] overflow-hidden shadow-md">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/e432ee58-766b-4e14-9cf5-ba8a67968553/generated_images/golf-clubhouse-in-marrakech-morocco-luxu-dffa0e8b-20251129021706.jpg"
                  alt="Golf Clubhouse"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-110"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* Premium Venues & Events Section */}
        <section ref={premiumRef as any} className="py-16 md:py-24 px-4 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 scroll-fade ${premiumVisible ? 'visible' : ''}`}>
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
                PRESTATIONS PREMIUM
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">
                Gold Palace & Congress Palace
              </h2>
              <p className="text-body-lg text-muted max-w-3xl mx-auto leading-relaxed">
                Des espaces d'exception pour vos événements les plus prestigieux. Salles de réception luxueuses,
                centres de congrès modernes et services haut de gamme pour faire de vos événements des moments inoubliables.
              </p>
            </div>

            {/* Premium Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {premiumServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white p-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(255,183,63,0.15)] transition-all duration-300 hover:-translate-y-2 scroll-fade ${premiumVisible ? 'visible' : ''}`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-display text-2xl mb-4 text-foreground">
                      {getStringValue(service.title)}
                    </h3>
                    <p className="text-muted leading-relaxed text-lg">
                      {getStringValue(service.description)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Venue Details Section */}
        <section ref={venueRef as any} className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Gold Palace */}
              <div className={`scroll-fade ${venueVisible ? 'visible' : ''}`}>
                <div className="relative h-[400px] mb-8 overflow-hidden">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/luxurious-moroccan-wedding-hall-gold-pa-6aff0f4c-20251128223845.jpg"
                    alt="Gold Palace"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-6 left-6 px-6 py-3" style={{
                    background: 'linear-gradient(135deg, #D4AF37, #F4E5B3, #D4AF37)',
                    border: '2px solid #B8941F'
                  }}>
                    <span className="text-white font-bold uppercase tracking-wider text-sm drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Gold Palace</span>
                  </div>
                </div>
                <h3 className="font-display text-3xl mb-4 text-foreground">
                  Un Écrin de Luxe pour vos Célébrations
                </h3>
                <p className="text-muted leading-relaxed mb-6">
                  Le Gold Palace est une salle de réception prestigieuse conçue pour accueillir vos événements
                  les plus raffinés. Avec sa décoration somptueuse inspirée de l'art marocain traditionnel,
                  ses lustres en cristal et son architecture élégante, ce lieu d'exception saura sublimer
                  vos mariages, galas et réceptions privées.
                </p>
                <ul className="space-y-3 text-muted">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">✦</span>
                    <span>Capacité jusqu'à 500 personnes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">✦</span>
                    <span>Décoration luxueuse personnalisable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">✦</span>
                    <span>Équipements audiovisuels haut de gamme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">✦</span>
                    <span>Service traiteur gastronomique</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">✦</span>
                    <span>Équipe dédiée à l'organisation</span>
                  </li>
                </ul>
              </div>

              {/* Congress Palace */}
              <div className={`scroll-fade ${venueVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
                <div className="relative h-[400px] mb-8 overflow-hidden">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/modern-moroccan-congress-center-with-st-4bc9cf64-20251128223845.jpg"
                    alt="Congress Palace"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-accent to-primary px-6 py-3">
                    <span className="text-white font-bold uppercase tracking-wider text-sm">Congress Palace</span>
                  </div>
                </div>
                <h3 className="font-display text-3xl mb-4 text-foreground">
                  Innovation et Technologie au Service de vos Événements
                </h3>
                <p className="text-muted leading-relaxed mb-6">
                  Le Congress Palace est un centre de congrès ultramoderne équipé des technologies les plus
                  avancées. Idéal pour vos séminaires, conférences internationales, salons professionnels
                  et événements corporate, cet espace modulable s'adapte à toutes vos exigences avec
                  professionnalisme et efficacité.
                </p>
                <ul className="space-y-3 text-muted">
                  <li className="flex items-start">
                    <span className="text-accent mr-3 mt-1">✦</span>
                    <span>Salles modulables de 50 à 1000 personnes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-3 mt-1">✦</span>
                    <span>Équipements de visioconférence HD</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-3 mt-1">✦</span>
                    <span>Système audio et écrans LED professionnels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-3 mt-1">✦</span>
                    <span>WiFi haut débit et support technique</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-3 mt-1">✦</span>
                    <span>Espaces networking et pause-café</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Single CTA Section - Unified */}
        <section className="py-16 md:py-24 px-4 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <div className={`bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-10 md:p-14 scroll-fade ${venueVisible ? 'visible' : ''}`} style={{ animationDelay: '0.4s' }}>
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="font-display text-3xl md:text-4xl mb-6 text-foreground">
                  Besoin d'un service particulier ?
                </h3>
                <p className="text-body-lg text-muted mb-8 leading-relaxed">
                  Que ce soit pour organiser votre événement d'exception au Gold Palace ou Congress Palace,
                  réserver une partie de golf sur les plus beaux parcours de Marrakech, ou bénéficier de tout
                  autre service sur mesure, notre équipe d'experts est à votre disposition pour concrétiser vos projets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="btn btn-primary">
                    Contactez-nous
                  </a>
                  <a href="/nos-excursions" className="btn btn-secondary">
                    Découvrir nos excursions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}