'use client';

import NextLink from 'next/link';
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation';
import { ComponentProps, forwardRef } from 'react';
import { useLocale } from './hooks';

export const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(
  function Link({ href, ...props }, ref) {
    const locale = useLocale();
    
    // Add locale prefix to href if it doesn't have one
    const hrefString = typeof href === 'string' ? href : href.pathname || '/';
    const localizedHref = hrefString.startsWith('/') && !hrefString.startsWith(`/${locale}`)
      ? `/${locale}${hrefString}`
      : hrefString;

    return NextLink({ ref, href: localizedHref, ...props });
  }
);

export function useRouter() {
  const router = useNextRouter();
  const locale = useLocale();

  return {
    push: (href: string, options?: any) => {
      const localizedHref = href.startsWith('/') && !href.startsWith(`/${locale}`)
        ? `/${locale}${href}`
        : href;
      router.push(localizedHref, options);
    },
    replace: (href: string, options?: any) => {
      const localizedHref = href.startsWith('/') && !href.startsWith(`/${locale}`)
        ? `/${locale}${href}`
        : href;
      router.replace(localizedHref, options);
    },
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
    prefetch: (href: string) => {
      const localizedHref = href.startsWith('/') && !href.startsWith(`/${locale}`)
        ? `/${locale}${href}`
        : href;
      router.prefetch(localizedHref);
    },
  };
}

export function usePathname() {
  const pathname = useNextPathname();
  const locale = useLocale();
  
  // Remove locale prefix from pathname
  return pathname.replace(`/${locale}`, '') || '/';
}

export function redirect(href: string) {
  if (typeof window !== 'undefined') {
    window.location.href = href;
  }
}