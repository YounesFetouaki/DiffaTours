'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'MAD' | 'USD' | 'EUR' | 'GBP';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  convertPrice: (priceInMAD: number) => number;
  formatPrice: (priceInMAD: number) => string;
}

const exchangeRates = {
  MAD: 1,
  USD: 0.10, // 1 MAD = 0.10 USD (approximate)
  EUR: 0.092, // 1 MAD = 0.092 EUR (approximate)
  GBP: 0.078, // 1 MAD = 0.078 GBP (approximate)
};

const currencySymbols = {
  MAD: 'DH',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('MAD');
  const [mounted, setMounted] = useState(false);

  // Load saved currency on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('currency') as Currency;
    if (saved && (saved === 'MAD' || saved === 'USD' || saved === 'EUR' || saved === 'GBP')) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    if (mounted) {
      localStorage.setItem('currency', curr);
    }
  };

  const convertPrice = (priceInMAD: number): number => {
    return Math.round(priceInMAD * exchangeRates[currency] * 100) / 100;
  };

  const formatPrice = (priceInMAD: number): string => {
    const converted = convertPrice(priceInMAD);
    const symbol = currencySymbols[currency];

    if (currency === 'MAD') {
      return `${converted.toFixed(2)} ${symbol}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};