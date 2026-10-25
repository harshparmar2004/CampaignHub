import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const supabase = createAdminClient();

    const now = new Date();
    let days = 30;
    if (range === '7d') days = 7;
    if (range === 'month') days = now.getDate();

    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const { data: messages, error } = await supabase
      .from('messages')
      .select('channel, status, sent_at, queued_at')
      .gte('queued_at', startDate.toISOString())
      .in('status', ['sent', 'delivered', 'read']);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Build timeline buckets
    const timeline: Record<
      string,
      { date: string; whatsapp: number; email: number; telegram: number; instagram: number }
    > = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timeline[key] = { date: displayDate, whatsapp: 0, email: 0, telegram: 0, instagram: 0 };
    }

    messages?.forEach((m: any) => {
      const timestamp = m.sent_at || m.queued_at;
      if (!timestamp) return;
      const key = timestamp.split('T')[0];
      if (timeline[key]) {
        if (m.channel === 'whatsapp') timeline[key].whatsapp++;
        if (m.channel === 'email') timeline[key].email++;
        if (m.channel === 'telegram') timeline[key].telegram++;
        if (m.channel === 'instagram') timeline[key].instagram++;
      }
    });

    const chartData = Object.values(timeline);

    return NextResponse.json({ success: true, data: chartData });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Chart data error' },
      { status: 500 }
    );
  }
}
