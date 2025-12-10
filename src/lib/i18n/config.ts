export const locales = ['fr', 'en', 'es', 'it'] as const;
export const defaultLocale = 'fr' as const;

export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Legacy exports for backward compatibility
export const LOCALES = locales;
export const DEFAULT_LOCALE = defaultLocale;