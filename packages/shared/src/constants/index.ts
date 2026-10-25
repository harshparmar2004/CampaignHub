export const DEFAULT_PRICING_INR = {
  WHATSAPP_MARKETING: 0.9926,
  WHATSAPP_UTILITY: 0.1323,
  WHATSAPP_AUTHENTICATION: 0.1323
} as const;

export const DEFAULT_RATE_LIMITS = {
  WHATSAPP_PER_SECOND: 20,
  EMAIL_PER_SECOND: 5,
  TELEGRAM_DM_PER_SECOND: 25
} as const;

export const DESIGN_TOKENS = {
  colors: {
    appBackground: '#F4F7F3',
    surface: '#FFFFFF',
    inputBackground: '#F9FBF8',
    border: '#DCE5DD',
    borderStrong: '#C9D6CB',
    text: '#14231C',
    textMuted: '#52645A',
    accent: '#1E6B4F',
    accentHover: '#185A42',
    accentSoft: '#E9F0E8',
    status: {
      success: '#1E6B4F',
      pending: '#8A5A00',
      failed: '#A12A2A',
      skipped: '#52645A'
    }
  },
  radius: {
    card: '14px',
    element: '10px'
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif"
  }
} as const;
