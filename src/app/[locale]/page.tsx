import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import TopDestinations from '@/components/sections/top-destinations';
import PopularExperiences from '@/components/sections/popular-experiences';
import WhyUs from '@/components/sections/why-us';
import TestimonialSection from '@/components/sections/testimonial';
import Newsletter from '@/components/sections/newsletter';
import ContactForm from '@/components/contact-form';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full overflow-x-hidden">
        <Hero />

        <TopDestinations />

        <PopularExperiences />

        <TestimonialSection />

        <Newsletter />
      </main>
    </div>
  );
}
