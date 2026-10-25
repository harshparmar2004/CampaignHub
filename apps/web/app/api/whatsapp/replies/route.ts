import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('inbound_messages')
      .select(`
        id,
        body,
        received_at,
        channel,
        contacts (id, name, phone, email)
      `)
      .order('received_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list inbound replies' },
      { status: 500 }
    );
  }
}
