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

    // 1. Fetch aggregate metrics for email channel
    const { data: statsData } = await supabase
      .from('messages')
      .select('status, read_at')
      .eq('channel', 'email');

    let sent = 0;
    let delivered = 0;
    let opened = 0;
    let failed = 0;

    statsData?.forEach((m: any) => {
      if (m.status === 'sent') sent++;
      if (m.status === 'delivered') delivered++;
      if (m.read_at) opened++;
      if (m.status === 'failed') failed++;
    });

    const { count: unsubCount } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('email_opt_in', false);

    // 2. Fetch paginated message records
    let query = supabase
      .from('messages')
      .select(`
        id,
        status,
        provider_message_id,
        error,
        queued_at,
        sent_at,
        delivered_at,
        read_at,
        contacts (id, name, email, phone),
        campaigns (id, name, email_subject)
      `, { count: 'exact' })
      .eq('channel', 'email')
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
        opened,
        clicked: 0, // Recorded via webhook click events
        bounced: failed,
        unsubscribed: unsubCount || 0,
      },
      data: messages || [],
      total: totalCount || 0,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}
