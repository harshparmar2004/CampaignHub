import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDecryptedSettings } from '@/lib/settings';

export async function POST() {
  try {
    const settings = await getDecryptedSettings();
    const token = settings.meta_access_token;
    const wabaId = settings.meta_waba_id;

    if (!token || !wabaId) {
      return NextResponse.json(
        { success: false, error: 'Meta Access Token or WABA ID not configured in Settings.' },
        { status: 400 }
      );
    }

    const res = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error?.message || 'Meta API sync error' },
        { status: 400 }
      );
    }

    const templates = data.data || [];
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    let syncedCount = 0;

    for (const tpl of templates) {
      // Find body component
      const bodyComp = (tpl.components || []).find((c: any) => c.type === 'BODY');
      const bodyText = bodyComp?.text || '';

      await supabase.from('whatsapp_templates').upsert(
        {
          meta_template_id: tpl.id,
          name: tpl.name,
          category: tpl.category || 'MARKETING',
          language: tpl.language || 'en_US',
          body: bodyText,
          status: tpl.status || 'PENDING',
          rejection_reason: tpl.rejected_reason || null,
          synced_at: now,
        },
        { onConflict: 'meta_template_id' }
      );
      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${syncedCount} templates from Meta.`,
      count: syncedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Template synchronization failed' },
      { status: 500 }
    );
  }
}
