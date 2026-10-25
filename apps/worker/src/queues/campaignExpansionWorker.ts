import { Worker, Queue, Job } from 'bullmq';
import { redisConnection } from '../lib/redis.js';
import { db } from '../lib/db.js';
import { sendTelegramChannelPost } from '../senders/telegram.js';
import { calculateWhatsAppCost, type Campaign } from '@campaignhub/shared';
import { messageDispatchQueue } from './messageDispatchWorker.js';

export const EXPANSION_QUEUE_NAME = 'campaign-expansion-queue';
export const campaignExpansionQueue = new Queue(EXPANSION_QUEUE_NAME, {
  connection: redisConnection,
});

export function startCampaignExpansionWorker() {
  const worker = new Worker(
    EXPANSION_QUEUE_NAME,
    async (job: Job<{ campaignId: string }>) => {
      const { campaignId } = job.data;
      console.log(`[Expansion] Expanding campaign ${campaignId}...`);

      // 1. Fetch campaign
      const { data: campaign, error: campErr } = await db
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campErr || !campaign) {
        console.error(`[Expansion] Campaign ${campaignId} not found:`, campErr);
        return;
      }

      if (campaign.status !== 'running') {
        console.log(`[Expansion] Campaign ${campaignId} status is ${campaign.status}, skipping.`);
        return;
      }

      // 2. If Telegram channel is enabled, post to the channel ONCE per campaign
      if (campaign.channels.includes('telegram')) {
        console.log(`[Expansion] Dispatching Telegram channel broadcast for campaign ${campaignId}...`);
        await sendTelegramChannelPost(campaign);
      }

      // 3. Query audience contacts in batches
      let contactQuery = db
        .from('contacts')
        .select('*')
        .order('id', { ascending: true });

      if (campaign.audience_tags && campaign.audience_tags.length > 0) {
        contactQuery = contactQuery.contains('tags', campaign.audience_tags);
      }

      if ((campaign as any).audience_tier && (campaign as any).audience_tier !== 'all') {
        contactQuery = contactQuery.eq('tier', (campaign as any).audience_tier);
      }

      const pageSize = 500;
      let from = 0;
      let hasMore = true;
      let totalQueued = 0;

      while (hasMore) {
        const { data: contacts, error: contErr } = await contactQuery.range(from, from + pageSize - 1);
        if (contErr || !contacts || contacts.length === 0) {
          hasMore = false;
          break;
        }

        for (const contact of contacts) {
          // Process each selected channel for this contact
          for (const channel of campaign.channels) {
            // Telegram channel posts were already handled once per campaign.
            // Only direct message if contact has telegram_chat_id
            if (channel === 'telegram' && !contact.telegram_chat_id) {
              continue;
            }

            // Check opt-in & unsubscribed
            const isUnsubscribed = contact.unsubscribed;
            let hasOptIn = true;

            if (channel === 'whatsapp') {
              hasOptIn = contact.whatsapp_opt_in && !isUnsubscribed;
            } else if (channel === 'email') {
              hasOptIn = contact.email_opt_in && !isUnsubscribed;
            } else if (channel === 'telegram') {
              hasOptIn = Boolean(contact.telegram_chat_id) && !isUnsubscribed;
            }

            if (!hasOptIn) {
              // Record as skipped
              await db.from('messages').upsert(
                {
                  campaign_id: campaignId,
                  contact_id: contact.id,
                  channel,
                  status: 'skipped',
                  error: isUnsubscribed
                    ? 'Contact has unsubscribed'
                    : `Contact has not opted in for ${channel}`,
                  queued_at: new Date().toISOString(),
                },
                { onConflict: 'campaign_id,contact_id,channel' }
              );
              continue;
            }

            // Calculate estimated unit cost if WhatsApp
            let unitCost = 0;
            if (channel === 'whatsapp') {
              unitCost = calculateWhatsAppCost(1, 'MARKETING');
            }

            // Pre-insert message as 'queued' (strictly idempotent unique key)
            const { data: insertedMsg, error: msgErr } = await db
              .from('messages')
              .upsert(
                {
                  campaign_id: campaignId,
                  contact_id: contact.id,
                  channel,
                  status: 'queued',
                  cost_inr: unitCost,
                  queued_at: new Date().toISOString(),
                },
                { onConflict: 'campaign_id,contact_id,channel' }
              )
              .select('id, status')
              .single();

            if (!msgErr && insertedMsg) {
              // Add dispatch job to BullMQ
              await messageDispatchQueue.add(
                `send-${channel}-${insertedMsg.id}`,
                {
                  messageId: insertedMsg.id,
                  campaignId,
                  contactId: contact.id,
                  channel,
                },
                {
                  attempts: 3,
                  backoff: {
                    type: 'exponential',
                    delay: 2000,
                  },
                  removeOnComplete: true,
                }
              );
              totalQueued++;
            }
          }
        }

        from += pageSize;
        if (contacts.length < pageSize) {
          hasMore = false;
        }
      }

      console.log(`[Expansion] Campaign ${campaignId} queued ${totalQueued} individual delivery jobs.`);
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Expansion] Job ${job?.id} failed:`, err);
  });

  return worker;
}
