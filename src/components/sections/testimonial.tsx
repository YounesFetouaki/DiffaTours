"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { useTranslations, useLocale } from '@/lib/i18n/hooks';
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
    name: "jule nathalie",
    rating: 5,
    review: {
      fr: "Quelle belle semaine nous avons passée en compagnie d Abdel D13, qui nous a fait découvrir le sud Marocain. Guide formidable, toujours à notre écoute, bourré de petites attentions et de … Plus",
      en: "What a beautiful week we spent with Abdel D13, who introduced us to southern Morocco. Wonderful guide, always attentive, full of little attentions and… More",
      es: "Qué hermosa semana pasamos en compañía de Abdel D13, quien nos hizo descubrir el sur de Marruecos. Guía formidable, siempre atento, lleno de pequeños detalles y… Más",
      it: "Che bella settimana abbiamo trascorso in compagnia di Abdel D13, che ci ha fatto scoprire il sud del Marocco. Guida formidabile, sempre attenta, piena di piccole attenzioni e… Altro"
    }
  },
  {
    id: 2,
    name: "Emmanuelle Frémy",
    rating: 5,
    review: {
      fr: "Un immense merci à notre guide Abdel (D13) pour son accompagnement exemplaire lors de notre voyage dans le grand Sud du Maroc. Il a su guider notre groupe de 9 personnes avec professionnalisme, bienveillance et de remarquables qualités … Plus",
      en: "A huge thank you to our guide Abdel (D13) for his exemplary support during our trip to the great South of Morocco. He guided our group of 9 people with professionalism, kindness and remarkable qualities… More",
      es: "Un inmenso agradecimiento a nuestro guía Abdel (D13) por su acompañamiento ejemplar durante nuestro viaje al gran Sur de Marruecos. Supo guiar a nuestro grupo de 9 personas con profesionalismo, benevolencia y notables cualidades… Más",
      it: "Un immenso grazie alla nostra guida Abdel (D13) per il suo accompagnamento esemplare durante il nostro viaggio nel grande Sud del Marocco. Ha saputo guidare il nostro gruppo di 9 persone con professionalità, benevolenza e notevoli qualità… Altro"
    }
  },
  {
    id: 3,
    name: "Coccinelle Gap059",
    rating: 5,
    review: {
      fr: "Circuit villes impériales et Chefchaouen du 3 au 7 octobre 2025. Notre chauffeur Abdel ( D13) s'est montré prévenant et à l'écoute de notre groupe. Il a rendu notre séjour très agréable malgré la longueur des trajets. Merci Abdel pour ta sympathie. Sandrine et Lilou",
      en: "Imperial cities and Chefchaouen circuit from October 3 to 7, 2025. Our driver Abdel (D13) was considerate and attentive to our group. He made our stay very pleasant despite the long journeys. Thank you Abdel for your friendliness. Sandrine and Lilou",
      es: "Circuito ciudades imperiales y Chefchaouen del 3 al 7 de octubre de 2025. Nuestro conductor Abdel (D13) se mostró atento y a la escucha de nuestro grupo. Hizo nuestra estancia muy agradable a pesar de la longitud de los trayectos. Gracias Abdel por tu simpatía. Sandrine y Lilou",
      it: "Circuito città imperiali e Chefchaouen dal 3 al 7 ottobre 2025. Il nostro autista Abdel (D13) si è mostrato premuroso e attento al nostro gruppo. Ha reso il nostro soggiorno molto piacevole nonostante la lunghezza dei tragitti. Grazie Abdel per la tua simpatia. Sandrine e Lilou"
    }
  },
  {
    id: 4,
    name: "Béatrice Arnould",
    rating: 5,
    review: {
      fr: "Abdel a été notre chauffeur durant les excursions. C'est quelqu'un de sympathique, prévenant et aux petits soins pour nous. Il a rendu notre séjour très agréable et a cherché des solutions pour nous être agréable. Il est au top!",
      en: "Abdel was our driver during the excursions. He is someone friendly, considerate and very caring for us. He made our stay very pleasant and looked for solutions to please us. He is on top!",
      es: "Abdel fue nuestro conductor durante las excursiones. Es alguien simpático, atento y muy cuidadoso con nosotros. Hizo nuestra estancia muy agradable y buscó soluciones para agradarnos. ¡Es genial!",
      it: "Abdel è stato il nostro autista durante le escursioni. È una persona simpatica, premurosa e molto attenta a noi. Ha reso il nostro soggiorno molto piacevole e ha cercato soluzioni per accontentarci. È il top!"
    }
  },
  {
    id: 5,
    name: "Darkcloud639",
    rating: 5,
    review: {
      fr: "Merci à Abdel (D-13) notre chauffeur pour notre séjour (circuit grand sud). Sa sympathie, son écoute, son humour et sa disponibilité ont rendus le voyage agréable #ouistiti #oui. Chloé et Remi",
      en: "Thanks to Abdel (D-13) our driver for our stay (great south circuit). His friendliness, his listening, his humor and his availability made the trip pleasant #ouistiti #oui. Chloé and Remi",
      es: "Gracias a Abdel (D-13) nuestro conductor por nuestra estancia (circuito gran sur). Su simpatía, su escucha, su humor y su disponibilidad hicieron el viaje agradable #ouistiti #oui. Chloé y Remi",
      it: "Grazie a Abdel (D-13) il nostro autista per il nostro soggiorno (circuito grande sud). La sua simpatia, il suo ascolto, il suo umorismo e la sua disponibilità hanno reso il viaggio piacevole #ouistiti #oui. Chloé e Remi"
    }
  },
  {
    id: 6,
    name: "Martine Denage",
    rating: 5,
    review: {
      fr: "Un immense merci à notre chauffeur guide Abdel D13 pour notre circuit sud Marocain cette semaine... adorable jeune homme, plein de bonnes intentions à notre égard... ce fut 4 jours inoubliables.... si nous revenons au Maroc nous aimerions … Plus",
      en: "A huge thank you to our driver guide Abdel D13 for our southern Moroccan circuit this week... adorable young man, full of good intentions towards us... it was 4 unforgettable days.... if we return to Morocco we would like … More",
      es: "Un inmenso agradecimiento a nuestro conductor guía Abdel D13 por nuestro circuito sur marroquí esta semana... adorable joven, lleno de buenas intenciones hacia nosotros... fueron 4 días inolvidables.... si volvemos a Marruecos nos gustaría … Más",
      it: "Un immenso grazie al nostro autista guida Abdel D13 per il nostro circuito sud marocchino questa settimana... adorabile giovane uomo, pieno di buone intenzioni nei nostri confronti... sono stati 4 giorni indimenticabili.... se torneremo in Marocco vorremmo … Altro"
    }
  },
  {
    id: 7,
    name: "Vincent Chevalier",
    rating: 5,
    review: {
      fr: "Nous sommes partis en excurcion avec Abdel(D13) nous avons apprécié se gentillesse et son professionnalisme nous le recommandons ainsi que le guide Mr MORO merci à eux 2.",
      en: "We went on an excursion with Abdel (D13) we appreciated his kindness and professionalism we recommend him as well as the guide Mr MORO thanks to both of them.",
      es: "Fuimos de excursión con Abdel (D13) apreciamos su amabilidad y profesionalismo lo recomendamos así como al guía Sr. MORO gracias a los 2.",
      it: "Siamo andati in escursione con Abdel (D13) abbiamo apprezzato la sua gentilezza e professionalità lo raccomandiamo così come la guida Sig. MORO grazie a loro 2."
    }
  },
  {
    id: 8,
    name: "Patrice Avry",
    rating: 5,
    review: {
      fr: "Merci HICHAM BENNASSEF pour les bons conseils, Des excursions, très bien, avec des super guides. Quand nous reviendrons nous ferons de nouveau appel à vos services.",
      en: "Thank you HICHAM BENNASSEF for the good advice, Excursions, very good, with super guides. When we return we will call on your services again.",
      es: "Gracias HICHAM BENNASSEF por los buenos consejos, Excursiones, muy bien, con súper guías. Cuando volvamos llamaremos de nuevo a vuestros servicios.",
      it: "Grazie HICHAM BENNASSEF per i buoni consigli, Escursioni, molto bene, con super guide. Quando torneremo faremo di nuovo appello ai vostri servizi."
    }
  },
  {
    id: 9,
    name: "Nicolas Poupeau",
    rating: 5,
    review: {
      fr: "Nous revenons d'un circuit en 4x4 dans le sud marocain où nous avons passé un excellent séjour. Nous avons parcourru plusieurs villes/villages en passant par des paysages … Plus",
      en: "We are returning from a 4x4 circuit in southern Morocco where we had an excellent stay. We traveled through several cities/villages passing through landscapes … More",
      es: "Volvemos de un circuito en 4x4 en el sur de Marruecos donde pasamos una excelente estancia. Recorrimos varias ciudades/pueblos pasando por paisajes … Más",
      it: "Torniamo da un circuito in 4x4 nel sud del Marocco dove abbiamo trascorso un soggiorno eccellente. Abbiamo percorso diverse città/villaggi passando per paesaggi … Altro"
    }
  },
  {
    id: 10,
    name: "Mary Cy",
    rating: 5,
    review: {
      fr: "Un Sud marocain en 4x4, réservé par agence avec Boomerang, avec Rachid comme guide et Khalifa comme chauffeur. Super accueil par Simon, toujours à notre écoute à l'hôtel Wazo. … Plus",
      en: "A Moroccan South in 4x4, booked by agency with Boomerang, with Rachid as guide and Khalifa as driver. Super welcome by Simon, always listening to us at the Wazo hotel. … More",
      es: "Un Sur marroquí en 4x4, reservado por agencia con Boomerang, con Rachid como guía y Khalifa como conductor. Súper bienvenida por Simon, siempre atento en el hotel Wazo. … Más",
      it: "Un Sud marocchino in 4x4, prenotato tramite agenzia con Boomerang, con Rachid come guida e Khalifa come autista. Super accoglienza da parte di Simon, sempre attento all'hotel Wazo. … Altro"
    }
  },
  {
    id: 11,
    name: "Yannick DURET UE LAUDUN",
    rating: 5,
    review: {
      fr: "Raid 4x4 au Maroc, organisation parfaite, accueil par Simon qui est très professionnel et sympathique, notre guide d'un jour Ibrahim sur Marrakech a été très drôle et très professionnel également... notre guide Hussein pour le raid 4x4 est une … Plus",
      en: "4x4 Raid in Morocco, perfect organization, welcome by Simon who is very professional and friendly, our guide for a day Ibrahim in Marrakech was very funny and very professional too... our guide Hussein for the 4x4 raid is a … More",
      es: "Raid 4x4 en Marruecos, organización perfecta, bienvenida por Simon que es muy profesional y simpático, nuestro guía de un día Ibrahim en Marrakech fue muy divertido y muy profesional también... nuestro guía Hussein para el raid 4x4 es una … Más",
      it: "Raid 4x4 in Marocco, organizzazione perfetta, accoglienza da parte di Simon che è molto professionale e simpatico, la nostra guida di un giorno Ibrahim a Marrakech è stata molto divertente e molto professionale anche... la nostra guida Hussein per il raid 4x4 è una … Altro"
    }
  },
  {
    id: 12,
    name: "Delphine Torralba",
    rating: 5,
    review: {
      fr: "Très beau voyage circuit en 4&4 sud marocain, bonne organisation, véhicule de qualité avec un super chauffeur guide mohammed Bousdg, très bon travail avec beaucoup de connaissances, gentil et serviable. Le guide du groupe Mohammed très … Plus",
      en: "Very beautiful trip 4x4 circuit southern Morocco, good organization, quality vehicle with a super driver guide Mohammed Bousdg, very good work with a lot of knowledge, kind and helpful. The group guide Mohammed very … More",
      es: "Muy buen viaje circuito en 4x4 sur marroquí, buena organización, vehículo de calidad con un súper conductor guía Mohammed Bousdg, muy buen trabajo con muchos conocimientos, amable y servicial. El guía del grupo Mohammed muy … Más",
      it: "Bellissimo viaggio circuito in 4x4 sud marocchino, buona organizzazione, veicolo di qualità con un super autista guida Mohammed Bousdg, ottimo lavoro con molte conoscenze, gentile e disponibile. La guida del gruppo Mohammed molto … Altro"
    }
  },
  {
    id: 13,
    name: "Cedric Jouffroy",
    rating: 5,
    review: {
      fr: "Merci Abdo pour les bons conseils, tout a été parfait : Navettes aéroport, visite des souk, Essaouira et jardin de Majorelle. Tous les chauffeurs étaient sympa avec des véhicules propres et conduisaient … Plus",
      en: "Thank you Abdo for the good advice, everything was perfect: Airport shuttles, souk visit, Essaouira and Majorelle garden. All drivers were friendly with clean vehicles and drove … More",
      es: "Gracias Abdo por los buenos consejos, todo fue perfecto: Traslados aeropuerto, visita del zoco, Essaouira y jardín de Majorelle. Todos los conductores eran simpáticos con vehículos limpios y conducían … Más",
      it: "Grazie Abdo per i buoni consigli, tutto è stato perfetto: Navette aeroporto, visita del souk, Essaouira e giardino Majorelle. Tutti gli autisti erano simpatici con veicoli puliti e guidavano … Altro"
    }
  },
  {
    id: 14,
    name: "Marie Buono",
    rating: 5,
    review: {
      fr: "Nous sommes partis en excursion à Essaouira avec Abdou et Mourad. Nous avons été très bien accueillis, cette journée fut très enrichissante notamment grâce aux connaissances du territoire de Mourad. Joie, bonne humeur et rires. Nous avons passé un excellent moment et nous recommandons vivement cette agence.",
      en: "We went on an excursion to Essaouira with Abdou and Mourad. We were very well received, this day was very enriching thanks to Mourad's knowledge of the territory. Joy, good humor and laughter. We had a great time and we highly recommend this agency.",
      es: "Fuimos de excursión a Essaouira con Abdou y Mourad. Fuimos muy bien recibidos, este día fue muy enriquecedor gracias a los conocimientos del territorio de Mourad. Alegría, buen humor y risas. Pasamos un excelente momento y recomendamos encarecidamente esta agencia.",
      it: "Siamo andati in escursione a Essaouira con Abdou e Mourad. Siamo stati accolti molto bene, questa giornata è stata molto arricchente grazie alle conoscenze del territorio di Mourad. Gioia, buon umore e risate. Abbiamo passato un ottimo momento e raccomandiamo vivamente questa agenzia."
    }
  }
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const TestimonialSection = () => {
  const t = useTranslations();
  const locale = useLocale();
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
            {t('testimonial.title')}
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
                        "{typeof testimonial.review === 'string'
                          ? testimonial.review
                          : (testimonial.review as any)[locale] || (testimonial.review as any).fr}"
                      </p>

                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50 bg-primary/20 flex items-center justify-center">
                          <span className="text-xl font-bold text-white tracking-widest">
                            {getInitials(testimonial.name)}
                          </span>
                        </div>
                        <div className="text-center">
                          <h4 className="font-bold text-lg text-white">{testimonial.name}</h4>
                          <div className="flex gap-1 text-[#FFB73F] justify-center mt-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
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