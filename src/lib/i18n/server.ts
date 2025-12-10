import { headers } from 'next/headers';
import { cache } from 'react';
import i18next, { InitOptions } from 'i18next';
import { DEFAULT_LOCALE, Locale } from './config';
const i18nextConfig: InitOptions = {
  ns: ['common'],
  fallbackLng: DEFAULT_LOCALE,
};

const LOCALE_HEADER = 'x-locale';

// Backend function to load translations from API
const loadTranslations = async (language: string, namespace: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/translations/${language}/${namespace}`,
      { cache: 'force-cache' } // ISR-like caching
    );
    
    if (!response.ok) {
      console.error(`Failed to load translation: ${language}/${namespace}`);
      return {};
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error loading translation ${language}/${namespace}:`, error);
    return {};
  }
};

// Memoize i18next initialization per request
export const getServerI18n = cache(async () => {
  const headerList = await headers();
  const locale = (headerList.get(LOCALE_HEADER) || DEFAULT_LOCALE) as Locale;

  // Create a new i18next instance for this request
  const i18nInstance = i18next.createInstance();
  
  await i18nInstance.init({
    ...i18nextConfig,
    lng: locale,
    react: { useSuspense: false },
  } as InitOptions);

  // Preload common namespace
  for (const ns of i18nextConfig.ns || []) {
    const translations = await loadTranslations(locale, ns);
    i18nInstance.addResourceBundle(locale, ns, translations);
  }

  return { 
    t: i18nInstance.t.bind(i18nInstance),
    locale,
    i18n: i18nInstance
  };
});
