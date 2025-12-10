"use client";

import Image from 'next/image';
import { Users, Bath, Wifi, AirVent, Check } from 'lucide-react';
import Header from '@/components/sections/header';
import { Link } from '@/i18n/routing';

const roomsData = [
  {
    title: "Suite avec Lit King Size & Salon – Vue sur Piscine",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/2-1-1-8.avif",
    guests: 5,
    bathrooms: 1,
    wifi: true,
    airConditioning: true,
    description: "Vivez une expérience de séjour exceptionnelle dans notre Suite avec Vue sur Piscine, un espace spacieux et raffiné, parfait pour allier confort, intimité et élégance. Dotée d'un lit king size et d'un salon privé, cette suite est idéale pour les couples, les familles ou les petits groupes souhaitant profiter d'un cadre paisible et luxueux.",
    features: [
      "Lit King Size ultra-confortable",
      "Salon privé spacieux",
      "Vue panoramique sur la piscine",
      "Salle de bain moderne avec douche italienne",
      "Balcon ou terrasse privée",
      "Minibar et coffre-fort",
      "Climatisation réversible"
    ]
  },
  {
    title: "Chambre Double – Vue Jardin & Piscine",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/1-9.avif",
    guests: 3,
    bathrooms: 1,
    wifi: true,
    airConditioning: true,
    description: "Laissez-vous séduire par le charme naturel de notre Chambre Double avec Vue sur Jardin et Piscine, un véritable cocon de sérénité pour un séjour inoubliable. Idéale pour les couples ou les petits groupes, elle combine confort moderne et cadre apaisant.",
    features: [
      "Lit double confortable",
      "Vue sur jardin luxuriant et piscine",
      "Salle de bain avec douche",
      "Décoration marocaine authentique",
      "Espace de travail",
      "Wi-Fi haut débit gratuit",
      "Produits d'accueil artisanaux"
    ]
  },
  {
    title: "Chambre Familiale Deluxe avec Portes Coulissantes",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/4-780x975-10.png",
    guests: 5,
    bathrooms: 1,
    wifi: true,
    airConditioning: true,
    description: "Profitez d'un séjour en famille dans notre Chambre Familiale Deluxe, spacieuse et lumineuse, équipée de portes coulissantes pour plus de praticité et d'intimité. Parfaite pour accueillir jusqu'à 5 personnes, cette chambre offre un cadre élégant, idéal pour se détendre en toute sérénité.",
    features: [
      "Deux espaces séparés par portes coulissantes",
      "Lits jumeaux ou king size selon configuration",
      "Espace familial généreux",
      "Grande salle de bain",
      "Coin salon confortable",
      "Balcon avec vue",
      "Équipements adaptés aux enfants"
    ]
  }
];

export default function ChambreEtSuitesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/2-1-1-8.avif"
            alt="Chambres et Suites"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          <div className="relative z-10 text-center text-white px-4">
            <h6 className="text-[12px] font-bold uppercase tracking-[2px] mb-4">
              PROFITEZ D'UNE EXPÉRIENCE DE SÉJOUR D'EXCEPTION
            </h6>
            <h1 className="font-display text-[48px] lg:text-[72px] font-light leading-[1.2]">
              Chambres et Suites
            </h1>
            <p className="text-[18px] mt-4 max-w-[600px] mx-auto">
              Découvrez nos chambres et suites élégantes, conçues pour votre confort et votre bien-être
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[900px] px-5 lg:px-[80px] text-center">
            <p className="text-body-lg text-[#5C5C5C] leading-[1.8]">
              Chaque chambre et suite de nos hébergements partenaires <strong className="text-[#2C2C2C]">Diffa Tours</strong> a été 
              soigneusement conçue pour offrir une expérience unique alliant luxe, confort et authenticité marocaine. 
              Nos hébergements spacieux disposent de toutes les commodités modernes tout en préservant le charme 
              traditionnel qui fait la renommée de nos établissements partenaires.
            </p>
          </div>
        </section>

        {/* Rooms Grid Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="space-y-20">
              {roomsData.map((room, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="relative h-[400px] lg:h-[500px] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                      <Image
                        src={room.image}
                        alt={room.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <h3 className="font-display text-[28px] lg:text-[32px] text-[#2C2C2C] mb-4">
                      {room.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-[#5c5c5c] mb-6 pb-6 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-[#8B7355]" />
                        <span>{room.guests} invités</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath size={18} className="text-[#8B7355]" />
                        <span>{room.bathrooms} salle de bains</span>
                      </div>
                      {room.wifi && (
                        <div className="flex items-center gap-2">
                          <Wifi size={18} className="text-[#8B7355]" />
                          <span>Wi-Fi gratuit</span>
                        </div>
                      )}
                      {room.airConditioning && (
                        <div className="flex items-center gap-2">
                          <AirVent size={18} className="text-[#8B7355]" />
                          <span>Climatisation</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-body-regular text-[#5c5c5c] leading-[1.7] mb-6">
                      {room.description}
                    </p>
                    
                    <div className="mb-8">
                      <h4 className="font-display text-[18px] text-[#2C2C2C] mb-4">
                        Équipements et services
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {room.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#5c5c5c]">
                            <Check size={16} className="text-[#8B7355] mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link 
                      href="/reservation"
                      className="inline-block bg-[#C9B382] text-white px-8 py-3 text-[14px] font-medium rounded-full hover:bg-primary transition-colors duration-300"
                    >
                      Réserver cette chambre
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Amenities Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="text-center mb-12">
              <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-3">
                TOUS NOS HÉBERGEMENTS INCLUENT
              </h6>
              <h2 className="font-display text-[36px] lg:text-[42px] text-[#2C2C2C]">
                Équipements standard
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[
                "Literie premium",
                "Linge de maison de qualité",
                "Produits d'accueil bio",
                "Climatisation",
                "Wi-Fi haut débit",
                "Télévision écran plat",
                "Coffre-fort",
                "Minibar",
                "Sèche-cheveux",
                "Peignoirs et chaussons",
                "Service de ménage quotidien",
                "Room service 24h/24"
              ].map((amenity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check size={20} className="text-[#C9B382] flex-shrink-0" />
                  <span className="text-sm text-[#2C2C2C]">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-[#F8F5F0]">
          <div className="container mx-auto max-w-[800px] px-5 text-center">
            <h2 className="font-display text-[32px] lg:text-[42px] text-[#2C2C2C] mb-6">
              Prêt à réserver votre séjour ?
            </h2>
            <p className="text-body-lg text-[#5C5C5C] mb-8">
              Contactez-nous dès maintenant pour vérifier les disponibilités et profiter de nos offres spéciales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/reservation"
                className="inline-block bg-[#C9B382] text-white px-8 py-3 text-[14px] font-medium rounded-full hover:bg-primary transition-colors duration-300"
              >
                Vérifier la disponibilité
              </Link>
              <Link 
                href="/contact"
                className="inline-block bg-transparent border-2 border-[#C9B382] text-[#C9B382] px-8 py-3 text-[14px] font-medium rounded-full hover:bg-[#C9B382] hover:text-white transition-colors duration-300"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}