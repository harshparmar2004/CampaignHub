# CampaignHub — Enterprise Multi-Channel Campaign Automation

**CampaignHub** is a production-grade, internal multi-channel campaign automation web application and 24/7 background worker service designed to replace brittle n8n workflows.

From a single dashboard, create one unified broadcast and deliver it reliably across **Meta WhatsApp Cloud API**, **Telegram Bot API**, and **Resend Transactional Email**, backed by strict phone normalization to E.164 (+91 default for India), cryptographic credential encryption (AES-256-GCM), and an idempotent BullMQ queue.

---

## Architecture Overview

CampaignHub is structured as a TypeScript monorepo using npm workspaces:

- `apps/web`: Next.js 14 App Router application styled with a strict fresh light theme (`#F4F7F3` background, `#1E6B4F` deep forest green accent, `DM Sans` font, flat surfaces with no shadows or pill badges). Deployable to **Vercel**.
- `apps/worker`: 24/7 Node.js background delivery engine powered by **BullMQ** and **Upstash Redis**, featuring a 30-second campaign scheduler, rate limiters, transient error retries, and an HTTP `/health` endpoint. Deployable to **Railway** or **Render** via the included multi-stage Dockerfile.
- `packages/shared`: Shared types, Zod schemas, AES-256-GCM encryption utilities, E.164 phone normalizer, and India WhatsApp pricing constants.
- `supabase/`: Postgres SQL migrations with Row-Level Security (RLS) policies, indexes, and seed SQL.

---

## Step-by-Step Setup & Deployment Manual

### 1. Supabase Project Setup & Database Migrations

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL**, **Anon Key**, and **Service Role Key** under **Project Settings -> API**.
3. In the Supabase Dashboard, open the **SQL Editor**.
4. Copy and execute the contents of [`supabase/migrations/20261021000000_init_schema.sql`](file:///supabase/migrations/20261021000000_init_schema.sql). This creates all 9 tables, unique constraints, and admin-only RLS policies.
5. In the SQL Editor, execute [`supabase/seed.sql`](file:///supabase/seed.sql) to populate initial templates, and uncomment the admin user creation script to create your first login.

---

### 2. Meta WhatsApp Cloud API Setup (Direct, No Third-Party BSP)

1. **Create Meta App**:
   - Go to [developers.facebook.com](https://developers.facebook.com) -> **My Apps** -> **Create App**.
   - Select **Other** -> **Business**.
   - Add the **WhatsApp** product to your app.
2. **Permanent System User Token**:
   - Go to **Meta Business Manager** -> **Business Settings** -> **System Users**.
   - Click **Add System User** (Role: Admin).
   - Under **Generate New Token**, select your app, set token expiration to **Never**, and grant permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Copy this permanent token.
3. **Locate Phone Number ID and WABA ID**:
   - In Meta App Dashboard -> **WhatsApp** -> **API Setup**:
   - Copy the **Phone number ID** (e.g. `102938475610293`).
   - Copy the **WhatsApp Business Account ID (WABA ID)** (e.g. `192837465019283`).
4. **Configure Webhook**:
   - In Meta App Dashboard -> **WhatsApp** -> **Configuration**:
   - Click **Edit Webhook URL**.
   - Enter your callback URL: `https://<your-domain>/api/webhooks/whatsapp`.
   - Enter your Verify Token: e.g. `campaignhub_wa_verify`.
   - Click **Verify and Save**.
   - Under **Webhook fields**, click **Manage** and subscribe to:
     - `messages` (inbound replies and delivery status updates).

---

### 3. Telegram Bot Setup

1. **Create Bot**:
   - Open Telegram and search for `@BotFather`.
   - Send `/newbot`, name your bot (e.g. `Acme Campaigns Bot`), and choose a username ending in `bot`.
   - BotFather will provide your **HTTP API Bot Token** (e.g. `123456789:ABCdefGHI...`).
2. **Channel Configuration**:
   - Create your Telegram Channel (e.g. `@acme_announcements`).
   - Go to Channel Settings -> **Administrators** -> **Add Admin** -> Add your bot username and grant permission to **Post Messages**.
   - Your Channel ID is either the public username (e.g. `@acme_announcements`) or the negative integer ID (e.g. `-1001234567890`).

---

### 4. Resend Transactional Email Setup

1. Sign up at [resend.com](https://resend.com).
2. Go to **API Keys** -> **Create API Key** with Full Access.
3. Go to **Domains** -> **Add Domain** (e.g. `mail.yourcompany.com`).
4. Add the generated DNS records to your domain registrar:
   - **SPF** (TXT record)
   - **DKIM** (CNAME / TXT records)
   - **DMARC** (TXT record: `v=DMARC1; p=none;`)
5. Once verified by Resend, configure your sender email in CampaignHub (e.g. `updates@mail.yourcompany.com`).
6. In Resend -> **Webhooks**, create a webhook pointing to `https://<your-domain>/api/webhooks/resend` subscribing to `email.delivered`, `email.opened`, `email.clicked`, and `email.bounced`.

---

### 5. Local Development & Verification

1. **Clone & Install**:
   ```bash
   cd campaignhub
   npm install
   ```
2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`, and generate a 64-character hex `ENCRYPTION_KEY`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Run Unit Tests**:
   ```bash
   npm test --workspace=packages/shared
   ```
4. **Start Web Application**:
   ```bash
   npm run dev:web
   ```
   Open `http://localhost:3000` in your browser.
5. **Start Background Worker**:
   ```bash
   npm run build --workspace=apps/worker
   npm run start:worker
   ```

---

### 6. Production Deployment

#### A. Deploy Web App on Vercel
1. Import repository into Vercel.
2. Set Root Directory to `apps/web`.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENCRYPTION_KEY`
   - `APP_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

#### B. Deploy 24/7 Worker on Railway or Render
1. Create a new service in **Railway** or **Render** from your repository.
2. Select Dockerfile deployment using [`apps/worker/Dockerfile`](file:///apps/worker/Dockerfile).
3. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REDIS_URL` (Upstash Redis URL)
   - `ENCRYPTION_KEY`
   - `APP_SECRET`
   - `PORT=8080`
4. Set healthcheck endpoint to `/health`.
5. Deploy service with 24/7 uptime.
