'use client';

import Header from '@/components/sections/header';
import Image from 'next/image';
import { Award, Heart, Shield, Users, Star, MapPin, Calendar, ThumbsUp, Clock, TrendingUp, Route, UserCheck } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const values = [
  {
    icon: Heart,
    title: "Authenticité",
    description: "Nous privilégions les expériences locales authentiques pour vous immerger dans la vraie culture marocaine"
  },
  {
    icon: Award,
    title: "Qualité",
    description: "Des services de haute qualité avec des guides professionnels et passionnés par leur métier"
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Votre sécurité et votre confort sont nos priorités absolues à chaque étape du voyage"
  },
  {
    icon: Users,
    title: "Flexibilité",
    description: "Des circuits et excursions adaptés à vos besoins, préférences et rythme de voyage"
  }
];

const timeline = [
  {
    year: "1987",
    title: "Fondation",
    description: "Création de Diffa Tours avec une vision : faire découvrir le monde avec passion"
  },
  {
    year: "2017",
    title: "Expansion",
    description: "Extension de nos services à toutes les régions du Maroc"
  },
  {
    year: "2019",
    title: "Reconnaissance",
    description: "Plus de 5000 voyageurs satisfaits et nombreux prix d'excellence"
  },
  {
    year: "2023",
    title: "Innovation",
    description: "Lancement de circuits éco-responsables et expériences immersives"
  }
];

const stats = [
  { number: "35+", label: "Années d'expérience", icon: Clock },
  { number: "15,000+", label: "Voyageurs satisfaits", icon: Users },
  { number: "200+", label: "Circuits différents", icon: Route },
  { number: "50+", label: "Guides experts", icon: UserCheck }
];

const journey = [
  {
    step: 1,
    icon: MapPin,
    title: "Choisissez votre destination",
    description: "Sélectionnez parmi nos nombreuses excursions"
  },
  {
    step: 2,
    icon: Calendar,
    title: "Réservez facilement",
    description: "Réservation simple et paiement sécurisé"
  },
  {
    step: 3,
    icon: Users,
    title: "Rencontrez votre guide",
    description: "Guides locaux experts et passionnés"
  },
  {
    step: 4,
    icon: ThumbsUp,
    title: "Vivez l'expérience",
    description: "Profitez d'un voyage inoubliable"
  }
];

