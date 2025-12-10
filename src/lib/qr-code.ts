import QRCode from 'qrcode';

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer for email attachments
 */
export async function generateQRCodeBuffer(text: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return buffer;
  } catch (error) {
    console.error('QR Code buffer generation error:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

/**
 * Generate unique badge code
 */
export function generateBadgeCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DIFFA-${timestamp}-${random}`;
}
