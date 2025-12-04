/**
 * Phone number utilities for international support
 */

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  // French format: +33 6 12 34 56 78 or 06 12 34 56 78
  if (cleaned.startsWith('33') && cleaned.length === 11) {
    return `+33 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }

  // Senegal format: +221 77 287 27 33
  if (cleaned.startsWith('221') && cleaned.length === 12) {
    return `+221 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }

  // US format: +1 (234) 567-8901
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Generic international format: +XXX XXX XXX XXX
  if (cleaned.length > 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 9);
    const rest = cleaned.slice(-9);
    return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }

  // Default: space every 2 digits
  return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
}

/**
 * Clean phone number (remove all non-digits)
 * @param phone - Raw phone number
 * @returns Cleaned phone number (digits only)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validate international phone number
 * @param phone - Phone number to validate
 * @returns true if valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return true; // Optional field

  const cleaned = cleanPhoneNumber(phone);

  // Check length: between 8 and 15 digits (international standard)
  if (cleaned.length < 8 || cleaned.length > 15) {
    return false;
  }

  return true;
}

/**
 * Get phone number country code
 * @param phone - Phone number
 * @returns Country code or null
 */
export function getPhoneCountryCode(phone: string): string | null {
  const cleaned = cleanPhoneNumber(phone);

  // Common country codes
  const countryCodes: Record<string, string> = {
    '1': 'US/CA', // United States/Canada
    '33': 'FR',   // France
    '44': 'GB',   // United Kingdom
    '49': 'DE',   // Germany
    '221': 'SN',  // Senegal
    '212': 'MA',  // Morocco
    '213': 'DZ',  // Algeria
    '225': 'CI',  // Côte d'Ivoire
    '237': 'CM',  // Cameroon
    '86': 'CN',   // China
    '81': 'JP',   // Japan
  };

  // Try to match country codes (1-3 digits)
  for (let i = 3; i >= 1; i--) {
    const code = cleaned.slice(0, i);
    if (countryCodes[code]) {
      return countryCodes[code];
    }
  }

  return null;
}

/**
 * Supported phone number formats with examples
 */
export const PHONE_FORMATS = {
  FRENCH: {
    example: '06 12 34 56 78',
    formats: ['+33 6 12 34 56 78', '06 12 34 56 78'],
  },
  INTERNATIONAL: {
    example: '+221 77 287 27 33',
    formats: ['+XXX XX XXX XX XX'],
  },
  US: {
    example: '+1 (234) 567-8901',
    formats: ['+1 (XXX) XXX-XXXX'],
  },
} as const;

/**
 * Get phone number format hint based on input
 */
export function getPhoneFormatHint(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);

  if (!cleaned) {
    return 'Formats acceptés: +33 6 12 34 56 78, +221 77 287 27 33, etc.';
  }

  const countryCode = getPhoneCountryCode(phone);

  if (countryCode === 'FR') {
    return 'Format français détecté';
  }
  if (countryCode === 'SN') {
    return 'Format sénégalais détecté';
  }
  if (countryCode === 'US/CA') {
    return 'Format américain/canadien détecté';
  }

  return `Format international détecté (${cleaned.length} chiffres)`;
}