export default function QuiSommesNousPage() {
  const { ref: introRef, isVisible: introVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();
  const { ref: timelineRef, isVisible: timelineVisible } = useScrollAnimation();
  const { ref: journeyRef, isVisible: journeyVisible } = useScrollAnimation();
  const { ref: whyRef, isVisible: whyVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/moroccan-tour-company-team-spirit-divers-ed042805-20251124133347.jpg"
              alt="Qui Sommes-Nous - Diffa Tours"
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
                Qui Sommes-Nous
              </h1>
              <p className="font-secondary italic text-white text-lg md:text-xl lg:text-2xl font-normal">
                Votre partenaire de confiance pour découvrir le Maroc
              </p>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section ref={introRef as any} className="py-16 md:py-20 px-4 bg-white">
          <div className={`max-w-4xl mx-auto text-center scroll-fade ${introVisible ? 'visible' : ''}`}>
            <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
              NOTRE HISTOIRE
            </h6>
            <h2 className="text-3xl md:text-4xl font-display text-foreground mb-6">
              Diffa Tours, experts du tourisme mondial
            </h2>
            <p className="text-body-lg text-muted leading-relaxed mb-6">
              <strong className="text-primary">Diffa Tours</strong> est une agence de voyage spécialisée dans l'organisation
              d'excursions et de circuits au Maroc. Avec une passion profonde pour notre pays et une connaissance approfondie
              de ses richesses culturelles et naturelles, nous créons des expériences de voyage authentiques et mémorables.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef as any} className="py-16 bg-primary">
          <div className={`max-w-6xl mx-auto px-4 scroll-fade ${statsVisible ? 'visible' : ''}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm md:text-base text-white/90 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Values Cards Section */}
        <section ref={valuesRef as any} className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-12 scroll-fade ${valuesVisible ? 'visible' : ''}`}>
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
                NOS VALEURS
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground">
                Ce qui nous anime
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 border-t-4 border-primary flex flex-col h-full scroll-fade ${valuesVisible ? 'visible' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl mb-3 text-foreground">
                      {value.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed flex-grow">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline Section - Clean Professional Roadmap */}
        <section ref={timelineRef as any} className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-20 scroll-fade ${timelineVisible ? 'visible' : ''}`}>
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
                NOTRE PARCOURS
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-4">
                Une histoire de passion et d'engagement
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6" />
            </div>

            {/* Desktop Timeline - Clean Horizontal */}
            <div className="hidden lg:block relative pb-12">
              {/* Timeline Items */}
              <div className="grid grid-cols-4 gap-12 relative">
                {/* Connecting line through all items */}
                <div className="absolute top-[60px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/30 via-accent/50 to-primary/30" />

                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`relative scroll-fade ${timelineVisible ? 'visible' : ''}`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* Year Badge */}
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative mb-4">
                        <div className="w-[120px] h-[120px] bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center shadow-xl relative z-10 transform hover:scale-105 transition-transform duration-300">
                          <span className="text-white font-display font-bold text-2xl mb-1">{item.year}</span>
                          <div className="w-8 h-0.5 bg-white/50" />
                        </div>
                        {/* Subtle glow */}
                        <div className="absolute inset-0 bg-primary/20 blur-2xl -z-10" />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 border-l-2 border-primary min-h-[200px] flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-muted text-base leading-relaxed flex-grow">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet Timeline - 2 Columns */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-8 pb-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`relative scroll-fade ${timelineVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex items-start gap-6">
                    {/* Year Badge - Side */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center shadow-lg">
                          <span className="text-white font-display font-bold text-lg">{item.year}</span>
                        </div>
                        <div className="absolute inset-0 bg-primary/20 blur-xl -z-10" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 border-l-2 border-primary">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Timeline - Vertical Clean */}
            <div className="md:hidden space-y-8">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`scroll-fade ${timelineVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex items-start gap-5">
                    {/* Year Badge */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                          <span className="text-white font-display font-bold text-base">{item.year}</span>
                        </div>
                        <div className="absolute inset-0 bg-primary/20 blur-lg -z-10" />
                      </div>

                      {/* Connecting line to next */}
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-8 bg-gradient-to-b from-primary/50 to-accent/30 mx-auto mt-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-l-2 border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h3 className="font-display text-base font-bold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Journey Roadmap */}
        <section ref={journeyRef as any} className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
                VOTRE VOYAGE AVEC NOUS
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground">
                Comment nous travaillons
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {journey.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Arrow for desktop */}
                    {index < journey.length - 1 && (
                      <div className="hidden lg:block absolute top-12 right-0 transform translate-x-1/2 z-0">
                        <svg className="w-8 h-8 text-primary/30" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    <div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-2 relative z-10">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mb-4 font-display text-xl font-bold">
                        {step.step}
                      </div>
                      <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-accent" />
                      </div>
                      <h3 className="font-display text-lg mb-2 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section ref={whyRef as any} className="py-16 md:py-24 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h6 className="text-xs font-bold uppercase tracking-[2px] text-muted mb-4">
                POURQUOI DIFFA TOURS
              </h6>
              <h2 className="text-3xl md:text-4xl font-display text-foreground mb-8">
                Pourquoi choisir Diffa Tours ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Star, text: "Guides locaux expérimentés et passionnés" },
                { icon: MapPin, text: "Itinéraires personnalisables selon vos envies" },
                { icon: Users, text: "Petits groupes pour une expérience plus intime" },
                { icon: Award, text: "Prix transparents et compétitifs" },
                { icon: Shield, text: "Service client disponible 24/7" },
                { icon: Heart, text: "Expertise locale et connaissance approfondie du terrain" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed pt-2">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg text-center">
              <p className="font-script italic text-2xl md:text-3xl text-primary mb-8">
                Laissez-nous vous guider vers une aventure inoubliable au cœur du Maroc
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="btn btn-primary"
                >
                  Contactez-nous
                </a>
                <a
                  href="/nos-excursions"
                  className="btn btn-secondary"
                >
                  Découvrir nos excursions
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}