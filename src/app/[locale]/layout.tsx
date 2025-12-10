import type { Metadata, Viewport } from "next";
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import Footer from '@/components/sections/footer';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { FloatingWhatsApp } from '@/components/floating-whatsapp';
import { ChatBot } from '@/components/chatbot';
import '@/app/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#FFB73F',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://diffatours.com'),
  title: {
    default: "Diffa Tours - Découvrez le Maroc Authentique | Excursions & Circuits",
    template: "%s | Diffa Tours"
  },
  description: "Découvrez le Maroc avec Diffa Tours : excursions authentiques à Marrakech, Agadir, désert du Sahara. Circuits personnalisés, guides experts, expériences inoubliables.",
  keywords: ["Maroc", "excursions Marrakech", "circuits Maroc", "voyage Maroc", "Sahara", "Agadir", "tours Marrakech", "excursions désert", "Diffa Tours"],
  authors: [{ name: "Diffa Tours" }],
  creator: "Diffa Tours",
  publisher: "Diffa Tours",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'es_ES', 'it_IT'],
    url: 'https://diffatours.com',
    siteName: 'Diffa Tours',
    title: 'Diffa Tours - Découvrez le Maroc Authentique',
    description: 'Excursions et circuits authentiques au Maroc. Découvrez Marrakech, le Sahara, Agadir avec des guides experts.',
    images: [
      {
        url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/stunning-wide-panoramic-view-of-moroccan-948b1144-20251123184351.jpg',
        width: 1200,
        height: 630,
        alt: 'Diffa Tours - Excursions au Maroc',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diffa Tours - Découvrez le Maroc Authentique',
    description: 'Excursions et circuits authentiques au Maroc',
    images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/9954d743-8735-4b3b-868c-4bb1cfd3cbf8/generated_images/stunning-wide-panoramic-view-of-moroccan-948b1144-20251123184351.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#FFB73F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href={`/${locale}/manifest.json`} />
        <Script
          src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"
          strategy="lazyOnload"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "Diffa Tours",
              "description": "Agence de voyage spécialisée dans les excursions et circuits au Maroc",
              "url": "https://diffatours.com",
              "logo": "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/diffatours-logo2-1764026359909.png",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "MA",
                "addressLocality": "Marrakech"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "31.6295",
                "longitude": "-7.9811"
              },
              "priceRange": "$$",
              "areaServed": [
                {
                  "@type": "Country",
                  "name": "Morocco"
                }
              ],
              "knowsAbout": ["Tours au Maroc", "Excursions Marrakech", "Circuits Sahara", "Voyages Agadir"],
              "sameAs": []
            })
          }}
        />
      </head>
      <body>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="4768eaf7-81ce-4147-a9b1-188bebe73228"
        />
        <ScrollProgress />
        <ClerkProvider
          localization={locale === 'fr' ? frFR : undefined}
          appearance={{
            elements: {
              rootBox: "flex justify-center items-center",
              card: "shadow-xl rounded-[20px]",
              headerTitle: "text-2xl font-display",
              headerSubtitle: "text-muted",
              socialButtonsBlockButton: "rounded-full",
              formButtonPrimary: "rounded-full bg-primary hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90"
            },
            variables: {
              colorPrimary: '#FFB73F',
              colorText: '#1a1a1a',
              colorTextSecondary: '#666666',
              borderRadius: '1.25rem'
            }
          }}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <CurrencyProvider>
            <CartProvider>
              {children}
              <Footer />
              <FloatingWhatsApp />
              <ChatBot />
              <Toaster />
            </CartProvider>
          </CurrencyProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}