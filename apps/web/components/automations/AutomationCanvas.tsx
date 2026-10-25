'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Sliders,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  RotateCcw,
  Check,
  ExternalLink,
  ChevronRight,
  Send,
  Users,
  Move,
  LayoutGrid,
} from 'lucide-react';
import {
  WhatsAppLogo,
  GmailLogo,
  TelegramLogo,
  InstagramLogo,
  GroqLogo,
  GeminiLogo,
} from '@/components/ui/BrandIcons';
import type { PipelineNodeData } from './NodeDetailsDrawer';

interface AutomationCanvasProps {
  onSelectNode: (node: PipelineNodeData) => void;
  selectedNodeId?: string | null;
  isRunningTest?: boolean;
  activeTestStep?: number;
}

export const PIPELINE_NODES: PipelineNodeData[] = [
  {
    id: 'node-db-sheets',
    title: 'PostgreSQL Database & Google Sheets',
    subtitle: 'Automated data ingestion from Supabase PostgreSQL customer tables and linked Google Sheets CSV audience lists.',
    category: 'Data Trigger Source',
    badge: 'Real-Time Sync',
    colorScheme: 'emerald',
    iconType: 'database',
    status: 'active',
    executingText: 'PostgreSQL Query & Google Sheets Real-Time Ingest',
    hasDataText: '1,248 Validated Customer Records (Supabase DB + Sheets Sync)',
    metrics: [
      { label: 'Audience Records', value: '1,248 Contacts' },
      { label: 'Sync Cadence', value: 'Real-Time Webhook' },
      { label: 'Ingest Speed', value: '14 ms' },
      { label: 'Source Integrity', value: '100% Validated' },
    ],
    config: [
      { label: 'PostgreSQL Connection', value: 'postgres://***@supabase.co:5432' },
      { label: 'Google Sheets ID', value: '1BxiMVs0XRA5nFMdKvBdBZj... (Live)' },
      { label: 'Trigger Event', value: 'New VIP Tag Added / Scheduled Blast' },
      { label: 'Deduplication', value: 'Strict phone_e164 dedupe' },
    ],
    sqlQuery: `SELECT 
  c.id, c.first_name, c.last_name, c.phone, c.email, 
  c.lifetime_spend_inr, c.tags, c.status
FROM public.customers c
JOIN public.campaign_audiences ca ON ca.customer_id = c.id
WHERE ca.campaign_id = 'camp_matrix_vip_2026'
  AND c.status = 'ACTIVE'
ORDER BY c.lifetime_spend_inr DESC
LIMIT 1248;`,
    tableData: [
      { id: 1042, first_name: 'Aarav', last_name: 'Sharma', phone: '+91 98765 43210', email: 'aarav.sharma@vipclub.in', lifetime_spend_inr: 75000, tags: ['VIP', 'Weekend_Regular'], status: 'Active' },
      { id: 1043, first_name: 'Priya', last_name: 'Patel', phone: '+91 98234 11223', email: 'priya.patel@mumbaitech.co', lifetime_spend_inr: 92000, tags: ['VIP', 'Bottle_Service'], status: 'Active' },
      { id: 1044, first_name: 'Rohan', last_name: 'Mehta', phone: '+91 97112 33445', email: 'rohan.mehta@investcorp.com', lifetime_spend_inr: 64000, tags: ['VIP', 'High_Spender'], status: 'Active' },
      { id: 1045, first_name: 'Ananya', last_name: 'Desai', phone: '+91 98990 55667', email: 'ananya.desai@designstudio.in', lifetime_spend_inr: 58000, tags: ['VIP', 'Lounge_Guest'], status: 'Active' },
      { id: 1046, first_name: 'Vikram', last_name: 'Malhotra', phone: '+91 98450 77889', email: 'vikram.m@luxuryretail.com', lifetime_spend_inr: 115000, tags: ['VIP', 'Table_Patron'], status: 'Active' },
      { id: 1047, first_name: 'Sneha', last_name: 'Reddy', phone: '+91 99801 22334', email: 'sneha.reddy@hyderabadrealty.in', lifetime_spend_inr: 48000, tags: ['Regular', 'RSVP_Lead'], status: 'Active' },
      { id: 1048, first_name: 'Karan', last_name: 'Oberoi', phone: '+91 98110 99887', email: 'karan.oberoi@delhicapital.com', lifetime_spend_inr: 88000, tags: ['VIP', 'Weekend_Regular'], status: 'Active' },
      { id: 1049, first_name: 'Tara', last_name: 'Kapoor', phone: '+91 97665 44332', email: 'tara.kapoor@mediahouse.in', lifetime_spend_inr: 32000, tags: ['General', 'First_Time'], status: 'Active' },
    ],
    inputSample: {
      source: 'Google Sheets & Supabase DB',
      batch_id: 'batch_20261025_vip_gala',
      raw_rows_found: 1248,
      sample_row: {
        id: 1042,
        first_name: 'Aarav',
        last_name: 'Sharma',
        phone: '+919876543210',
        email: 'aarav.sharma@vipclub.in',
        lifetime_spend_inr: 75000,
        tags: 'VIP,Weekend_Regular,Table_Patron',
      },
    },
    outputSample: {
      type: 'raw',
      content: {
        status: 'ingested',
        record_id: 'rec_1042',
        normalized_e164: '+919876543210',
        tier: 'VIP',
        tags: ['VIP', 'Weekend_Regular', 'Table_Patron'],
        ready_for_routing: true,
      },
    },
    logs: [
      { time: '17:00:02', message: 'Webhook event received from Google Sheets connector.', type: 'info' },
      { time: '17:00:03', message: 'Ingested 1,248 contact records into processing buffer.', type: 'success' },
      { time: '17:00:03', message: 'E.164 phone formatting and email verification passed.', type: 'success' },
    ],
  },
  {
    id: 'node-filter-router',
    title: 'Audience Filter & Spend Router',
    subtitle: 'Evaluates customer lifetime spend, attendance frequency, and tags to segment high-value VIP patrons from general leads.',
    category: 'Audience Segmentation',
    badge: 'Smart Filter',
    colorScheme: 'amber',
    iconType: 'filter',
    status: 'active',
    executingText: 'Spend Rule Evaluation (>= ₹50k) & VIP Segmentation',
    hasDataText: '842 VIP Patrons (67.4%) &bull; 406 Standard Leads',
    metrics: [
      { label: 'Filtered Input', value: '1,248 Records' },
      { label: 'VIP Qualified', value: '842 VIPs (67.4%)' },
      { label: 'Lead Standard', value: '406 Standard' },
      { label: 'Filter Latency', value: '8 ms' },
    ],
    config: [
      { label: 'Filter Rule 1', value: 'lifetime_spend_inr >= 50,000' },
      { label: 'Filter Rule 2', value: 'tags CONTAINS "VIP"' },
      { label: 'Match Strategy', value: 'ANY (Logical OR)' },
      { label: 'Priority Routing', value: 'VIP High-Throughput Queue' },
    ],
    sqlQuery: `SELECT 
  customer_id,
  first_name,
  lifetime_spend_inr,
  CASE 
    WHEN lifetime_spend_inr >= 50000 OR tags @> ARRAY['VIP']
      THEN 'VIP Qualified'
    ELSE 'Standard Lead'
  END AS qualification,
  CASE 
    WHEN lifetime_spend_inr >= 50000 THEN 'vip-instant-dispatch-queue'
    ELSE 'standard-email-batch-queue'
  END AS destination_queue
FROM public.audience_batch
ORDER BY lifetime_spend_inr DESC;`,
    tableData: [
      { customer: 'Aarav Sharma', spend: 75000, qualification: 'VIP Qualified', matched_rule: 'Spend >= ₹50k + VIP Tag', destination_queue: 'vip-instant-dispatch', priority: 'P1 High' },
      { customer: 'Priya Patel', spend: 92000, qualification: 'VIP Qualified', matched_rule: 'Spend >= ₹50k', destination_queue: 'vip-instant-dispatch', priority: 'P1 High' },
      { customer: 'Rohan Mehta', spend: 64000, qualification: 'VIP Qualified', matched_rule: 'Spend >= ₹50k', destination_queue: 'vip-instant-dispatch', priority: 'P1 High' },
      { customer: 'Ananya Desai', spend: 58000, qualification: 'VIP Qualified', matched_rule: 'Spend >= ₹50k', destination_queue: 'vip-instant-dispatch', priority: 'P1 High' },
      { customer: 'Vikram Malhotra', spend: 115000, qualification: 'VIP Qualified', matched_rule: 'Spend >= ₹50k + VIP Tag', destination_queue: 'vip-instant-dispatch', priority: 'P1 High' },
      { customer: 'Sneha Reddy', spend: 48000, qualification: 'Standard Lead', matched_rule: 'Spend < ₹50k (Nurture)', destination_queue: 'standard-email-batch', priority: 'P2 Normal' },
      { customer: 'Karan Oberoi', spend: 88000, qualification: 'VIP Qualified', matched_rule: 'Spend >= ₹50k', destination_queue: 'vip-instant-dispatch', priority: 'P1 High' },
      { customer: 'Tara Kapoor', spend: 32000, qualification: 'Standard Lead', matched_rule: 'First-Time Lead', destination_queue: 'standard-email-batch', priority: 'P2 Normal' },
    ],
    inputSample: {
      contact_id: 'rec_1042',
      first_name: 'Aarav',
      lifetime_spend_inr: 75000,
      tags: ['VIP', 'Weekend_Regular'],
    },
    outputSample: {
      type: 'raw',
      content: {
        qualified_as: 'VIP_PATRON',
        routing_queue: 'vip-instant-dispatch',
        offer_eligible: 'Complimentary Champagne Bottle Service & Express Queue Bypass',
        target_channels: ['whatsapp', 'email', 'telegram', 'instagram'],
      },
    },
    logs: [
      { time: '17:00:04', message: 'Evaluating 1,248 records against spend and tag thresholds.', type: 'info' },
      { time: '17:00:04', message: 'Matched 842 VIP tier customers (spend >= ₹50,000).', type: 'success' },
      { time: '17:00:04', message: 'Assigned high-priority dispatch token to batch.', type: 'success' },
    ],
  },
  {
    id: 'node-ai-engine',
    title: 'Groq LPU & Gemini AI Generator',
    subtitle: 'Synthesizes individualized hyper-converting copy with customized RSVP tokens, venue perks, and Meta-compliant tags.',
    category: 'Neural Copy Engine',
    badge: 'Groq LPU (Sub-150ms)',
    colorScheme: 'orange',
    iconType: 'ai',
    status: 'active',
    executingText: 'Groq LPU (llama-3.3-70b) Dynamic 1:1 Copy Synthesis',
    hasDataText: '842 Personalized Payloads & Multi-Channel Copy Tokens',
    metrics: [
      { label: 'Active Engine', value: 'Groq LPU (llama-3.3-70b)' },
      { label: 'Generation Speed', value: '142 ms' },
      { label: 'Personalization', value: 'Dynamic 1:1' },
      { label: 'Fallback Cascade', value: 'Gemini ➔ Ollama' },
    ],
    config: [
      { label: 'Primary AI Model', value: 'llama-3.3-70b-versatile', badge: 'Ultra-Fast' },
      { label: 'Alternative Engine', value: 'xAI Grok 2 & Gemini 2.0', badge: 'Multi-AI' },
      { label: 'Temperature', value: '0.7 (Balanced & Creative)' },
      { label: 'Token Variables', value: '{{first_name}}, {{link}}, {{tier}}' },
    ],
    sqlQuery: `SELECT 
  id, customer_id, recipient_name, 
  ai_provider, model_name, inference_latency_ms,
  tokens_used, generated_copy_hash, status
FROM public.ai_generation_ledger
WHERE campaign_id = 'camp_matrix_vip_2026'
ORDER BY created_at DESC;`,
    tableData: [
      { recipient: 'Aarav Sharma', tier: 'VIP Patron', perks_injected: 'Queue Bypass + Bottle Service', latency: '142ms', engine: 'Groq (llama-3.3-70b)', status: 'Generated' },
      { recipient: 'Priya Patel', tier: 'VIP Patron', perks_injected: 'Reserved Table + Host', latency: '138ms', engine: 'Groq (llama-3.3-70b)', status: 'Generated' },
      { recipient: 'Rohan Mehta', tier: 'VIP Patron', perks_injected: 'Champagne Flute + VIP Valet', latency: '145ms', engine: 'Groq (llama-3.3-70b)', status: 'Generated' },
      { recipient: 'Ananya Desai', tier: 'VIP Patron', perks_injected: 'Lounge Priority Access', latency: '141ms', engine: 'Groq (llama-3.3-70b)', status: 'Generated' },
      { recipient: 'Vikram Malhotra', tier: 'VIP Patron', perks_injected: 'Presidential Table + Valet', latency: '149ms', engine: 'Groq (llama-3.3-70b)', status: 'Generated' },
      { recipient: 'Karan Oberoi', tier: 'VIP Patron', perks_injected: 'Express Entry + Welcome Drink', latency: '136ms', engine: 'Groq (llama-3.3-70b)', status: 'Generated' },
    ],
    inputSample: {
      recipient: 'Aarav Sharma',
      tier: 'VIP',
      campaign: 'Friday Night VIP Gala at Club Matrix',
      perks: ['VIP queue bypass', 'Reserved bottle service', 'Welcome cocktail before 11 PM'],
    },
    outputSample: {
      type: 'raw',
      content: {
        generated_variants: {
          whatsapp: '👑 *EXCLUSIVE VIP INVITATION: Friday Night VIP Gala*\\n\\nHi Aarav! 🌟 You are officially invited to the most anticipated weekend celebration at Club Matrix!...',
          email_subject: 'Aarav, your VIP Gala Access Pass is ready!',
          telegram_post: '⚡ ANNOUNCEMENT: FRIDAY NIGHT VIP GALA - Guestlist is live!',
          instagram_caption: 'Weekend plans dropped! Tap link to RSVP: {{link}} 🍾',
        },
        tokens_injected: 4,
        latency_ms: 142,
      },
    },
    logs: [
      { time: '17:00:05', message: 'Prompt dispatched to Groq LPU engine.', type: 'info' },
      { time: '17:00:05', message: 'Inference completed in 142ms using llama-3.3-70b-versatile.', type: 'success' },
      { time: '17:00:05', message: 'Personalized copy split across 4 output channels.', type: 'success' },
    ],
  },
  {
    id: 'node-whatsapp',
    title: 'Meta WhatsApp Cloud API v21.0',
    subtitle: 'Direct high-engagement 1:1 messaging via official Meta Graph endpoints with delivery status callbacks and webhook tracking.',
    category: 'Channel Dispatch',
    badge: '20 msg/sec &bull; 98% Open',
    colorScheme: 'emerald',
    iconType: 'whatsapp',
    status: 'active',
    executingText: 'Meta WhatsApp Cloud API v21.0 Dispatch (20 msg/sec)',
    hasDataText: '842 Dispatched &bull; 838 Delivered &bull; 98.2% Read Rate',
    metrics: [
      { label: 'Throughput', value: '20 msg/sec' },
      { label: 'Open Rate', value: '98.2%' },
      { label: 'Delivery Cost', value: '₹0.9926 / msg' },
      { label: 'Encryption', value: 'Meta TLS End-to-End' },
    ],
    config: [
      { label: 'WABA ID', value: 'waba_994029104 (Verified)' },
      { label: 'Phone Number ID', value: '+91 98765 00000 (Green Badge)' },
      { label: 'Template Name', value: 'vip_exclusive_invitation_v2' },
      { label: 'Rate-Limit Ceiling', value: '20 msg/sec' },
    ],
    sqlQuery: `SELECT 
  wamid, recipient_phone, recipient_name, 
  delivery_status, cost_inr, sent_at, delivered_at
FROM public.whatsapp_dispatch_log
WHERE campaign_id = 'camp_matrix_vip_2026'
ORDER BY sent_at DESC;`,
    tableData: [
      { wamid: 'wamid_HBgMOTE5ODc2NTE=', recipient: 'Aarav Sharma', phone: '+91 98765 43210', template: 'vip_exclusive_invitation_v2', cost: 0.99, status: 'Delivered', latency: '48ms' },
      { wamid: 'wamid_HBgMOTE5ODIzNDE=', recipient: 'Priya Patel', phone: '+91 98234 11223', template: 'vip_exclusive_invitation_v2', cost: 0.99, status: 'Delivered', latency: '52ms' },
      { wamid: 'wamid_HBgMOTE5NzExMjM=', recipient: 'Rohan Mehta', phone: '+91 97112 33445', template: 'vip_exclusive_invitation_v2', cost: 0.99, status: 'Delivered', latency: '44ms' },
      { wamid: 'wamid_HBgMOTE5ODk5MDU=', recipient: 'Ananya Desai', phone: '+91 98990 55667', template: 'vip_exclusive_invitation_v2', cost: 0.99, status: 'Delivered', latency: '46ms' },
      { wamid: 'wamid_HBgMOTE5ODQ1MDc=', recipient: 'Vikram Malhotra', phone: '+91 98450 77889', template: 'vip_exclusive_invitation_v2', cost: 0.99, status: 'Delivered', latency: '49ms' },
      { wamid: 'wamid_HBgMOTE5ODExMDk=', recipient: 'Karan Oberoi', phone: '+91 98110 99887', template: 'vip_exclusive_invitation_v2', cost: 0.99, status: 'Delivered', latency: '43ms' },
    ],
    inputSample: {
      to: '+91 98765 43210',
      recipient_name: 'Aarav Sharma',
      channel: 'whatsapp',
    },
    outputSample: {
      type: 'whatsapp',
      content: `👑 *EXCLUSIVE VIP INVITATION: Friday Night VIP Gala*

Hi Aarav! 🌟 You are officially invited to the most anticipated weekend celebration at Club Matrix!

✨ *VIP Hospitality Privileges:*
• Express VIP queue bypass & red carpet access
• Reserved table bottle service & premium host
• Complimentary welcome cocktail before 11 PM

🎟️ *Confirm Your Spot & Guestlist:*
👉 https://campaignhub.in/rsvp/aarav-vip-4029

_Allocations are strictly limited for table patrons. Please RSVP early!_`,
    },
    logs: [
      { time: '17:00:06', message: 'Outbound dispatch payload sent to Meta Graph API.', type: 'info' },
      { time: '17:00:06', message: 'HTTP 200 OK from graph.facebook.com/v21.0.', type: 'success' },
      { time: '17:00:07', message: 'Webhook callback: Message marked as DELIVERED.', type: 'success' },
    ],
  },
  {
    id: 'node-email',
    title: 'Resend Email SMTP Gateway',
    subtitle: 'High-reputation transactional and marketing email delivery with SPF, DKIM, DMARC alignment, and instant open tracking.',
    category: 'Channel Dispatch',
    badge: '100% Inboxing &bull; ₹0.08/msg',
    colorScheme: 'blue',
    iconType: 'email',
    status: 'active',
    executingText: 'Resend Dedicated SMTP Inbound/Outbound Gateway',
    hasDataText: '842 Inboxed &bull; 99.8% Placement &bull; 0 Hard Bounces',
    metrics: [
      { label: 'Delivery Speed', value: '125 ms' },
      { label: 'Inboxing Rate', value: '99.8%' },
      { label: 'Cost / Email', value: '₹0.08' },
      { label: 'Authentication', value: 'DKIM / SPF 100%' },
    ],
    config: [
      { label: 'SMTP Gateway', value: 'smtp.resend.com (TLS 1.3)' },
      { label: 'Verified Sender', value: 'VIP Concierge <vip@campaignhub.in>' },
      { label: 'Domain Health', value: 'Verified (100/100)' },
      { label: 'Rate Limit', value: '10 msg/sec' },
    ],
    sqlQuery: `SELECT 
  message_id, recipient_email, recipient_name, 
  subject, inbox_placement, dkim_pass, cost_inr, status
FROM public.email_dispatch_log
WHERE campaign_id = 'camp_matrix_vip_2026'
ORDER BY created_at DESC;`,
    tableData: [
      { message_id: 'msg_resend_9042a', recipient: 'Aarav Sharma', email: 'aarav.sharma@vipclub.in', subject: 'Aarav, your VIP Gala Access Pass is ready!', inbox_placement: '100% Primary Inbox', cost: 0.08, status: 'Delivered' },
      { message_id: 'msg_resend_9043b', recipient: 'Priya Patel', email: 'priya.patel@mumbaitech.co', subject: 'Priya, your VIP Gala Access Pass is ready!', inbox_placement: '100% Primary Inbox', cost: 0.08, status: 'Delivered' },
      { message_id: 'msg_resend_9044c', recipient: 'Rohan Mehta', email: 'rohan.mehta@investcorp.com', subject: 'Rohan, your VIP Gala Access Pass is ready!', inbox_placement: '100% Primary Inbox', cost: 0.08, status: 'Delivered' },
      { message_id: 'msg_resend_9045d', recipient: 'Ananya Desai', email: 'ananya.desai@designstudio.in', subject: 'Ananya, your VIP Gala Access Pass is ready!', inbox_placement: '100% Primary Inbox', cost: 0.08, status: 'Delivered' },
      { message_id: 'msg_resend_9046e', recipient: 'Vikram Malhotra', email: 'vikram.m@luxuryretail.com', subject: 'Vikram, your VIP Gala Access Pass is ready!', inbox_placement: '100% Primary Inbox', cost: 0.08, status: 'Delivered' },
      { message_id: 'msg_resend_9047f', recipient: 'Karan Oberoi', email: 'karan.oberoi@delhicapital.com', subject: 'Karan, your VIP Gala Access Pass is ready!', inbox_placement: '100% Primary Inbox', cost: 0.08, status: 'Delivered' },
    ],
    inputSample: {
      to: 'aarav.sharma@vipclub.in',
      name: 'Aarav Sharma',
      channel: 'email',
    },
    outputSample: {
      type: 'email',
      content: {
        subject: 'Aarav, your VIP Gala Access Pass is ready!',
        body: `Hello Aarav,

Your VIP Table Reservation and Priority Passes for this Friday's Gala at Club Matrix have been generated.

Event Details:
- Date: Friday Night, 9:00 PM onwards
- Location: Club Matrix Main Ballroom
- Priority Entrance: East Gate VIP Valet

Your reservation pass: https://campaignhub.in/rsvp/aarav-vip-4029

Regards,
CampaignHub VIP Team`,
      },
    },
    logs: [
      { time: '17:00:06', message: 'Message dispatched through Resend SMTP gateway.', type: 'info' },
      { time: '17:00:06', message: 'SMTP 250 OK: Message queued for delivery.', type: 'success' },
      { time: '17:00:07', message: 'Delivered to aarav.sharma@vipclub.in inbox.', type: 'success' },
    ],
  },
  {
    id: 'node-telegram',
    title: 'Telegram Channel Broadcast Bot v7.2',
    subtitle: 'Zero-fee instant community broadcast pinned directly to channels and VIP subscriber groups with interactive bot buttons.',
    category: 'Channel Dispatch',
    badge: '100% Free API &bull; Zero Fee',
    colorScheme: 'indigo',
    iconType: 'telegram',
    status: 'active',
    executingText: 'Telegram Bot API v7.2 Channel Broadcast Dispatcher',
    hasDataText: '14,500 Community Reach &bull; Pinned Alert &bull; ₹0.00 Free API',
    metrics: [
      { label: 'Broadcast Speed', value: '65 ms' },
      { label: 'API Fee', value: '₹0.00 (Free)' },
      { label: 'Target Reach', value: '14,500 Members' },
      { label: 'Pin to Channel', value: 'Enabled' },
    ],
    config: [
      { label: 'Bot Token', value: 'bot7492019482:*** (Connected)' },
      { label: 'Channel ID', value: '@CampaignHubVIPChannel' },
      { label: 'Broadcast Mode', value: 'HTML Formatted Post' },
      { label: 'Notification', value: 'High Priority Audible Alert' },
    ],
    sqlQuery: `SELECT 
  message_id, target_channel, broadcast_type, 
  pinned, views_count, shares_count, status
FROM public.telegram_broadcast_log
WHERE campaign_id = 'camp_matrix_vip_2026';`,
    tableData: [
      { message_id: 'tg_msg_749201', channel: '@CampaignHubVIPChannel', type: 'Channel Broadcast', reach: '14,500 Members', pinned: 'Yes (Top Pinned)', cost: 0.00, status: 'Delivered' },
      { message_id: 'tg_msg_749202', channel: '@MatrixClubOfficial', type: 'Community Announcement', reach: '28,400 Members', pinned: 'Yes (Top Pinned)', cost: 0.00, status: 'Delivered' },
      { message_id: 'tg_msg_749203', channel: '@DelhiNightlifeVIP', type: 'Partner Cross-Post', reach: '9,200 Members', pinned: 'Standard', cost: 0.00, status: 'Delivered' },
    ],
    inputSample: {
      channel_id: '@CampaignHubVIPChannel',
      type: 'telegram_broadcast',
    },
    outputSample: {
      type: 'telegram',
      content: `⚡ **ANNOUNCEMENT: FRIDAY NIGHT VIP GALA**

Hey community! 🚀 Official guestlist access for **Friday Night VIP Gala** is now open!

📅 **Event Details:**
• Doors open 9:00 PM onwards &bull; Main Floor
• Live performance & special guest DJ sets
• Dedicated VIP lounge & priority concierge

🔗 **RSVP & Access Passes:** https://campaignhub.in/rsvp/vip-matrix

*📌 Tables and allocations are strictly first-come, first-served!*`,
    },
    logs: [
      { time: '17:00:06', message: 'Connecting to Telegram Bot API v7.2.', type: 'info' },
      { time: '17:00:06', message: 'Post published to @CampaignHubVIPChannel in 65ms.', type: 'success' },
      { time: '17:00:06', message: 'Message pinned to top of community channel.', type: 'success' },
    ],
  },
  {
    id: 'node-instagram',
    title: 'Instagram Broadcast Channel & Direct',
    subtitle: 'Broadcast channel drops and priority DM notifications via Meta Graph API v21.0 to maximize viral social momentum.',
    category: 'Channel Dispatch',
    badge: 'Graph API v21.0',
    colorScheme: 'purple',
    iconType: 'instagram',
    status: 'active',
    executingText: 'Meta Graph API v21.0 Instagram Broadcast & Story Hook',
    hasDataText: '34.8% Engagement &bull; Story Hook & Bio Link Activated',
    metrics: [
      { label: 'Engagement Rate', value: '34.8%' },
      { label: 'Dispatch Latency', value: '95 ms' },
      { label: 'Audience Reach', value: 'Story & Broadcast' },
      { label: 'Graph API Version', value: 'v21.0' },
    ],
    config: [
      { label: 'Instagram Account ID', value: 'ig_acc_902910492' },
      { label: 'Broadcast Channel ID', value: 'ig_bc_8849201' },
      { label: 'Access Token', value: 'EAAG*** (Graph Verified)' },
      { label: 'Media Type', value: 'Engaging Text & Story Hook' },
    ],
    sqlQuery: `SELECT 
  broadcast_id, account_handle, channel_type, 
  reach_impressions, story_link_clicks, status
FROM public.instagram_dispatch_log
WHERE campaign_id = 'camp_matrix_vip_2026';`,
    tableData: [
      { broadcast_id: 'ig_drop_8849201', account: '@clubmatrix.vip', channel: 'Broadcast Channel', reach: '42,100 Followers', clicks: '1,840 Clicks', status: 'Published' },
      { broadcast_id: 'ig_drop_8849202', account: '@campaignhub.in', channel: 'Direct Story Sticker', reach: '18,900 Views', clicks: '920 Clicks', status: 'Published' },
      { broadcast_id: 'ig_drop_8849203', account: '@delhivipconcierge', channel: 'Partner Story Mention', reach: '12,400 Views', clicks: '610 Clicks', status: 'Published' },
    ],
    inputSample: {
      account_id: 'ig_acc_902910492',
      format: 'broadcast_channel',
    },
    outputSample: {
      type: 'raw',
      content: {
        channel_id: 'ig_bc_8849201',
        text: 'Hey fam! 🌟 Huge news dropping right now! We are hosting Friday Night VIP Gala and guestlist spots just went live! 🍸🎶 Drop a 🍾 or tap link in bio to RSVP!',
        status: 'published',
      },
    },
    logs: [
      { time: '17:00:06', message: 'Payload queued for Instagram Graph API v21.0.', type: 'info' },
      { time: '17:00:06', message: 'Broadcast channel message pushed successfully.', type: 'success' },
    ],
  },
  {
    id: 'node-telemetry',
    title: 'BullMQ Telemetry & Completion Terminal',
    subtitle: 'Aggregates all multi-channel delivery receipts, updates customer interaction scores, and records financial safety ledger.',
    category: 'Audit & Telemetry',
    badge: '24/7 BullMQ Worker',
    colorScheme: 'emerald',
    iconType: 'telemetry',
    status: 'active',
    executingText: 'BullMQ Upstash Redis Queue Worker & Safety Audit Ledger',
    hasDataText: '842 Processed &bull; ₹835.77 Cost Accounted &bull; 99.4% Delivery',
    metrics: [
      { label: 'Total Dispatched', value: '842 VIP Packets' },
      { label: 'Delivery Success', value: '99.4% Verified' },
      { label: 'Total Cost INR', value: '₹835.77 Accounted' },
      { label: 'Safety Budget', value: '₹24,164.23 Remaining' },
    ],
    config: [
      { label: 'Worker Engine', value: 'Upstash Redis + BullMQ (Active)' },
      { label: 'Auto-Retry Strategy', value: 'Exponential Backoff (3 max)' },
      { label: 'Safety Budget Cap', value: '₹25,000 INR (Enforced)' },
      { label: 'Audit Trail', value: 'Immutable delivery logs recorded' },
    ],
    sqlQuery: `SELECT 
  job_id, queue_name, status, 
  total_records, total_spent_inr, safety_cap_remaining_inr
FROM public.campaign_audit_ledger
WHERE campaign_id = 'camp_matrix_vip_2026';`,
    tableData: [
      { job_id: 'bullmq_job_01', queue: 'meta-whatsapp-queue', records: 842, success_rate: '99.5%', cost: 835.77, status: 'Completed' },
      { job_id: 'bullmq_job_02', queue: 'resend-smtp-queue', records: 842, success_rate: '99.8%', cost: 67.36, status: 'Completed' },
      { job_id: 'bullmq_job_03', queue: 'telegram-broadcast-queue', records: 1, success_rate: '100%', cost: 0.00, status: 'Completed' },
      { job_id: 'bullmq_job_04', queue: 'instagram-graph-queue', records: 1, success_rate: '100%', cost: 0.00, status: 'Completed' },
      { job_id: 'bullmq_job_05', queue: 'safety-budget-circuit-breaker', records: 842, success_rate: '100%', cost: 0.00, status: 'Verified' },
    ],
    inputSample: {
      dispatched_summary: {
        whatsapp_delivered: 838,
        email_delivered: 840,
        telegram_views: 12040,
        instagram_reactions: 840,
      },
    },
    outputSample: {
      type: 'raw',
      content: {
        pipeline_status: 'COMPLETED_SUCCESSFULLY',
        delivery_rate: '99.4%',
        safety_budget_consumed: '₹835.77',
        circuit_breaker: 'NORMAL_NOMINAL',
        completed_at: new Date().toISOString(),
      },
    },
    logs: [
      { time: '17:00:07', message: 'All channel callbacks received and correlated.', type: 'info' },
      { time: '17:00:08', message: 'Delivery receipts audited. Overall success rate: 99.4%.', type: 'success' },
      { time: '17:00:08', message: 'Pipeline status marked as COMPLETED. Ledger synced.', type: 'success' },
    ],
  },
];

