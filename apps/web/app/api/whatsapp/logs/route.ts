import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    // 1. WhatsApp Aggregate Metrics
    const { data: statsData } = await supabase
      .from('messages')
      .select('status, cost_inr')
      .eq('channel', 'whatsapp');

    let sent = 0;
    let delivered = 0;
    let read = 0;
    let failed = 0;
    let totalCostInr = 0;

    statsData?.forEach((m: any) => {
      if (m.status === 'sent') sent++;
      if (m.status === 'delivered') delivered++;
      if (m.status === 'read') read++;
      if (m.status === 'failed') failed++;
      totalCostInr += parseFloat(m.cost_inr || '0');
    });

    const { count: replyCount } = await supabase
      .from('inbound_messages')
      .select('id', { count: 'exact', head: true })
      .eq('channel', 'whatsapp');

    // 2. Paginated Message Log
    let query = supabase
      .from('messages')
      .select(`
        id,
        status,
        provider_message_id,
        error,
        cost_inr,
        queued_at,
        sent_at,
        delivered_at,
        read_at,
        contacts (id, name, phone, email),
        campaigns (id, name, whatsapp_template_id)
      `, { count: 'exact' })
      .eq('channel', 'whatsapp')
      .order('queued_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: messages, count: totalCount, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        sent,
        delivered,
        read,
        failed,
        replies: replyCount || 0,
        cost_inr: Number(totalCostInr.toFixed(2)),
      },
      data: messages || [],
      total: totalCount || 0,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch WhatsApp logs' },
      { status: 500 }
    );
  }
}
