'use client';

import { useTranslation } from '@/lib/i18n/client';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALES, Locale } from '@/lib/i18n/config';

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
};

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = async (newLocale: Locale) => {
    await i18n.changeLanguage(newLocale);
    
    // Update URL with new locale
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const currentLocale = LOCALES.includes(pathSegments[0] as Locale) ? pathSegments[0] : null;
    
    let newPath: string;
    if (currentLocale) {
      // Replace existing locale
      pathSegments[0] = newLocale;
      newPath = `/${pathSegments.join('/')}`;
    } else {
      // Add locale prefix
      newPath = `/${newLocale}${pathname}`;
    }
    
    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Select language"
    >
      {LOCALES.map((locale) => (
        <option key={locale} value={locale}>
          {LANGUAGE_NAMES[locale]}
        </option>
      ))}
    </select>
  );
};