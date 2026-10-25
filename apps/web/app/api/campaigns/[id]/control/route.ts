import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { action } = await request.json(); // 'pause' | 'resume' | 'cancel'

    if (!['pause', 'resume', 'cancel'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid control action' }, { status: 400 });
    }

    const supabase = createAdminClient();

    let targetStatus = 'running';
    if (action === 'pause') targetStatus = 'paused';
    if (action === 'resume') targetStatus = 'running';
    if (action === 'cancel') targetStatus = 'cancelled';

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        status: targetStatus,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Campaign status updated to "${targetStatus}". Takes effect within seconds.`,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Control command failed' },
      { status: 500 }
    );
  }
}
