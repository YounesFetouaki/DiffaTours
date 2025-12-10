import crypto from 'crypto';
import { CMIConfig } from './cmi';

export interface CMIPaymentRequest {
  orderId: string;
  amount: number;
  email: string;
  customerName: string;
  language?: string;
}

export interface CMIPaymentResponse {
  redirectUrl: string;
  orderId: string;
}

export class CMIPaymentService {
  private config: CMIConfig;

  constructor(config: CMIConfig) {
    this.config = config;
  }

  /**
   * Generate HMAC signature for payment request
   * CMI uses: Hash = Base64(SHA512(merchantKey + orderId + amount + currency + merchantId))
   */
  private generateSignature(
    orderId: string,
    amount: string,
    currency: string
  ): string {
    const signData = `${this.config.merchantKey}${orderId}${amount}${currency}${this.config.merchantId}`;
    return crypto.createHash('sha512').update(signData).digest('base64');
  }

  /**
   * Initiate payment - returns redirect URL to payment form
   */
  async initiatePayment(request: CMIPaymentRequest): Promise<CMIPaymentResponse> {
    const { orderId, amount, email, customerName, language = 'fr' } = request;

    const currency = this.config.currency;
    const amountFormatted = amount.toFixed(2);
    const hash = this.generateSignature(orderId, amountFormatted, currency);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Build payment form parameters
    const params = new URLSearchParams({
      clientid: this.config.merchantId,
      amount: amountFormatted,
      currency: currency,
      oid: orderId,
      okUrl: `${baseUrl}/api/payments/success`,
      failUrl: `${baseUrl}/api/payments/fail`,
      callbackUrl: this.config.callbackUrl,
      trantype: 'PreAuth',
      encoding: 'UTF-8',
      storetype: '3d_pay_hosting',
      hashAlgorithm: 'ver3',
      hash: hash,
      lang: language,
      email: email,
      BillToName: customerName,
      rnd: Date.now().toString(),
    });

    const redirectUrl = `${this.config.apiUrl}?${params.toString()}`;

    return {
      redirectUrl,
      orderId,
    };
  }

  /**
   * Verify callback signature from CMI
   */
  verifyCallbackSignature(
    orderId: string,
    amount: string,
    currency: string,
    response: string,
    receivedHash: string
  ): boolean {
    const signData = `${this.config.merchantKey}${orderId}${amount}${currency}${response}`;
    const computedHash = crypto.createHash('sha512').update(signData).digest('base64');
    return computedHash === receivedHash;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
