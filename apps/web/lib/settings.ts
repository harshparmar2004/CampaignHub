import { createAdminClient } from './supabase/admin';
import {
  decryptSecret,
  encryptSecret,
  maskSecret,
  DEFAULT_PRICING_INR,
  DEFAULT_RATE_LIMITS,
  type SettingsMap,
  type MaskedSettings,
} from '@campaignhub/shared';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

export async function getDecryptedSettings(): Promise<SettingsMap> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('settings').select('key, encrypted_value');

  if (error || !data) {
    console.error('Failed to load settings from DB:', error);
    return {};
  }

  const result: Record<string, any> = {};

  for (const row of data) {
    try {
      const decrypted = decryptSecret(row.encrypted_value, ENCRYPTION_KEY);
      // If it's a numeric field, parse as float or int
      if (
        row.key.startsWith('rate_limit_') ||
        row.key.startsWith('price_') ||
        row.key.endsWith('_inr') ||
        row.key === 'gemini_temperature'
      ) {
        result[row.key] = parseFloat(decrypted);
      } else {
        result[row.key] = decrypted;
      }
    } catch (err) {
      console.error(`Failed to decrypt setting key "${row.key}":`, err);
    }
  }

  return result as SettingsMap;
}

export async function getMaskedSettings(): Promise<MaskedSettings> {
  const settings = await getDecryptedSettings();

  return {
    meta_phone_number_id: settings.meta_phone_number_id || '',
    meta_waba_id: settings.meta_waba_id || '',
    meta_webhook_verify_token: settings.meta_webhook_verify_token || '',
    resend_from_name: settings.resend_from_name || '',
    resend_from_email: settings.resend_from_email || '',
    telegram_channel_id: settings.telegram_channel_id || '',
    instagram_account_id: settings.instagram_account_id || '',
    instagram_broadcast_channel_id: settings.instagram_broadcast_channel_id || '',
    gemini_model: settings.gemini_model || 'gemini-2.0-flash',
    gemini_temperature: settings.gemini_temperature ?? 0.7,
    groq_model: settings.groq_model || 'llama-3.3-70b-versatile',
    ollama_base_url: settings.ollama_base_url || 'http://localhost:11434',
    ollama_model: settings.ollama_model || 'llama3.2',
    ai_primary_provider: settings.ai_primary_provider || 'gemini',
    rate_limit_whatsapp: settings.rate_limit_whatsapp || DEFAULT_RATE_LIMITS.WHATSAPP_PER_SECOND,
    rate_limit_email: settings.rate_limit_email || DEFAULT_RATE_LIMITS.EMAIL_PER_SECOND,
    rate_limit_telegram: settings.rate_limit_telegram || 30,
    price_whatsapp_marketing_inr:
      settings.price_whatsapp_marketing_inr || DEFAULT_PRICING_INR.WHATSAPP_MARKETING,
    price_whatsapp_utility_inr:
      settings.price_whatsapp_utility_inr || DEFAULT_PRICING_INR.WHATSAPP_UTILITY,
    price_whatsapp_auth_inr:
      settings.price_whatsapp_auth_inr || DEFAULT_PRICING_INR.WHATSAPP_AUTHENTICATION,
    monthly_budget_cap_inr: settings.monthly_budget_cap_inr || 10000,
    // Masks and previews
    has_meta_access_token: Boolean(settings.meta_access_token),
    has_meta_app_secret: Boolean(settings.meta_app_secret),
    has_resend_api_key: Boolean(settings.resend_api_key),
    has_telegram_bot_token: Boolean(settings.telegram_bot_token),
    has_instagram_access_token: Boolean(settings.instagram_access_token),
    has_gemini_api_key: Boolean(settings.gemini_api_key),
    has_groq_api_key: Boolean(settings.groq_api_key),
    has_ollama: Boolean(settings.ollama_base_url),
    meta_access_token_preview: maskSecret(settings.meta_access_token),
    resend_api_key_preview: maskSecret(settings.resend_api_key),
    telegram_bot_token_preview: maskSecret(settings.telegram_bot_token),
    instagram_access_token_preview: maskSecret(settings.instagram_access_token),
    gemini_api_key_preview: maskSecret(settings.gemini_api_key),
    groq_api_key_preview: maskSecret(settings.groq_api_key),
  };
}

export async function saveEncryptedSetting(key: string, plainValue: string): Promise<void> {
  if (plainValue === undefined || plainValue === null) return;
  const encrypted = encryptSecret(String(plainValue), ENCRYPTION_KEY);
  const supabase = createAdminClient();

  const { error } = await supabase.from('settings').upsert({
    key,
    encrypted_value: encrypted,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to save encrypted setting for ${key}: ${error.message}`);
  }
}

export async function bulkSaveSettings(updates: Record<string, any>): Promise<void> {
  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      await saveEncryptedSetting(key, String(val));
    }
  }
}
