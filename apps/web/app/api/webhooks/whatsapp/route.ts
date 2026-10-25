import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDecryptedSettings } from '@/lib/settings';

// GET: Meta Webhook Verification Handshake
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const settings = await getDecryptedSettings();
  const configuredVerifyToken = settings.meta_webhook_verify_token || 'campaignhub_wa_verify';

  if (mode === 'subscribe' && token === configuredVerifyToken) {
    console.log('[Meta Webhook] Successfully verified webhook challenge.');
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[Meta Webhook] Verification failed. Token mismatch.');
  return new NextResponse('Forbidden', { status: 403 });
}

// POST: Inbound Delivery Statuses and Customer Messages
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    const settings = await getDecryptedSettings();
    const appSecret = settings.meta_app_secret;

    // Cryptographic signature check if appSecret is configured
    if (appSecret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')}`;

      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        console.error('[Meta Webhook] X-Hub-Signature-256 HMAC validation failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const entries = payload.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const val = change.value;
        if (!val) continue;

        // 1. Process Delivery Status Updates
        const statuses = val.statuses || [];
        for (const st of statuses) {
          const wamid = st.id;
          const status = st.status; // 'sent', 'delivered', 'read', 'failed'

          if (wamid) {
            if (status === 'delivered') {
              await supabase
                .from('messages')
                .update({ status: 'delivered', delivered_at: now })
                .eq('provider_message_id', wamid);
            } else if (status === 'read') {
              await supabase
                .from('messages')
                .update({ status: 'read', read_at: now })
                .eq('provider_message_id', wamid);
            } else if (status === 'failed') {
              const errMsg = st.errors?.[0]?.message || 'WhatsApp message failed to deliver';
              await supabase
                .from('messages')
                .update({ status: 'failed', error: errMsg })
                .eq('provider_message_id', wamid);
            }
          }
        }

        // 2. Process Inbound Messages & STOP Opt-Outs
        const messages = val.messages || [];
        for (const msg of messages) {
          const rawSender = msg.from; // e.g. "919876543210"
          const senderPhone = rawSender.startsWith('+') ? rawSender : `+${rawSender}`;
          const bodyText = msg.text?.body || '';

          // Find contact by normalized phone
          const { data: contact } = await supabase
            .from('contacts')
            .select('id, name, phone')
            .eq('phone', senderPhone)
            .maybeSingle();

          // Save into inbound_messages
          await supabase.from('inbound_messages').insert({
            contact_id: contact?.id || null,
            channel: 'whatsapp',
            body: bodyText,
            received_at: now,
            raw: msg,
          });

          // Check for STOP / UNSUBSCRIBE keywords
          const normalizedKeyword = bodyText.trim().toUpperCase();
          if (
            ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'OPT OUT', 'OPTOUT'].includes(normalizedKeyword)
          ) {
            console.log(`[Meta Webhook] Inbound STOP detected from ${senderPhone}. Opting out.`);
            if (contact?.id) {
              await supabase
                .from('contacts')
                .update({
                  whatsapp_opt_in: false,
                  unsubscribed: true,
                })
                .eq('id', contact.id);

              // Send one-time confirmation message
              const token = settings.meta_access_token;
              const phoneId = settings.meta_phone_number_id;
              if (token && phoneId) {
                try {
                  await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      messaging_product: 'whatsapp',
                      recipient_type: 'individual',
                      to: rawSender,
                      type: 'text',
                      text: {
                        body: 'You have been unsubscribed from WhatsApp notifications. Reply START to resubscribe at any time.',
                      },
                    }),
                  });
                } catch (sendErr) {
                  console.error('Failed to send unsubscribe auto-reply:', sendErr);
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('[Meta Webhook Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
