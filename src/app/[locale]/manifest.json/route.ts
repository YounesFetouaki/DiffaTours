import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  // Localized manifest data
  const manifestData: Record<string, any> = {
    fr: {
      name: "Diffa Tours",
      short_name: "Diffa Tours",
      description: "Découvrez le Maroc Authentique - Excursions & Circuits",
      lang: "fr",
      dir: "ltr",
    },
    en: {
      name: "Diffa Tours",
      short_name: "Diffa Tours",
      description: "Discover Authentic Morocco - Excursions & Tours",
      lang: "en",
      dir: "ltr",
    },
    es: {
      name: "Diffa Tours",
      short_name: "Diffa Tours",
      description: "Descubre el Marruecos Auténtico - Excursiones y Circuitos",
      lang: "es",
      dir: "ltr",
    },
    it: {
      name: "Diffa Tours",
      short_name: "Diffa Tours",
      description: "Scopri il Marocco Autentico - Escursioni e Tour",
      lang: "it",
      dir: "ltr",
    },
    ar: {
      name: "Diffa Tours",
      short_name: "Diffa Tours",
      description: "اكتشف المغرب الأصيل - رحلات وجولات",
      lang: "ar",
      dir: "rtl",
    },
  };

  const localeData = manifestData[locale] || manifestData.fr;

  const manifest = {
    name: localeData.name,
    short_name: localeData.short_name,
    description: localeData.description,
    start_url: `/${locale}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FFB73F",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["travel", "tourism", "lifestyle"],
    lang: localeData.lang,
    dir: localeData.dir,
    prefer_related_applications: false
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
