'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
}

export const Providers = ({ children, locale }: ProvidersProps) => {
  return (
    <ClerkProvider
      signInUrl={`/${locale}/sign-in`}
      signUpUrl={`/${locale}/sign-up`}
      fallbackRedirectUrl={`/${locale}`}
    >
      <CurrencyProvider>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </CurrencyProvider>
    </ClerkProvider>
  );
};