-- CampaignHub Initial Supabase PostgreSQL Schema Migration
-- Migration: 20261021000000_init_schema.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    whatsapp_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    email_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    telegram_chat_id TEXT NULL,
    unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
    consent_source TEXT NOT NULL DEFAULT 'manual_entry',
    consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_phone ON contacts (phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_contacts_telegram ON contacts (telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled', 'failed')),
    channels TEXT[] NOT NULL,
    audience_tags TEXT[] NOT NULL DEFAULT '{}',
    whatsapp_template_id TEXT NULL,
    whatsapp_variable_map JSONB NOT NULL DEFAULT '{}'::jsonb,
    email_subject TEXT NULL,
    email_html TEXT NULL,
    telegram_text TEXT NULL,
    telegram_image_url TEXT NULL,
    scheduled_at TIMESTAMPTZ NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    created_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON campaigns (scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns (created_at DESC);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'email')),
    status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'skipped')),
    provider_message_id TEXT NULL,
    error TEXT NULL,
    cost_inr NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ NULL,
    delivered_at TIMESTAMPTZ NULL,
    read_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_campaign_contact_channel UNIQUE (campaign_id, contact_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages (campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON messages (contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_provider_id ON messages (provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages (status);
CREATE INDEX IF NOT EXISTS idx_messages_channel_status ON messages (channel, status);
CREATE INDEX IF NOT EXISTS idx_messages_queued_at ON messages (queued_at DESC);

-- 4. WhatsApp Templates Table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
    language TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    rejection_reason TEXT NULL,
    meta_template_id TEXT UNIQUE NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_templates_status ON whatsapp_templates (status);

-- 5. Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Inbound Messages Table
CREATE TABLE IF NOT EXISTS inbound_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NULL REFERENCES contacts(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'whatsapp',
    body TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_inbound_contact ON inbound_messages (contact_id);
CREATE INDEX IF NOT EXISTS idx_inbound_received_at ON inbound_messages (received_at DESC);

-- 7. Telegram Posts Table
CREATE TABLE IF NOT EXISTS telegram_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    image_url TEXT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'posted', 'failed')),
    message_id TEXT NULL,
    error TEXT NULL,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_posts_campaign ON telegram_posts (campaign_id);

-- 8. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    encrypted_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. System Alerts Table
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'error', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON system_alerts (resolved_at) WHERE resolved_at IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (internal admins) full access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to contacts') THEN
        CREATE POLICY "Admin access to contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to campaigns') THEN
        CREATE POLICY "Admin access to campaigns" ON campaigns FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to messages') THEN
        CREATE POLICY "Admin access to messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to whatsapp_templates') THEN
        CREATE POLICY "Admin access to whatsapp_templates" ON whatsapp_templates FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to email_templates') THEN
        CREATE POLICY "Admin access to email_templates" ON email_templates FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to inbound_messages') THEN
        CREATE POLICY "Admin access to inbound_messages" ON inbound_messages FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to telegram_posts') THEN
        CREATE POLICY "Admin access to telegram_posts" ON telegram_posts FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to settings') THEN
        CREATE POLICY "Admin access to settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin access to system_alerts') THEN
        CREATE POLICY "Admin access to system_alerts" ON system_alerts FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
