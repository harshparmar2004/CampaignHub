import { Worker, Queue, Job } from 'bullmq';
import { redisConnection } from '../lib/redis.js';
import { db } from '../lib/db.js';
import { sendWhatsAppMessage } from '../senders/whatsapp.js';
import { sendCampaignEmail } from '../senders/email.js';
import { sendTelegramDirectMessage } from '../senders/telegram.js';
import { sendInstagramMessage } from '../senders/instagram.js';

export const DISPATCH_QUEUE_NAME = 'message-dispatch-queue';
export const messageDispatchQueue = new Queue(DISPATCH_QUEUE_NAME, {
  connection: redisConnection,
});

export function startMessageDispatchWorker() {
  const worker = new Worker(
    DISPATCH_QUEUE_NAME,
    async (job: Job<{
      messageId: string;
      campaignId: string;
      contactId: string;
      channel: 'whatsapp' | 'telegram' | 'email';
    }>) => {
      const { messageId, campaignId, contactId, channel } = job.data;

      // 1. Check campaign state
      const { data: campaign } = await db
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (!campaign || campaign.status === 'cancelled') {
        console.log(`[Dispatch] Campaign ${campaignId} cancelled or missing, aborting job.`);
        return;
      }

      if (campaign.status === 'paused') {
        console.log(`[Dispatch] Campaign ${campaignId} paused, moving job back to delayed.`);
        await job.moveToDelayed(Date.now() + 10000, job.token!);
        return;
      }

      // 2. Fetch existing message record for idempotency check
      const { data: message } = await db
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (!message) {
        console.error(`[Dispatch] Message ${messageId} not found in database.`);
        return;
      }

      if (message.status === 'sent' || message.status === 'delivered' || message.status === 'read') {
        // Idempotency: message was already sent! Never re-send.
        console.log(`[Dispatch] Message ${messageId} already ${message.status}, skipping.`);
        return;
      }

      // 3. Fetch contact
      const { data: contact } = await db
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (!contact) {
        await db.from('messages').update({
          status: 'failed',
          error: 'Contact deleted from database before send',
        }).eq('id', messageId);
        return;
      }

      // 4. Dispatch based on channel
      let sendResult: { success: boolean; providerId?: string; error?: string; isTransient?: boolean } = {
        success: false,
        error: 'Unknown channel',
      };

      if (channel === 'whatsapp') {
        sendResult = await sendWhatsAppMessage(contact, campaign);
      } else if (channel === 'email') {
        sendResult = await sendCampaignEmail(contact, campaign);
      } else if (channel === 'telegram') {
        sendResult = await sendTelegramDirectMessage(contact, campaign);
      } else if (channel === 'instagram') {
        sendResult = await sendInstagramMessage(contact, campaign);
      }

      const now = new Date().toISOString();

      if (sendResult.success) {
        await db.from('messages').update({
          status: 'sent',
          provider_message_id: sendResult.providerId || null,
          sent_at: now,
          error: null,
        }).eq('id', messageId);
        console.log(`[Dispatch] Sent ${channel} to ${contact.name} (${contact.phone || contact.email})`);
      } else {
        console.error(`[Dispatch] Failed ${channel} to ${contact.name}: ${sendResult.error}`);

        if (sendResult.isTransient && job.attemptsMade < 3) {
          // Rethrow to let BullMQ exponential backoff retry transient failures
          throw new Error(sendResult.error);
        } else {
          // Permanent failure or max retries exhausted
          await db.from('messages').update({
            status: 'failed',
            error: sendResult.error || 'Delivery failed',
          }).eq('id', messageId);
        }
      }

      // 5. Evaluate campaign completion
      await checkAndUpdateCampaignCompletion(campaignId, campaign.name);
    },
    {
      connection: redisConnection,
      concurrency: 10,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Dispatch] Job ${job?.id} failed on attempt ${job?.attemptsMade}:`, err.message);
  });

  return worker;
}

async function checkAndUpdateCampaignCompletion(campaignId: string, campaignName: string) {
  // Count remaining queued messages
  const { count: queuedCount } = await db
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'queued');

  if (queuedCount === 0) {
    // All messages processed! Check failure rate
    const { count: totalCount } = await db
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    const { count: failedCount } = await db
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'failed');

    const total = totalCount || 0;
    const failed = failedCount || 0;
    const completedStatus = (total > 0 && failed === total) ? 'failed' : 'completed';

    await db.from('campaigns').update({
      status: completedStatus,
      completed_at: new Date().toISOString(),
    }).eq('id', campaignId);

    console.log(`[Campaign Lifecycle] Campaign ${campaignId} finished as ${completedStatus}. (${failed}/${total} failed)`);

    // Failure rate alert threshold (>20%)
    if (total > 0 && failed / total > 0.2) {
      const failurePercent = Math.round((failed / total) * 100);
      await db.from('system_alerts').insert({
        campaign_id: campaignId,
        type: 'HIGH_FAILURE_RATE',
        message: `Campaign "${campaignName}" completed with high failure rate: ${failurePercent}% (${failed}/${total} failed).`,
        severity: 'warning',
        created_at: new Date().toISOString(),
      });
      console.warn(`[Alert] High failure rate alert written for campaign ${campaignId}`);
    }
  }
}
