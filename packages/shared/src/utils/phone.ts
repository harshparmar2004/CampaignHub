/**
 * Normalizes phone numbers to standard E.164 format with a configurable default country code (+91 for India).
 */
export function normalizePhone(
  rawPhone: string | number | null | undefined,
  defaultCountryCode: string = '+91'
): {
  isValid: boolean;
  e164: string;
  error?: string;
} {
  if (rawPhone === null || rawPhone === undefined) {
    return { isValid: false, e164: '', error: 'Phone number is empty' };
  }

  const str = String(rawPhone).trim();
  if (!str) {
    return { isValid: false, e164: '', error: 'Phone number is empty' };
  }

  // Strip all non-digit characters except leading plus
  let cleaned = str.replace(/[\s\-\(\)\.\,\/]/g, '');

  // Handle leading international 00 prefix (e.g. 00919876543210 -> +919876543210)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // Handle domestic trunk prefix '0' (e.g. 09876543210 -> 9876543210)
  if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/^0+/, '');
  }

  // If already starts with '+', keep as is
  if (cleaned.startsWith('+')) {
    // Check E.164 regex
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (e164Regex.test(cleaned)) {
      return { isValid: true, e164: cleaned };
    }
    return { isValid: false, e164: '', error: `Invalid international phone format: ${str}` };
  }

  // If no '+', check if it already has the 91 country code without '+' (12 digits starting with 91)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = '+' + cleaned;
  } else if (/^\d{10}$/.test(cleaned)) {
    // 10 digits: attach default country code (+91)
    const code = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    cleaned = `${code}${cleaned}`;
  } else {
    // Other digit lengths: try prepending default country code
    const code = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    cleaned = `${code}${cleaned}`;
  }

  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (e164Regex.test(cleaned)) {
    return { isValid: true, e164: cleaned };
  }

  return { isValid: false, e164: '', error: `Invalid phone format: ${str}` };
}
