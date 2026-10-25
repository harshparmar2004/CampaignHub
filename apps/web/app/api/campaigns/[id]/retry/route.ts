import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createAdminClient();

    // 1. Reset all messages for this campaign with status = 'failed' back to 'queued'
    const { data: updated, error } = await supabase
      .from('messages')
      .update({
        status: 'queued',
        error: null,
        queued_at: new Date().toISOString(),
      })
      .eq('campaign_id', id)
      .eq('status', 'failed')
      .select('id');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    const retriedCount = updated?.length || 0;

    // 2. Set campaign back to running if it was marked failed or completed
    await supabase
      .from('campaigns')
      .update({ status: 'running' })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: `Successfully requeued ${retriedCount} failed messages for retry.`,
      count: retriedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Retry failed' },
      { status: 500 }
    );
  }
}
