import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDecryptedSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const settings = await getDecryptedSettings();

    // 1. Failed messages count
    const { count: failedCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed');

    // 2. Pending or Rejected WhatsApp templates
    const { data: rejectedTemplates } = await supabase
      .from('whatsapp_templates')
      .select('name, status, rejection_reason')
      .in('status', ['REJECTED', 'PAUSED']);

    const { count: pendingTemplateCount } = await supabase
      .from('whatsapp_templates')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    // 3. System Alerts (including >20% campaign failure threshold)
    const { data: systemAlerts } = await supabase
      .from('system_alerts')
      .select('*')
      .is('resolved_at', null)
      .order('created_at', { ascending: false });

    // 4. Checklist & Provider Readiness
    const hasWhatsApp = Boolean(settings.meta_access_token && settings.meta_phone_number_id);
    const hasEmail = Boolean(settings.resend_api_key && settings.resend_from_email);
    const hasTelegram = Boolean(settings.telegram_bot_token && settings.telegram_channel_id);

    return NextResponse.json({
      success: true,
      data: {
        failedMessagesCount: failedCount || 0,
        rejectedTemplates: rejectedTemplates || [],
        pendingTemplatesCount: pendingTemplateCount || 0,
        systemAlerts: systemAlerts || [],
        checklist: {
          whatsappConfigured: hasWhatsApp,
          emailConfigured: hasEmail,
          telegramConfigured: hasTelegram,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Needs attention check failed' },
      { status: 500 }
    );
  }
}
