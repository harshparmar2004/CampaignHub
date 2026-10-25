-- CampaignHub Seed Data
-- supabase/seed.sql

-- 1. Insert default email template
INSERT INTO email_templates (name, subject, html)
VALUES (
    'Welcome Onboarding',
    'Welcome to our platform, {{name}}!',
    '<div style="font-family: sans-serif; color: #14231C; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #DCE5DD; border-radius: 14px;">
      <h2 style="color: #1E6B4F; margin-top: 0;">Welcome, {{name}}!</h2>
      <p>Thank you for connecting with us. We are thrilled to have you on board.</p>
      <p>If you have any questions, simply reply directly to this email or reach out to our team.</p>
      <hr style="border: none; border-top: 1px solid #DCE5DD; margin: 24px 0;" />
      <p style="font-size: 12px; color: #52645A;">You received this email because you opted in to notifications. <a href="{{unsubscribe_url}}" style="color: #1E6B4F;">Unsubscribe here</a>.</p>
    </div>'
) ON CONFLICT DO NOTHING;

-- 2. Insert initial system notification
INSERT INTO system_alerts (type, message, severity)
VALUES (
    'FIRST_RUN',
    'Welcome to CampaignHub! Please visit the Settings tab to configure your WhatsApp, Telegram, and Resend credentials.',
    'warning'
) ON CONFLICT DO NOTHING;

-- 3. SQL instructions to seed an admin user in Supabase Auth (run in Supabase SQL editor):
-- Note: Replace 'admin@company.com' and 'SecurePassword123!' with your desired admin credentials.
/*
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@company.com',
    crypt('SecurePassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
*/
