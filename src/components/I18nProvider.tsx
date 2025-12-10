'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useClientI18n } from '@/lib/i18n/client';

export function I18nProvider({ children }: { children: ReactNode }) {
  const { isReady } = useClientI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isReady) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent"></div>
    </div>;
  }
  
  return <>{children}</>;
}
