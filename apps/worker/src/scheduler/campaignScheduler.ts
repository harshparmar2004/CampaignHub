import { db } from '../lib/db.js';
import { campaignExpansionQueue } from '../queues/campaignExpansionWorker.js';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startCampaignScheduler(intervalMs: number = 30000) {
  console.log(`[Scheduler] Campaign scheduler started (polling every ${intervalMs / 1000}s)...`);

  const poll = async () => {
    try {
      const now = new Date().toISOString();

      // Find campaigns scheduled whose time has arrived
      const { data: scheduledCampaigns, error } = await db
        .from('campaigns')
        .select('id, name, scheduled_at')
        .eq('status', 'scheduled')
        .lte('scheduled_at', now);

      if (error) {
        console.error('[Scheduler] Error polling scheduled campaigns:', error.message);
        return;
      }

      if (scheduledCampaigns && scheduledCampaigns.length > 0) {
        console.log(`[Scheduler] Found ${scheduledCampaigns.length} campaigns ready to launch.`);

        for (const camp of scheduledCampaigns) {
          // Atomically transition status to 'running'
          const { error: updateErr } = await db
            .from('campaigns')
            .update({
              status: 'running',
              started_at: new Date().toISOString(),
            })
            .eq('id', camp.id)
            .eq('status', 'scheduled'); // Concurrency guard

          if (!updateErr) {
            console.log(`[Scheduler] Promoting campaign "${camp.name}" (${camp.id}) to running.`);
            // Enqueue expansion job
            await campaignExpansionQueue.add(
              `expand-${camp.id}`,
              { campaignId: camp.id },
              { removeOnComplete: true }
            );
          }
        }
      }
    } catch (err: any) {
      console.error('[Scheduler] Exception during polling:', err.message);
    }
  };

  // Run initial poll immediately
  poll();
  schedulerInterval = setInterval(poll, intervalMs);
}

export function stopCampaignScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Campaign scheduler stopped.');
  }
}
