'use client';

import { useParams } from 'next/navigation';
import { getTranslations } from './translations';
import { Locale, defaultLocale } from './config';

export function useLocale(): Locale {
  const params = useParams();
  return (params?.locale as Locale) || defaultLocale;
}

export function useTranslations(namespace?: string) {
  const locale = useLocale();
  const messages = getTranslations(locale);

  return function t(key: string, values?: Record<string, any>): string {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const keys = fullKey.split('.');
    
    let value = messages;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fullKey; // Return key if not found
      }
    }

    if (typeof value !== 'string') {
      return fullKey;
    }

    // Simple placeholder replacement
    if (values) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return values[key] !== undefined ? String(values[key]) : match;
      });
    }

    return value;
  };
}

// Alias for compatibility with existing code
export { useLocale as useLocaleHook };