"use client";

import Header from "@/components/sections/header";
import { useTranslations } from '@/lib/i18n/hooks';
import { useParams } from 'next/navigation';

export default function TermsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string || 'fr';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dark background section for header visibility */}
      <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-to-b from-gray-900 to-transparent z-0" />
      
      <Header />
      
      <main className="flex-1 pt-40 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display mb-4">
              {t('terms.title')}
            </h1>
            <p className="text-muted text-lg">
              {t('terms.lastUpdated')}: {locale === 'fr' ? '5 décembre 2024' : locale === 'es' ? '5 de diciembre de 2024' : locale === 'it' ? '5 dicembre 2024' : 'December 5, 2024'}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-[20px] shadow-md p-6 sm:p-8 md:p-10 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section1.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section1.content')}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section2.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section2.content')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>{t('terms.section2.item1')}</li>
                <li>{t('terms.section2.item2')}</li>
                <li>{t('terms.section2.item3')}</li>
                <li>{t('terms.section2.item4')}</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section3.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section3.content')}
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section4.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section4.content')}
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section5.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section5.content')}
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section6.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section6.content')}
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section7.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section7.content')}
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-display mb-4">{t('terms.section8.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.section8.content')}
              </p>
            </section>

            {/* Contact */}
            <section className="bg-primary/5 p-6 rounded-[20px] border border-primary/20">
              <h2 className="text-2xl font-display mb-4">{t('terms.contact.title')}</h2>
              <p className="text-foreground leading-relaxed mb-4">
                {t('terms.contact.content')}
              </p>
              <div className="space-y-2 text-foreground">
                <p><strong>Email:</strong> contact@diffatours.com</p>
                <p><strong>{t('terms.contact.phone')}:</strong> +212 524 123 456</p>
                <p><strong>{t('terms.contact.address')}:</strong> Avenue Mohammed V, Quartier Gueliz, Marrakech, Maroc</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}