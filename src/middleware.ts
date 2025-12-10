import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/fr(.*)',
  '/en(.*)',
  '/es(.*)',
  '/it(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
]);

const locales = ['fr', 'en', 'es', 'it'];
const defaultLocale = 'fr';

function getPreferredLocale(req: NextRequest): string {
  // 1. Check for locale cookie
  const localeCookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLang = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase();
    if (locales.includes(preferredLang)) {
      return preferredLang;
    }
  }

  // 3. Fallback to default locale
  return defaultLocale;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // If visiting root path, redirect to preferred locale
  if (pathname === '/') {
    const preferredLocale = getPreferredLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${preferredLocale}`;
    return NextResponse.redirect(url);
  }

  // Redirect /sign-up and /sign-in to localized versions
  if (pathname === '/sign-up' || pathname.startsWith('/sign-up/')) {
    const preferredLocale = getPreferredLocale(req);
    const url = req.nextUrl.clone();
    const restOfPath = pathname.slice('/sign-up'.length);
    url.pathname = `/${preferredLocale}/sign-up${restOfPath}`;
    return NextResponse.redirect(url);
  }

  if (pathname === '/sign-in' || pathname.startsWith('/sign-in/')) {
    const preferredLocale = getPreferredLocale(req);
    const url = req.nextUrl.clone();
    const restOfPath = pathname.slice('/sign-in'.length);
    url.pathname = `/${preferredLocale}/sign-in${restOfPath}`;
    return NextResponse.redirect(url);
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Get the response
  const response = NextResponse.next();

  // Store current locale in cookie for future visits
  const currentLocale = pathname.split('/')[1];
  if (locales.includes(currentLocale)) {
    response.cookies.set('NEXT_LOCALE', currentLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  // Remove Clerk's X-Frame-Options header to allow iframe embedding
  response.headers.delete('X-Frame-Options');
  
  // Set permissive CSP for iframe embedding
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.orchids.app http://*.orchids.app https://www.orchids.app http://www.orchids.app"
  );

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};