// Re-export from the new location
export { Link, useRouter, usePathname, redirect } from '@/lib/i18n/navigation';
export { locales, defaultLocale } from '@/lib/i18n/config';

export const routing = {
  locales: ['fr', 'en', 'es', 'it'] as const,
  defaultLocale: 'fr' as const,
};
