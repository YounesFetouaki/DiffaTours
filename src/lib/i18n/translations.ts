import { Locale } from './config';

// Import all translation files
import enTranslations from '../../../messages/en.json';
import frTranslations from '../../../messages/fr.json';
import esTranslations from '../../../messages/es.json';
import itTranslations from '../../../messages/it.json';

export const translations: Record<Locale, any> = {
  fr: frTranslations,
  en: enTranslations,
  es: esTranslations,
  it: itTranslations,
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.fr;
}