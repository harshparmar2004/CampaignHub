import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createAdminClient();

    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (campErr || !campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch messages for this campaign
    const { data: messages, error: msgErr } = await supabase
      .from('messages')
      .select(`
        id,
        channel,
        status,
        provider_message_id,
        error,
        cost_inr,
        queued_at,
        sent_at,
        delivered_at,
        read_at,
        contacts (id, name, phone, email)
      `)
      .eq('campaign_id', id)
      .order('queued_at', { ascending: false });

    // Break down counts per channel
    const channelStats: Record<string, { queued: number; sent: number; delivered: number; read: number; failed: number; skipped: number; total: number }> = {};

    for (const ch of campaign.channels || []) {
      channelStats[ch] = { queued: 0, sent: 0, delivered: 0, read: 0, failed: 0, skipped: 0, total: 0 };
    }

    let totalQueued = 0;
    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    let totalCostInr = 0;

    messages?.forEach((m: any) => {
      const ch = m.channel;
      if (m.cost_inr) totalCostInr += Number(m.cost_inr) || 0;
      if (!channelStats[ch]) {
        channelStats[ch] = { queued: 0, sent: 0, delivered: 0, read: 0, failed: 0, skipped: 0, total: 0 };
      }
      channelStats[ch].total++;

      if (m.status === 'queued') { channelStats[ch].queued++; totalQueued++; }
      if (m.status === 'sent') { channelStats[ch].sent++; totalSent++; }
      if (m.status === 'delivered') { channelStats[ch].delivered++; totalDelivered++; }
      if (m.status === 'read') { channelStats[ch].read++; totalDelivered++; }
      if (m.status === 'failed') { channelStats[ch].failed++; totalFailed++; }
      if (m.status === 'skipped') { channelStats[ch].skipped++; totalSkipped++; }
    });

    const totalRecipients = messages?.length || 0;
    const completedCount = totalSent + totalDelivered + totalFailed;
    const progressPercent = totalRecipients > 0 ? Math.round((completedCount / totalRecipients) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        totalRecipients,
        completedCount,
        progressPercent,
        totalCostInr: Number(totalCostInr.toFixed(2)),
        overallStats: {
          queued: totalQueued,
          sent: totalSent,
          delivered: totalDelivered,
          failed: totalFailed,
          skipped: totalSkipped,
        },
        channelStats,
        messages: messages || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}
