import { z } from 'zod';

export const ContactInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').trim(),
  phone: z.string().min(8, 'Phone number is too short').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  tags: z.array(z.string().trim()).default([]),
  tier: z.enum(['vip', 'regular', 'lead', 'inactive']).optional(),
  parties_attended: z.number().int().min(0).optional(),
  total_spend_inr: z.number().min(0).optional(),
  last_attended_at: z.string().optional().nullable(),
  engagement_score: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional().nullable(),
  whatsapp_opt_in: z.boolean().default(true),
  email_opt_in: z.boolean().default(true),
  telegram_chat_id: z.string().optional().nullable(),
  unsubscribed: z.boolean().default(false),
  consent_source: z.string().default('manual_entry'),
  consent_at: z.string().optional()
});

export const CsvImportRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  tags: z.string().optional(),
  tier: z.string().optional(),
  parties_attended: z.union([z.number(), z.string()]).optional(),
  total_spend_inr: z.union([z.number(), z.string()]).optional(),
  attended: z.union([z.boolean(), z.string()]).optional(),
  notes: z.string().optional(),
  telegram_chat_id: z.string().optional()
});

export const CsvImportPayloadSchema = z.object({
  confirm_consent: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm that contacts have provided explicit consent' })
  }),
  consent_source: z.string().min(1, 'Consent source is required').default('csv_import'),
  import_mode: z.enum(['merge', 'replace', 'skip']).default('merge'),
  is_event_attendance: z.boolean().default(false),
  direct_vip: z.boolean().default(false),
  event_tag: z.string().optional(),
  default_spend_inr: z.number().optional(),
  rows: z.array(CsvImportRowSchema).min(1, 'At least one contact row is required')
});

export const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').trim(),
  channels: z.array(z.enum(['whatsapp', 'telegram', 'email', 'instagram'])).min(1, 'Select at least one channel'),
  audience_tags: z.array(z.string().trim()).default([]),
  audience_tier: z.enum(['all', 'vip', 'regular', 'lead']).optional().default('all'),
  scheduled_at: z.string().datetime().optional().nullable(),
  // WhatsApp Fields
  whatsapp_template_id: z.string().optional().nullable(),
  whatsapp_variable_map: z.record(z.string()).default({}),
  whatsapp_image_url: z.string().optional().nullable().or(z.literal('')),
  whatsapp_message_text: z.string().optional().nullable(),
  whatsapp_link_url: z.string().optional().nullable().or(z.literal('')),
  whatsapp_link_title: z.string().optional().nullable().or(z.literal('')),
  // Email Fields
  email_subject: z.string().optional().nullable(),
  email_html: z.string().optional().nullable(),
  email_link_url: z.string().optional().nullable().or(z.literal('')),
  // Telegram Fields
  telegram_text: z.string().optional().nullable(),
  telegram_image_url: z.string().optional().nullable().or(z.literal('')),
  telegram_link_url: z.string().optional().nullable().or(z.literal('')),
  // Instagram Broadcast Fields
  instagram_image_url: z.string().optional().nullable().or(z.literal('')),
  instagram_caption: z.string().optional().nullable(),
  instagram_link_url: z.string().optional().nullable().or(z.literal('')),
  instagram_link_title: z.string().optional().nullable().or(z.literal('')),
  instagram_additional_links: z.array(z.object({
    url: z.string(),
    title: z.string(),
  })).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.channels.includes('whatsapp')) {
    if (!data.whatsapp_template_id && (!data.whatsapp_message_text || !data.whatsapp_message_text.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide either a WhatsApp template or message text',
        path: ['whatsapp_template_id']
      });
    }
  }
  if (data.channels.includes('email')) {
    if (!data.email_subject || !data.email_subject.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email subject is required when Email channel is enabled',
        path: ['email_subject']
      });
    }
    if (!data.email_html || !data.email_html.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email content is required when Email channel is enabled',
        path: ['email_html']
      });
    }
  }
  if (data.channels.includes('telegram') && (!data.telegram_text || !data.telegram_text.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Telegram post text is required when Telegram channel is enabled',
      path: ['telegram_text']
    });
  }
  if (data.channels.includes('instagram') && (!data.instagram_caption || !data.instagram_caption.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Instagram broadcast text is required when Instagram channel is enabled',
      path: ['instagram_caption']
    });
  }
});

export const UpdateSettingsSchema = z.object({
  meta_access_token: z.string().trim().optional().nullable(),
  meta_phone_number_id: z.string().trim().optional().nullable(),
  meta_waba_id: z.string().trim().optional().nullable(),
  meta_app_secret: z.string().trim().optional().nullable(),
  meta_webhook_verify_token: z.string().trim().optional().nullable(),
  resend_api_key: z.string().trim().optional().nullable(),
  resend_from_name: z.string().trim().optional().nullable(),
  resend_from_email: z.string().trim().email().optional().or(z.literal('')).or(z.literal(null)).nullable(),
  telegram_bot_token: z.string().trim().optional().nullable(),
  telegram_channel_id: z.string().trim().optional().nullable(),
  instagram_account_id: z.string().trim().optional().nullable(),
  instagram_access_token: z.string().trim().optional().nullable(),
  instagram_broadcast_channel_id: z.string().trim().optional().nullable(),
  gemini_api_key: z.string().trim().optional().nullable(),
  gemini_model: z.string().trim().optional().nullable(),
  gemini_temperature: z.number().min(0).max(2).optional().nullable(),
  groq_api_key: z.string().trim().optional().nullable(),
  groq_model: z.string().trim().optional().nullable(),
  ollama_base_url: z.string().trim().optional().nullable(),
  ollama_model: z.string().trim().optional().nullable(),
  ai_primary_provider: z.enum(['gemini', 'groq', 'ollama']).optional().nullable(),
  rate_limit_whatsapp: z.number().int().min(1).max(100).default(20),
  rate_limit_email: z.number().int().min(1).max(50).default(5),
  rate_limit_telegram: z.number().int().min(1).max(100).default(30),
  price_whatsapp_marketing_inr: z.number().positive().default(0.9926),
  price_whatsapp_utility_inr: z.number().positive().default(0.1323),
  price_whatsapp_auth_inr: z.number().positive().default(0.1323),
  monthly_budget_cap_inr: z.number().positive().default(10000),
});

export const WhatsAppTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Template name is required').regex(/^[a-z0-9_]+$/, 'Template name must be lowercase alphanumeric and underscores only'),
  category: z.enum(['MARKETING', 'UTILITY']),
  language: z.string().min(2).default('en_US'),
  body: z.string().min(1, 'Body text is required'),
  header: z.string().optional(),
  footer: z.string().optional(),
  buttons: z.array(z.object({
    type: z.enum(['QUICK_REPLY', 'URL']),
    text: z.string().min(1),
    url: z.string().url().optional()
  })).optional()
});

export const TelegramComposePostSchema = z.object({
  text: z.string().min(1, 'Post text is required'),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  post_now: z.boolean().default(true),
  scheduled_at: z.string().datetime().optional().nullable()
});

export const EmailTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Template name is required').trim(),
  subject: z.string().min(1, 'Subject is required').trim(),
  html: z.string().min(1, 'HTML body is required')
});

export const TestSendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'HTML body is required')
});
