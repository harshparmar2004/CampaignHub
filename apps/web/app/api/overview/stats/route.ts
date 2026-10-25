import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const supabase = createAdminClient();

    // Date range filter
    const now = new Date();
    let startDate = new Date();

    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // 30d default
      startDate.setDate(now.getDate() - 30);
    }
    const isoStart = startDate.toISOString();

    // 1. Total Contacts
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true });

    // 2. Campaigns Run
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, status, created_at')
      .gte('created_at', isoStart);

    const campaignsRun = (campaigns as any[])?.filter((c: any) => c.status !== 'draft').length || 0;

    // 3. Messages sent, delivered, failed, WhatsApp INR cost
    const { data: messages } = await supabase
      .from('messages')
      .select('status, channel, cost_inr, queued_at')
      .gte('queued_at', isoStart);

    let sent = 0;
    let delivered = 0;
    let failed = 0;
    let spendInr = 0;

    messages?.forEach((m: any) => {
      if (m.status === 'sent') sent++;
      if (m.status === 'delivered' || m.status === 'read') delivered++;
      if (m.status === 'failed') failed++;
      if (m.channel === 'whatsapp' && (m.status === 'sent' || m.status === 'delivered' || m.status === 'read')) {
        spendInr += parseFloat(m.cost_inr || '0');
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        campaignsRun,
        totalMessagesSent: sent + delivered,
        delivered,
        failed,
        totalContacts: totalContacts || 0,
        estimatedSpendInr: Number(spendInr.toFixed(2)),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Stats error' },
      { status: 500 }
    );
  }
}
