'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOriginal } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LOCALE, LOCALES, Locale } from './config';

let i18nInitialized = false;

export const initializeI18n = async () => {
  if (i18nInitialized) return;
  
  await i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // Basic defaults — remove spread of non-existent i18nextConfig
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: LOCALES,
      backend: {
        loadPath: '/api/translations/{{lng}}/{{ns}}',
      },
      detection: {
        order: ['path', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupFromPathIndex: 0,
      },
      react: {
        useSuspense: false,
      },
    });

  i18nInitialized = true;
};

export const useClientI18n = () => {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initializeI18n();
      
      // Extract locale from pathname
      const pathSegments = pathname?.split('/').filter(Boolean) || [];
      const potentialLocale = pathSegments[0];
      const locale = LOCALES.includes(potentialLocale as Locale) 
        ? potentialLocale 
        : DEFAULT_LOCALE;
      
      if (i18next.language !== locale) {
        await i18next.changeLanguage(locale);
      }
      
      setIsReady(true);
    };
    setup();
  }, [pathname]);

  return { 
    isReady, 
    i18n: i18next,
    locale: i18next.language as Locale
  };
};

export const useTranslation = (ns?: string) => {
  const { isReady } = useClientI18n();
  return useTranslationOriginal(ns);
};
