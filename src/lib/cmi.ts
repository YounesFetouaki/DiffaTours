export interface CMIConfig {
  merchantId: string;
  merchantKey: string;
  apiUrl: string;
  callbackUrl: string;
  currency: string;
  language: string;
}

export function getCMIConfig(): CMIConfig {
  const env = process.env.NODE_ENV;
  const isProduction = env === 'production';

  if (!process.env.CMI_MERCHANT_ID || !process.env.CMI_MERCHANT_KEY) {
    throw new Error('CMI credentials not configured. Please add CMI_MERCHANT_ID and CMI_MERCHANT_KEY to your .env file');
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    merchantId: process.env.CMI_MERCHANT_ID,
    merchantKey: process.env.CMI_MERCHANT_KEY,
    apiUrl: isProduction
      ? 'https://payment.cmi.co.ma/fim/est3dfeatureextjs'
      : 'https://testpayment.cmi.co.ma/fim/est3dteststoreutf8',
    callbackUrl: `${baseUrl}/api/payments/callback`,
    currency: process.env.CMI_CURRENCY || 'MAD',
    language: 'fr',
  };
}