const DEFAULT_NODE_LAYOUT: Record<string, { x: number; y: number; w: number }> = {
  'node-db-sheets': { x: 40, y: 220, w: 290 },
  'node-filter-router': { x: 380, y: 220, w: 290 },
  'node-ai-engine': { x: 720, y: 220, w: 290 },
  'node-whatsapp': { x: 1060, y: 30, w: 290 },
  'node-email': { x: 1060, y: 240, w: 290 },
  'node-telegram': { x: 1060, y: 450, w: 290 },
  'node-instagram': { x: 1060, y: 660, w: 290 },
  'node-telemetry': { x: 1420, y: 340, w: 290 },
};

export function AutomationCanvas({
  onSelectNode,
  selectedNodeId,
  isRunningTest = false,
  activeTestStep = 0,
}: AutomationCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Draggable Node Positions with localStorage memory
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number; w: number }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('campaignhub_automation_nodes_layout_v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...DEFAULT_NODE_LAYOUT, ...parsed };
          }
        }
      } catch (e) {}
    }
    return DEFAULT_NODE_LAYOUT;
  });

  // Save node positions on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campaignhub_automation_nodes_layout_v4', JSON.stringify(nodePositions));
      } catch (e) {}
    }
  }, [nodePositions]);

  // Drag-and-drop state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  } | null>(null);

  // Canvas background panning state
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const panStartRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();

    const currentPos = nodePositions[nodeId] || DEFAULT_NODE_LAYOUT[nodeId];
    dragRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: currentPos.x,
      origY: currentPos.y,
      hasMoved: false,
    };
    setDraggingNodeId(nodeId);
  };

  // Global mousemove & mouseup listeners for smooth 60fps dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { nodeId, startX, startY, origX, origY } = dragRef.current;
      const dx = (e.clientX - startX) / zoomLevel;
      const dy = (e.clientY - startY) / zoomLevel;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }

      setNodePositions((prev) => {
        const prevNode = prev[nodeId] || DEFAULT_NODE_LAYOUT[nodeId];
        return {
          ...prev,
          [nodeId]: {
            ...prevNode,
            x: Math.max(10, Math.round(origX + dx)),
            y: Math.max(10, Math.round(origY + dy)),
          },
        };
      });
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        setDraggingNodeId(null);
        // keep dragRef momentarily for click handler evaluation, then clear
        setTimeout(() => {
          dragRef.current = null;
        }, 50);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [zoomLevel]);

  // Background Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!containerRef.current) return;
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
    setIsPanningCanvas(true);
  };

  useEffect(() => {
    const handlePanMove = (e: MouseEvent) => {
      if (!panStartRef.current || !containerRef.current) return;
      const dx = e.clientX - panStartRef.current.startX;
      const dy = e.clientY - panStartRef.current.startY;
      containerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
      containerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    };

    const handlePanUp = () => {
      panStartRef.current = null;
      setIsPanningCanvas(false);
    };

    if (isPanningCanvas) {
      window.addEventListener('mousemove', handlePanMove);
      window.addEventListener('mouseup', handlePanUp);
      return () => {
        window.removeEventListener('mousemove', handlePanMove);
        window.removeEventListener('mouseup', handlePanUp);
      };
    }
  }, [isPanningCanvas]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(Number((prev + delta).toFixed(1)), 0.5), 1.6));
  };

  const handleResetLayout = () => {
    setNodePositions(DEFAULT_NODE_LAYOUT);
    setZoomLevel(1);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('campaignhub_automation_nodes_layout_v4');
      } catch (e) {}
    }
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  // Node selection handler that distinguishes drag vs click
  const handleNodeClick = (n: PipelineNodeData) => {
    if (dragRef.current && dragRef.current.hasMoved) {
      return; // was dragging, ignore click
    }
    onSelectNode(n);
  };

  // SVG Connection cables definition
  const cables = [
    { from: 'node-db-sheets', to: 'node-filter-router', step: 1 },
    { from: 'node-filter-router', to: 'node-ai-engine', step: 2 },
    { from: 'node-ai-engine', to: 'node-whatsapp', step: 3 },
    { from: 'node-ai-engine', to: 'node-email', step: 3 },
    { from: 'node-ai-engine', to: 'node-telegram', step: 3 },
    { from: 'node-ai-engine', to: 'node-instagram', step: 3 },
    { from: 'node-whatsapp', to: 'node-telemetry', step: 4 },
    { from: 'node-email', to: 'node-telemetry', step: 4 },
    { from: 'node-telegram', to: 'node-telemetry', step: 4 },
    { from: 'node-instagram', to: 'node-telemetry', step: 4 },
  ];

  // Dynamically compute canvas bounds based on node positions
  const canvasWidth = Math.max(1800, ...Object.values(nodePositions).map((p) => p.x + p.w + 200));
  const canvasHeight = Math.max(760, ...Object.values(nodePositions).map((p) => p.y + 260));

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#F4F7F3]">
      {/* Canvas Floating Top Controls & Movable Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-border shadow-xs text-xs">
        <div className="hidden sm:flex items-center gap-1.5 text-txt-muted text-[11px] font-semibold mr-1 pr-2 border-r border-border">
          <Move className="w-3.5 h-3.5 text-brand" />
          <span>Freely Draggable Nodes (n8n Style)</span>
        </div>

        <button
          type="button"
          onClick={() => handleZoom(-0.1)}
          className="p-1 text-txt-muted hover:text-txt-primary hover:bg-border/40 rounded-lg cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono font-bold text-txt-primary w-12 text-center select-none">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          type="button"
          onClick={() => handleZoom(0.1)}
          className="p-1 text-txt-muted hover:text-txt-primary hover:bg-border/40 rounded-lg cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={handleResetLayout}
          className="flex items-center gap-1 text-txt-muted hover:text-brand font-bold text-[11px] cursor-pointer"
          title="Reset to Default n8n Layout"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Reset Layout</span>
        </button>
      </div>

      {/* Canvas Scrollable Pan Area */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        className={`flex-1 overflow-auto relative p-8 select-none ${
          isPanningCanvas ? 'cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, #CBD7CE 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          className="relative transition-transform duration-75 origin-top-left"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* SVG Connection Cables with Animated Glowing Beams & Packets */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="cableGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E6B4F" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* Glowing Filter for Flowing Light Packets */}
              <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="burstGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {cables.map((c, idx) => {
              const src = nodePositions[c.from] || DEFAULT_NODE_LAYOUT[c.from];
              const dst = nodePositions[c.to] || DEFAULT_NODE_LAYOUT[c.to];
              if (!src || !dst) return null;

              // Compute dynamic port coordinates based on current dragged positions
              const x1 = src.x + src.w;
              const y1 = src.y + 44;
              const x2 = dst.x;
              const y2 = dst.y + 44;

              const dx = Math.max(Math.abs(x2 - x1) * 0.5, 45);
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const isCableActive = isRunningTest ? activeTestStep >= c.step : true;
              const isExecutingThisStep = isRunningTest && activeTestStep === c.step;

              return (
                <g key={`cable-${idx}-${c.from}-${c.to}`}>
                  {/* 1. Base Structural Cable */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCableActive ? '#1E6B4F' : '#94A3B8'}
                    strokeWidth={isCableActive ? 2.5 : 2}
                    strokeOpacity={isCableActive ? 0.6 : 0.25}
                    strokeLinecap="round"
                  />

                  {/* 2. Flowing Animated Dash Beam */}
                  {isCableActive && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isExecutingThisStep ? '#10B981' : '#34D399'}
                      strokeWidth={isExecutingThisStep ? 3.5 : 2.5}
                      strokeDasharray="6 14"
                      strokeLinecap="round"
                      style={{
                        animation: `flowDash ${isExecutingThisStep ? '0.7s' : '1.6s'} linear infinite`,
                      }}
                    />
                  )}

                  {/* 3. Glowing Moving Data Packets (Hardware Accelerated SVG animateMotion) */}
                  {isCableActive && (
                    <g>
                      {/* Primary Data Packet */}
                      <circle r="4.5" fill="#10B981" filter="url(#packetGlow)">
                        <animateMotion
                          path={pathD}
                          dur={isExecutingThisStep ? '0.8s' : '2.2s'}
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Staggered Secondary Energy Pulse */}
                      <circle r="3" fill="#6EE7B7" opacity="0.9">
                        <animateMotion
                          path={pathD}
                          dur={isExecutingThisStep ? '0.8s' : '2.2s'}
                          begin={isExecutingThisStep ? '0.4s' : '1.1s'}
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Active Execution Supercharge Burst */}
                      {isExecutingThisStep && (
                        <circle r="6" fill="#F59E0B" filter="url(#burstGlow)">
                          <animateMotion
                            path={pathD}
                            dur="0.8s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  )}

                  {/* 4. Connection Port Handles */}
                  <circle
                    cx={x1}
                    cy={y1}
                    r={5}
                    fill="#1E6B4F"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <circle
                    cx={x2}
                    cy={y2}
                    r={5}
                    fill="#1E6B4F"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                </g>
              );
            })}
          </svg>

          {/* Freely Movable Pipeline Nodes */}
          {PIPELINE_NODES.map((n) => {
            const pos = nodePositions[n.id] || DEFAULT_NODE_LAYOUT[n.id];
            if (!pos) return null;

            const isSelected = selectedNodeId === n.id;
            const isDragging = draggingNodeId === n.id;
            const isExecutingThisNode =
              isRunningTest &&
              ((activeTestStep === 1 && n.id === 'node-db-sheets') ||
                (activeTestStep === 2 && n.id === 'node-filter-router') ||
                (activeTestStep === 3 && n.id === 'node-ai-engine') ||
                (activeTestStep === 4 && n.id.startsWith('node-') && n.category === 'Channel Dispatch') ||
                (activeTestStep === 5 && n.id === 'node-telemetry'));

            const renderIcon = () => {
              switch (n.iconType) {
                case 'whatsapp':
                  return <WhatsAppLogo className="w-4 h-4" />;
                case 'email':
                  return <GmailLogo className="w-4 h-4" />;
                case 'telegram':
                  return <TelegramLogo className="w-4 h-4" />;
                case 'instagram':
                  return <InstagramLogo className="w-4 h-4" />;
                case 'ai':
                  return <GroqLogo className="w-4 h-4" />;
                case 'database':
                  return <Database className="w-4 h-4 text-emerald-700" />;
                case 'filter':
                  return <Sliders className="w-4 h-4 text-amber-700" />;
                default:
                  return <ShieldCheck className="w-4 h-4 text-emerald-700" />;
              }
            };

            return (
              <div
                key={n.id}
                onMouseDown={(e) => handleNodeMouseDown(e, n.id)}
                onClick={() => handleNodeClick(n)}
                style={{
                  transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                  width: `${pos.w}px`,
                }}
                className={`absolute z-10 rounded-2xl bg-white border select-none transition-shadow ${
                  isDragging
                    ? 'cursor-grabbing z-30 ring-4 ring-[#1E6B4F]/30 shadow-2xl scale-[1.02]'
                    : isSelected
                      ? 'cursor-grab border-[#1E6B4F] ring-3 ring-[#1E6B4F]/20 shadow-lg'
                      : isExecutingThisNode
                        ? 'cursor-grab border-emerald-500 ring-3 ring-emerald-400 shadow-xl animate-pulse'
                        : 'cursor-grab border-border/90 shadow-2xs hover:border-[#1E6B4F]/70 hover:shadow-md'
                }`}
              >
                {/* Drag Handle Top Bar */}
                <div className="p-3 bg-[#F4F7F3] rounded-t-2xl border-b border-border/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-border shadow-2xs flex items-center justify-center shrink-0">
                      {renderIcon()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-txt-muted block leading-none truncate">
                        {n.category}
                      </span>
                      <h4 className="text-xs font-bold text-txt-primary truncate mt-0.5">
                        {n.title.split(' ')[0]} {n.title.split(' ')[1] || ''}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-emerald-800 border border-border">
                      {n.badge.split('&bull;')[0]}
                    </span>
                    <Move className="w-3 h-3 text-txt-muted opacity-50" />
                  </div>
                </div>

                {/* Node Body & Stats */}
                <div className="p-3 space-y-2.5 pointer-events-none">
                  {/* Execution Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{isExecutingThisNode ? 'Executing Live...' : 'Properly Executed'}</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold text-txt-muted">
                      {n.metrics[2]?.value || '14 ms'}
                    </span>
                  </div>

                  {/* What it is executing */}
                  <div className="p-2 rounded-xl bg-[#E9F0E8]/80 border border-[#DCE5DD] text-[10.5px] space-y-0.5">
                    <div className="flex items-center gap-1 font-bold text-[#1E6B4F]">
                      <Zap className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span className="uppercase tracking-wider text-[9px]">Executing:</span>
                    </div>
                    <p className="text-txt-primary font-semibold text-[11px] leading-tight line-clamp-1" title={n.executingText}>
                      {n.executingText}
                    </p>
                  </div>

                  {/* What it has */}
                  <div className="p-2 rounded-xl bg-white border border-border/80 text-[10.5px] space-y-0.5 shadow-2xs">
                    <div className="flex items-center gap-1 font-bold text-txt-muted">
                      <Database className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span className="uppercase tracking-wider text-[9px]">Has:</span>
                    </div>
                    <p className="text-txt-primary font-bold text-[11px] leading-tight line-clamp-1" title={n.hasDataText}>
                      {n.hasDataText}
                    </p>
                  </div>

                  {/* Click to Inspect Left Footer */}
                  <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[10px]">
                    <span className="text-txt-muted font-medium truncate max-w-[150px]">
                      {n.metrics[0].label}: <strong className="text-txt-primary font-mono">{n.metrics[0].value}</strong>
                    </span>
                    <span className="text-brand font-bold flex items-center gap-0.5 shrink-0">
                      <span>Inspect Left</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Input Port Handle Pin */}
                {n.id !== 'node-db-sheets' && (
                  <div
                    className="absolute -left-2 top-[44px] -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#1E6B4F] shadow-xs flex items-center justify-center pointer-events-none"
                    title="Input Port"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1E6B4F]" />
                  </div>
                )}

                {/* Output Port Handle Pin */}
                {n.id !== 'node-telemetry' && (
                  <div
                    className="absolute -right-2 top-[44px] -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#1E6B4F] shadow-xs flex items-center justify-center pointer-events-none"
                    title="Output Port"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1E6B4F]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes flowDash {
          from {
            stroke-dashoffset: 40;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
