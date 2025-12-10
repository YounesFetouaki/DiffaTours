import axios, { AxiosInstance, AxiosError } from 'axios';

export class WhatsAppClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public retryable: boolean,
    public originalError?: AxiosError,
  ) {
    super(message);
    this.name = 'WhatsAppClientError';
  }
}

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export class WhatsAppClient {
  private client: AxiosInstance;
  private readonly retryConfig: RetryConfig;
  private readonly businessAccountId: string;
  private readonly phoneNumberId: string;

  constructor(
    businessAccountId: string,
    phoneNumberId: string,
    accessToken: string,
    apiVersion: string = 'v19.0',
    retryConfig: Partial<RetryConfig> = {},
  ) {
    this.businessAccountId = businessAccountId;
    this.phoneNumberId = phoneNumberId;
    this.retryConfig = {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      ...retryConfig,
    };

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${apiVersion}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRetryableError(error: AxiosError): boolean {
    const status = error.response?.status;
    return [429, 500, 502, 503, 504].includes(status || 0);
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof AxiosError) {
          const isRetryable = this.isRetryableError(error);
          
          if (!isRetryable || attempt === this.retryConfig.maxRetries) {
            throw new WhatsAppClientError(
              error.response?.data?.error?.message || error.message,
              error.response?.status || 500,
              isRetryable,
              error,
            );
          }

          lastError = error;

          const delayMs = Math.min(
            this.retryConfig.initialDelayMs *
              Math.pow(this.retryConfig.backoffMultiplier, attempt),
            this.retryConfig.maxDelayMs,
          );

          const jitter = Math.random() * 0.1 * delayMs;
          await this.delay(delayMs + jitter);
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Unknown error during retry');
  }

  async sendMessage(to: string, message: string): Promise<{ messageId: string }> {
    return this.executeWithRetry(async () => {
      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
      );
      return { messageId: response.data.messages[0].id };
    });
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'en',
    parameters?: string[],
  ): Promise<{ messageId: string }> {
    return this.executeWithRetry(async () => {
      const payload: any = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      };

      if (parameters && parameters.length > 0) {
        payload.template.components = [
          {
            type: 'body',
            parameters: parameters.map(value => ({ type: 'text', text: value })),
          },
        ];
      }

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload,
      );

      return { messageId: response.data.messages[0].id };
    });
  }

  async sendMediaMessage(
    to: string,
    mediaUrl: string,
    mediaType: 'image' | 'document' | 'video' | 'audio',
    caption?: string,
  ): Promise<{ messageId: string }> {
    return this.executeWithRetry(async () => {
      const payload: any = {
        messaging_product: 'whatsapp',
        to,
        type: mediaType,
        [mediaType]: { link: mediaUrl },
      };

      if (caption && mediaType === 'image') {
        payload.image.caption = caption;
      }

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload,
      );

      return { messageId: response.data.messages[0].id };
    });
  }
}
