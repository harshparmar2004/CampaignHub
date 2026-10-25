import { DEFAULT_PRICING_INR } from '../constants/index.js';

/**
 * Extracts numbered placeholders from WhatsApp template text (e.g. {{1}}, {{2}}).
 */
export function extractWhatsAppVariables(bodyText: string): string[] {
  if (!bodyText) return [];
  const regex = /\{\{(\d+)\}\}/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(bodyText)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

/**
 * Maps WhatsApp template variables {{1}}, {{2}} to contact attributes or static strings.
 */
export function interpolateWhatsApp(
  bodyText: string,
  variableMap: Record<string, string>,
  contact: Record<string, any>
): string {
  if (!bodyText) return '';
  return bodyText.replace(/\{\{(\d+)\}\}/g, (_, varIndex) => {
    const mappedField = variableMap[varIndex];
    if (!mappedField) return `{{${varIndex}}}`;

    // If mapped to fixed text e.g. "fixed:SummerSale"
    if (mappedField.startsWith('fixed:')) {
      return mappedField.substring(6);
    }

    // Contact field lookup (e.g. name, phone, email)
    const val = contact[mappedField];
    if (val !== undefined && val !== null) {
      return String(val);
    }
    return `{{${varIndex}}}`;
  });
}

/**
 * Interpolates variables like {{name}} or {{email}} in email subject and HTML body.
 */
export function interpolateEmail(
  templateContent: string,
  contact: Record<string, any> = {},
  extraVars: Record<string, string> = {}
): string {
  if (!templateContent) return '';
  const merged = { ...contact, ...extraVars };
  return templateContent.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    if (key === 'name') {
      return merged.name || 'Friend';
    }
    if (key === 'first_name') {
      if (merged.name && typeof merged.name === 'string') {
        return merged.name.trim().split(' ')[0] || 'Friend';
      }
      return 'Friend';
    }
    if (key === 'link' || key === 'event_link') {
      return merged.link || merged.event_link || merged.email_link_url || '';
    }
    const val = merged[key];
    if (val !== undefined && val !== null) {
      return String(val);
    }
    return match;
  });
}

/**
 * Calculates estimated campaign spend in INR for WhatsApp.
 */
export function calculateWhatsAppCost(
  recipientCount: number,
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' = 'MARKETING',
  customRates?: {
    marketing?: number;
    utility?: number;
    auth?: number;
  }
): number {
  if (recipientCount <= 0) return 0;
  let rate: number;
  if (category === 'MARKETING') {
    rate = customRates?.marketing ?? DEFAULT_PRICING_INR.WHATSAPP_MARKETING;
  } else if (category === 'UTILITY') {
    rate = customRates?.utility ?? DEFAULT_PRICING_INR.WHATSAPP_UTILITY;
  } else {
    rate = customRates?.auth ?? DEFAULT_PRICING_INR.WHATSAPP_AUTHENTICATION;
  }
  return Number((recipientCount * rate).toFixed(4));
}
