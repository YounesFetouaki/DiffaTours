import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Image from 'next/image';
import { MapPin, Phone, Mail, Users, Utensils, Sparkles, Wind } from 'lucide-react';

export default function LeRiadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/9956bb_cdd31c8975c34219ab5897156b24f808mv2-1-2.avif"
            alt="Le Riad"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          <div className="relative z-10 text-center text-white px-4">
            <h6 className="text-[12px] font-bold uppercase tracking-[2px] mb-4">
              DÉCOUVREZ NOTRE HAVRE DE PAIX
            </h6>
            <h1 className="font-display text-[48px] lg:text-[72px] font-light leading-[1.2]">
              Le Riad
            </h1>
            <p className="text-[18px] mt-4 max-w-[600px] mx-auto">
              Un lieu où l'architecture traditionnelle marocaine rencontre le luxe moderne
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[900px] px-5 lg:px-[80px] text-center">
            <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-6">
              BIENVENUE CHEZ DIFFA TOURS
            </h6>
            <h2 className="font-display text-[32px] lg:text-[42px] text-[#2C2C2C] mb-8">
              Un havre de paix au cœur du Maroc
            </h2>
            <p className="text-body-lg text-[#5C5C5C] leading-[1.8] mb-6">
              <strong className="text-[#2C2C2C]">Diffa Tours</strong> est bien plus qu'une simple agence de voyage. 
              C'est une invitation à découvrir l'essence même de l'hospitalité marocaine dans un cadre exceptionnel 
              qui célèbre l'architecture traditionnelle et le savoir-faire ancestral.
            </p>
            <p className="text-body-lg text-[#5C5C5C] leading-[1.8]">
              Niché dans un écrin de verdure, notre riad offre une expérience unique où chaque détail a été 
              pensé pour votre confort et votre bien-être. Des patios ombragés aux jardins luxuriants, 
              en passant par nos piscines scintillantes, chaque espace respire la sérénité.
            </p>
          </div>
        </section>

        {/* Architecture Section with Images */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-4">
                  ARCHITECTURE AUTHENTIQUE
                </h6>
                <h3 className="font-display text-[28px] lg:text-[36px] text-[#2C2C2C] mb-6">
                  Un chef-d'œuvre architectural
                </h3>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7] mb-4">
                  Notre riad est un véritable témoignage de l'artisanat marocain traditionnel. 
                  Les arches élégantes, les colonnes finement sculptées et les zellige colorés 
                  créent une atmosphère intemporelle qui transporte nos hôtes dans un autre monde.
                </p>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7]">
                  Chaque coin de notre riad raconte une histoire, des plafonds en bois 
                  peint aux fontaines en mosaïque, en passant par les lanterne en fer forgé 
                  qui illuminent nos espaces communs d'une lumière chaleureuse.
                </p>
              </div>
              <div className="relative h-[400px] lg:h-[500px] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/9956bb_cdd31c8975c34219ab5897156b24f808mv2-1-2.avif"
                  alt="Architecture du Riad"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] lg:h-[500px] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] lg:order-1">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/9956bb_5b7062e5794a43e1a3b3e94a725e479fmv2-7.avif"
                  alt="Piscine et jardins"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="lg:order-2">
                <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-4">
                  ESPACES EXTÉRIEURS
                </h6>
                <h3 className="font-display text-[28px] lg:text-[36px] text-[#2C2C2C] mb-6">
                  Jardins et piscines d'exception
                </h3>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7] mb-4">
                  Nos espaces extérieurs sont une ode à la beauté naturelle du Maroc. 
                  Des jardins luxuriants plantés de palmiers et d'oliviers entourent nos 
                  piscines intérieure et extérieure, créant des oasis de fraîcheur et de tranquillité.
                </p>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7]">
                  Que vous souhaitiez vous détendre sur un transat au bord de la piscine, 
                  vous promener dans nos jardins parfumés ou profiter d'un moment de lecture 
                  sous une pergola ombragée, nos espaces extérieurs offrent le cadre idéal 
                  pour la relaxation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Amenities Highlights */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="text-center mb-12">
              <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-3">
                NOS INSTALLATIONS
              </h6>
              <h2 className="font-display text-[36px] lg:text-[42px] text-[#2C2C2C]">
                Des équipements de qualité
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users size={48} className="text-[#C9B382]" />
                </div>
                <h4 className="font-display text-[18px] text-[#2C2C2C] mb-2">
                  Espaces communs
                </h4>
                <p className="text-sm text-[#5C5C5C]">
                  Salons confortables et terrasses panoramiques
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Utensils size={48} className="text-[#C9B382]" />
                </div>
                <h4 className="font-display text-[18px] text-[#2C2C2C] mb-2">
                  Restaurant
                </h4>
                <p className="text-sm text-[#5C5C5C]">
                  Cuisine marocaine authentique et internationale
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles size={48} className="text-[#C9B382]" />
                </div>
                <h4 className="font-display text-[18px] text-[#2C2C2C] mb-2">
                  Spa & Hammam
                </h4>
                <p className="text-sm text-[#5C5C5C]">
                  Soins traditionnels et espace bien-être
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wind size={48} className="text-[#C9B382]" />
                </div>
                <h4 className="font-display text-[18px] text-[#2C2C2C] mb-2">
                  Piscines
                </h4>
                <p className="text-sm text-[#5C5C5C]">
                  Intérieure chauffée et extérieure avec vue
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-16 lg:py-24 bg-[#F8F5F0]">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-4">
                  NOTRE EMPLACEMENT
                </h6>
                <h3 className="font-display text-[28px] lg:text-[36px] text-[#2C2C2C] mb-6">
                  Idéalement situé
                </h3>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7] mb-8">
                  Diffa Tours bénéficie d'un emplacement privilégié, 
                  à proximité des principales attractions touristiques tout en offrant 
                  le calme et la tranquillité nécessaires à un séjour relaxant.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin size={24} className="text-[#C9B382] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-display text-[16px] text-[#2C2C2C] mb-1">Adresse</h5>
                      <p className="text-sm text-[#5C5C5C]">
                        2.5 Km Oasis Hassan II, Avenue Al Adarissa, 40000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone size={24} className="text-[#C9B382] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-display text-[16px] text-[#2C2C2C] mb-1">Téléphone</h5>
                      <p className="text-sm text-[#5C5C5C]">+212 661 822 441</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail size={24} className="text-[#C9B382] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-display text-[16px] text-[#2C2C2C] mb-1">Email</h5>
                      <p className="text-sm text-[#5C5C5C]">Contact@palaisriadberbere.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <h4 className="font-display text-[20px] text-[#2C2C2C] mb-6">
                  À proximité
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-[#5C5C5C]">
                    <span className="w-2 h-2 bg-[#C9B382] rounded-full"></span>
                    <span className="text-sm">Centre-ville - 5 minutes</span>
                  </li>
                  <li className="flex items-center gap-3 text-[#5C5C5C]">
                    <span className="w-2 h-2 bg-[#C9B382] rounded-full"></span>
                    <span className="text-sm">Médina historique - 10 minutes</span>
                  </li>
                  <li className="flex items-center gap-3 text-[#5C5C5C]">
                    <span className="w-2 h-2 bg-[#C9B382] rounded-full"></span>
                    <span className="text-sm">Souks traditionnels - 12 minutes</span>
                  </li>
                  <li className="flex items-center gap-3 text-[#5C5C5C]">
                    <span className="w-2 h-2 bg-[#C9B382] rounded-full"></span>
                    <span className="text-sm">Parcours de golf - 15 minutes</span>
                  </li>
                  <li className="flex items-center gap-3 text-[#5C5C5C]">
                    <span className="w-2 h-2 bg-[#C9B382] rounded-full"></span>
                    <span className="text-sm">Aéroport - 30 minutes</span>
                  </li>
                  <li className="flex items-center gap-3 text-[#5C5C5C]">
                    <span className="w-2 h-2 bg-[#C9B382] rounded-full"></span>
                    <span className="text-sm">Désert et dunes - 45 minutes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[800px] px-5 text-center">
            <h2 className="font-display text-[32px] lg:text-[42px] text-[#2C2C2C] mb-6">
              Venez découvrir notre riad
            </h2>
            <p className="text-body-lg text-[#5C5C5C] mb-8">
              Nous serions ravis de vous accueillir et de vous faire découvrir notre havre de paix. 
              Contactez-nous pour organiser une visite ou réserver votre séjour.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#" 
                className="inline-block bg-[#C9B382] text-white px-8 py-3 text-[14px] font-medium rounded-full hover:bg-primary transition-colors duration-300"
              >
                Réserver maintenant
              </a>
              <a 
                href="#" 
                className="inline-block bg-transparent border-2 border-[#C9B382] text-[#C9B382] px-8 py-3 text-[14px] font-medium rounded-full hover:bg-primary transition-colors duration-300"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}