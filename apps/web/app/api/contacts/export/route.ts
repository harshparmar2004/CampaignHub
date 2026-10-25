import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    const supabase = createAdminClient();
    let query = supabase.from('contacts').select('*').order('created_at', { ascending: false });

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Phone (E.164)',
      'Email',
      'Tags',
      'WhatsApp Opt-In',
      'Email Opt-In',
      'Telegram Chat ID',
      'Unsubscribed',
      'Consent Source',
      'Consent Date',
      'Created Date',
    ];

    const rows = (data || []).map((c: any) => [
      `"${c.id}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${(c.tags || []).join(', ')}"`,
      c.whatsapp_opt_in ? 'Yes' : 'No',
      c.email_opt_in ? 'Yes' : 'No',
      `"${c.telegram_chat_id || ''}"`,
      c.unsubscribed ? 'Yes' : 'No',
      `"${c.consent_source || ''}"`,
      `"${c.consent_at || ''}"`,
      `"${c.created_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="campaignhub-contacts-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Export failed' },
      { status: 500 }
    );
  }
}
