import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export class PhoneNumberValidator {
  static E164_REGEX = /^\+[1-9]\d{1,14}$/;

  static validate(phoneNumber: string, defaultCountry?: string): {
    valid: boolean;
    formatted?: string;
    error?: string;
  } {
    try {
      const trimmed = phoneNumber.trim();

      if (this.E164_REGEX.test(trimmed)) {
        if (isValidPhoneNumber(trimmed)) {
          return { valid: true, formatted: trimmed };
        }
        return {
          valid: false,
          error: 'Invalid phone number format',
        };
      }

      const parsed = parsePhoneNumber(trimmed, defaultCountry as any);

      if (!parsed || !parsed.isValid()) {
        return {
          valid: false,
          error: `Invalid phone number. Expected E.164 format or valid number with country code`,
        };
      }

      return {
        valid: true,
        formatted: parsed.format('E.164'),
      };
    } catch (error) {
      return {
        valid: false,
        error: `Phone validation error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  static formatE164(phoneNumber: string, countryCode?: string): string {
    const parsed = parsePhoneNumber(phoneNumber, countryCode as any);
    if (!parsed) throw new Error('Invalid phone number');
    return parsed.format('E.164');
  }

  static removePrefix(e164: string): string {
    return e164.startsWith('+') ? e164.slice(1) : e164;
  }
}
