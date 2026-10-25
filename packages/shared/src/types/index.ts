export type ChannelType = 'whatsapp' | 'telegram' | 'email' | 'instagram';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type MessageStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'skipped';

export type WhatsAppCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

export type WhatsAppTemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED';

export type ContactTier = 'vip' | 'regular' | 'lead' | 'inactive';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  tier?: ContactTier;
  parties_attended?: number;
  total_spend_inr?: number;
  last_attended_at?: string | null;
  engagement_score?: number;
  notes?: string | null;
  whatsapp_opt_in: boolean;
  email_opt_in: boolean;
  telegram_chat_id: string | null;
  unsubscribed: boolean;
  consent_source: string;
  consent_at: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channels: ChannelType[];
  audience_tags: string[];
  whatsapp_template_id: string | null;
  whatsapp_variable_map: Record<string, string>;
  whatsapp_image_url?: string | null;
  whatsapp_message_text?: string | null;
  whatsapp_link_url?: string | null;
  whatsapp_link_title?: string | null;
  email_subject: string | null;
  email_html: string | null;
  email_link_url?: string | null;
  telegram_text: string | null;
  telegram_image_url: string | null;
  telegram_link_url?: string | null;
  instagram_image_url?: string | null;
  instagram_caption?: string | null;
  instagram_link_url?: string | null;
  instagram_link_title?: string | null;
  instagram_additional_links?: Array<{ url: string; title: string }>;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MessageLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  channel: ChannelType;
  status: MessageStatus;
  provider_message_id: string | null;
  error: string | null;
  cost_inr: number;
  queued_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  // Joined fields for display
  contact?: Contact;
  campaign?: Campaign;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: WhatsAppCategory;
  language: string;
  body: string;
  status: WhatsAppTemplateStatus;
  rejection_reason: string | null;
  meta_template_id: string;
  synced_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  created_at: string;
}

export interface InboundMessage {
  id: string;
  contact_id: string | null;
  channel: string;
  body: string;
  received_at: string;
  raw: Record<string, unknown>;
  contact?: Contact;
}

export interface TelegramPost {
  id: string;
  campaign_id: string;
  text: string;
  image_url: string | null;
  status: 'queued' | 'posted' | 'failed';
  message_id: string | null;
  error: string | null;
  posted_at: string;
  campaign?: Campaign;
}

export interface SystemAlert {
  id: string;
  campaign_id: string | null;
  type: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
  created_at: string;
  resolved_at: string | null;
}

export interface SettingsMap {
  // Meta WhatsApp
  meta_access_token?: string;
  meta_phone_number_id?: string;
  meta_waba_id?: string;
  meta_app_secret?: string;
  meta_webhook_verify_token?: string;
  // Resend Email
  resend_api_key?: string;
  resend_from_name?: string;
  resend_from_email?: string;
  // Telegram
  telegram_bot_token?: string;
  telegram_channel_id?: string;
  // Instagram Meta Graph
  instagram_account_id?: string;
  instagram_access_token?: string;
  instagram_broadcast_channel_id?: string;
  // Google Gemini AI
  gemini_api_key?: string;
  gemini_model?: string;
  gemini_temperature?: number;
  // Groq Cloud AI (Free Fast LPU)
  groq_api_key?: string;
  groq_model?: string;
  // Ollama Local Engine (100% Free Offline)
  ollama_base_url?: string;
  ollama_model?: string;
  // AI Orchestration
  ai_primary_provider?: 'gemini' | 'groq' | 'ollama';
  // Throughput limits
  rate_limit_whatsapp?: number;
  rate_limit_email?: number;
  rate_limit_telegram?: number;
  // Pricing constants (INR)
  price_whatsapp_marketing_inr?: number;
  price_whatsapp_utility_inr?: number;
  price_whatsapp_auth_inr?: number;
  // Safety cap
  monthly_budget_cap_inr?: number;
}

export interface MaskedSettings {
  meta_phone_number_id?: string;
  meta_waba_id?: string;
  meta_webhook_verify_token?: string;
  resend_from_name?: string;
  resend_from_email?: string;
  telegram_channel_id?: string;
  instagram_account_id?: string;
  instagram_broadcast_channel_id?: string;
  gemini_model?: string;
  gemini_temperature?: number;
  groq_model?: string;
  ollama_base_url?: string;
  ollama_model?: string;
  ai_primary_provider?: 'gemini' | 'groq' | 'ollama';
  rate_limit_whatsapp: number;
  rate_limit_email: number;
  rate_limit_telegram?: number;
  price_whatsapp_marketing_inr: number;
  price_whatsapp_utility_inr: number;
  price_whatsapp_auth_inr: number;
  monthly_budget_cap_inr?: number;
  // Masked flags / previews
  has_meta_access_token: boolean;
  has_meta_app_secret: boolean;
  has_resend_api_key: boolean;
  has_telegram_bot_token: boolean;
  has_instagram_access_token: boolean;
  has_gemini_api_key: boolean;
  has_groq_api_key: boolean;
  has_ollama: boolean;
  meta_access_token_preview?: string;
  resend_api_key_preview?: string;
  telegram_bot_token_preview?: string;
  instagram_access_token_preview?: string;
  gemini_api_key_preview?: string;
  groq_api_key_preview?: string;
}
