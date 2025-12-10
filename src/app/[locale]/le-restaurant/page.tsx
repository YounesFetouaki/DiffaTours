import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Image from 'next/image';
import { Utensils, Wine, Coffee, ChefHat, Clock, MapPin } from 'lucide-react';

export default function LeRestaurantPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/2-1-600x750-13.png"
            alt="Le Restaurant"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          <div className="relative z-10 text-center text-white px-4">
            <h6 className="text-[12px] font-bold uppercase tracking-[2px] mb-4">
              UNE EXPÉRIENCE GASTRONOMIQUE EXCEPTIONNELLE
            </h6>
            <h1 className="font-display text-[48px] lg:text-[72px] font-light leading-[1.2]">
              Le Restaurant
            </h1>
            <p className="text-[18px] mt-4 max-w-[600px] mx-auto">
              Savourez les saveurs authentiques de la cuisine marocaine et internationale
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[900px] px-5 lg:px-[80px] text-center">
            <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-6">
              GASTRONOMIE MAROCAINE
            </h6>
            <h2 className="font-display text-[32px] lg:text-[42px] text-[#2C2C2C] mb-8">
              Un voyage culinaire au cœur du Maroc
            </h2>
            <p className="text-body-lg text-[#5C5C5C] leading-[1.8] mb-6">
              Le restaurant de <strong className="text-[#2C2C2C]">Diffa Tours</strong> vous invite à découvrir 
              une cuisine raffinée qui célèbre les traditions culinaires marocaines tout en s'ouvrant aux 
              influences méditerranéennes et internationales.
            </p>
            <p className="text-body-lg text-[#5C5C5C] leading-[1.8]">
              Notre chef et son équipe préparent chaque jour des plats authentiques avec des ingrédients 
              frais et locaux, sélectionnés avec soin pour garantir une qualité exceptionnelle. 
              De nos tajines traditionnels à nos grillades savoureuses, chaque plat est une célébration 
              des saveurs et des arômes du Maroc.
            </p>
          </div>
        </section>

        {/* Cuisine Section with Images */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-4">
                  CUISINE AUTHENTIQUE
                </h6>
                <h3 className="font-display text-[28px] lg:text-[36px] text-[#2C2C2C] mb-6">
                  Des plats traditionnels marocains
                </h3>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7] mb-4">
                  Notre carte met à l'honneur les grands classiques de la cuisine marocaine : 
                  tajines mijotés aux saveurs subtiles, couscous royal généreux, pastillas délicates 
                  et méchoui fondant. Chaque recette est préparée selon les méthodes traditionnelles 
                  transmises de génération en génération.
                </p>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7]">
                  Nous utilisons des épices soigneusement sélectionnées - cumin, safran, gingembre, 
                  cannelle - qui apportent à nos plats cette complexité aromatique caractéristique 
                  de la gastronomie marocaine. Nos légumes proviennent des jardins locaux et notre 
                  viande est choisie auprès des meilleurs fournisseurs de la région.
                </p>
              </div>
              <div className="relative h-[400px] lg:h-[500px] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/Design-sans-titre-68-370x463-4.png"
                  alt="Cuisine marocaine"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] lg:h-[500px] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] lg:order-1">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/9956bb_cdd31c8975c34219ab5897156b24f808mv2-1-2.avif"
                  alt="Salle de restaurant"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="lg:order-2">
                <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-4">
                  AMBIANCE RAFFINÉE
                </h6>
                <h3 className="font-display text-[28px] lg:text-[36px] text-[#2C2C2C] mb-6">
                  Un cadre élégant et chaleureux
                </h3>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7] mb-4">
                  Notre salle de restaurant combine l'architecture traditionnelle marocaine avec 
                  un confort moderne. Les arches élégantes, les lanternes en cuivre et les zelliges 
                  colorés créent une atmosphère intime et raffinée, parfaite pour des repas mémorables.
                </p>
                <p className="text-body-regular text-[#5C5C5C] leading-[1.7]">
                  Vous pouvez également choisir de dîner en terrasse, sous les étoiles, dans le cadre 
                  enchanteur de notre patio fleuri. Le service attentionné de notre équipe et l'ambiance 
                  tamisée contribuent à faire de chaque repas un moment d'exception.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dining Options */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="text-center mb-12">
              <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-3">
                NOS SERVICES
              </h6>
              <h2 className="font-display text-[36px] lg:text-[42px] text-[#2C2C2C]">
                Moments de restauration
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Coffee size={48} className="text-[#C9B382]" />
                </div>
                <h4 className="font-display text-[20px] text-[#2C2C2C] mb-3">
                  Petit-déjeuner
                </h4>
                <p className="text-sm text-[#5C5C5C] mb-3">
                  7h00 - 11h00
                </p>
                <p className="text-sm text-[#5C5C5C]">
                  Buffet continental avec spécialités marocaines, pains frais, confitures maison, 
                  fruits de saison et jus fraîchement pressés.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Utensils size={48} className="text-[#C9B382]" />
                </div>
                <h4 className="font-display text-[20px] text-[#2C2C2C] mb-3">
                  Déjeuner
                </h4>
                <p className="text-sm text-[#5C5C5C] mb-3">
                  12h30 - 15h00
                </p>
                <p className="text-sm text-[#5C5C5C]">
                  Menu du jour et carte avec salades fraîches, grillades, tajines et 
                  spécialités méditerranéennes. Service à la carte ou formules.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ChefHat size={48} className="text-[#C9B382]" />
                </div>
                <h4 className="font-display text-[20px] text-[#2C2C2C] mb-3">
                  Dîner
                </h4>
                <p className="text-sm text-[#5C5C5C] mb-3">
                  19h00 - 22h30
                </p>
                <p className="text-sm text-[#5C5C5C]">
                  Expérience gastronomique complète avec menu dégustation ou à la carte. 
                  Cuisine raffinée dans une ambiance intimiste aux chandelles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Specialties Grid */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="text-center mb-12">
              <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-3">
                NOS SPÉCIALITÉS
              </h6>
              <h2 className="font-display text-[36px] lg:text-[42px] text-[#2C2C2C] mb-6">
                À découvrir absolument
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="relative h-[250px]">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/Design-sans-titre-68-370x463-4.png"
                    alt="Tajine"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-display text-[20px] text-[#2C2C2C] mb-2">
                    Tajine d'agneau aux pruneaux
                  </h4>
                  <p className="text-sm text-[#5C5C5C]">
                    Viande tendre mijotée avec amandes, pruneaux et miel, relevée d'un mélange 
                    subtil d'épices marocaines.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="relative h-[250px]">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/2-1-600x750-13.png"
                    alt="Couscous"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-display text-[20px] text-[#2C2C2C] mb-2">
                    Couscous royal berbère
                  </h4>
                  <p className="text-sm text-[#5C5C5C]">
                    Semoule fine accompagnée de sept légumes, viandes variées et bouillon parfumé. 
                    Une tradition familiale généreuse.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="relative h-[250px]">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/9954d743-8735-4b3b-868c-4bb1cfd3cbf8-palaisriadberbere-com/assets/images/Design-sans-titre-68-370x463-4.png"
                    alt="Pastilla"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-display text-[20px] text-[#2C2C2C] mb-2">
                    Pastilla au poulet
                  </h4>
                  <p className="text-sm text-[#5C5C5C]">
                    Feuilleté croustillant garni de poulet aux amandes, œufs et épices douces, 
                    saupoudré de sucre glace et cannelle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wine & Beverages */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[1000px] px-5 lg:px-[80px] text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Wine size={56} className="text-[#C9B382]" />
            </div>
            <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-4">
              CAVE ET BOISSONS
            </h6>
            <h3 className="font-display text-[28px] lg:text-[36px] text-[#2C2C2C] mb-6">
              Une sélection de vins soigneusement choisie
            </h3>
            <p className="text-body-regular text-[#5C5C5C] leading-[1.7] mb-6">
              Notre carte des vins propose une sélection de crus marocains et internationaux, 
              choisis pour accompagner parfaitement nos plats. Du Médaillon de Meknès aux grands 
              crus français, notre sommelier saura vous conseiller.
            </p>
            <p className="text-body-regular text-[#5C5C5C] leading-[1.7]">
              Nous proposons également une gamme complète de boissons non alcoolisées, incluant 
              nos thés à la menthe traditionnels, jus de fruits frais, sodas et eaux minérales.
            </p>
          </div>
        </section>

        {/* Practical Information */}
        <section className="py-16 lg:py-24 bg-[#F8F5F0]">
          <div className="container mx-auto max-w-[1200px] px-5 lg:px-[80px]">
            <div className="text-center mb-12">
              <h6 className="text-[12px] font-bold uppercase tracking-[2px] text-[#8B7355] mb-3">
                INFORMATIONS PRATIQUES
              </h6>
              <h2 className="font-display text-[36px] lg:text-[42px] text-[#2C2C2C]">
                Réservations et horaires
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
              <div className="bg-white p-8 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex items-start gap-4 mb-6">
                  <Clock size={32} className="text-[#C9B382] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-display text-[18px] text-[#2C2C2C] mb-3">
                      Horaires d'ouverture
                    </h4>
                    <ul className="space-y-2 text-sm text-[#5C5C5C]">
                      <li className="flex justify-between">
                        <span>Petit-déjeuner:</span>
                        <span className="font-medium">7h00 - 11h00</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Déjeuner:</span>
                        <span className="font-medium">12h30 - 15h00</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Dîner:</span>
                        <span className="font-medium">19h00 - 22h30</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex items-start gap-4 mb-6">
                  <MapPin size={32} className="text-[#C9B382] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-display text-[18px] text-[#2C2C2C] mb-3">
                      Réservations recommandées
                    </h4>
                    <p className="text-sm text-[#5C5C5C] mb-4">
                      Pour garantir votre table, nous vous recommandons de réserver, 
                      particulièrement pour le dîner et les week-ends.
                    </p>
                    <p className="text-sm text-[#5C5C5C]">
                      <strong>Téléphone:</strong> +212 661 822 441
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-[#5C5C5C] mb-6">
                <strong>Note:</strong> Nous pouvons accommoder les régimes spéciaux et les allergies alimentaires. 
                Merci de nous informer lors de votre réservation.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto max-w-[800px] px-5 text-center">
            <h2 className="font-display text-[32px] lg:text-[42px] text-[#2C2C2C] mb-6">
              Réservez votre table
            </h2>
            <p className="text-body-lg text-[#5C5C5C] mb-8">
              Contactez-nous dès maintenant pour vérifier les disponibilités et profiter de nos offres spéciales.
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
                className="inline-block bg-transparent border-2 border-[#C9B382] text-[#C9B382] px-8 py-3 text-[14px] font-medium rounded-full hover:bg-[#C9B382] hover:text-white transition-colors duration-300"
              >
                Voir le menu complet
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}