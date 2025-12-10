import { NextRequest, NextResponse } from 'next/server';
import { translations } from '@/lib/i18n/translations';

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; namespace: string }> }
) {
  const { locale, namespace } = await params;

  try {
    // Sanitize inputs
    if (!/^[a-z]{2}$/.test(locale) || !/^[\w-]+$/.test(namespace)) {
      return NextResponse.json(
        { error: 'Invalid locale or namespace' },
        { status: 400 }
      );
    }

    // Get translations from embedded data
    const localeData = translations[locale as keyof typeof translations];
    if (!localeData) {
      return NextResponse.json(
        { error: 'Locale not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const namespaceData = localeData[namespace as keyof typeof localeData];
    if (!namespaceData) {
      return NextResponse.json(
        { error: 'Namespace not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    return NextResponse.json(namespaceData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error(`Translation not found: ${locale}/${namespace}`, error);
    return NextResponse.json(
      { error: 'Translation not found' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}