import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateWhatsAppCost } from '@campaignhub/shared';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const tierParam = searchParams.get('tier');

    const supabase = createAdminClient();

    let query = supabase.from('contacts').select('*');

    if (tags.length > 0) {
      query = query.contains('tags', tags);
    }

    if (tierParam && tierParam !== 'all') {
      query = query.eq('tier', tierParam);
    }

    const { data: contacts, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const allContacts = contacts || [];
    const totalAudience = allContacts.length;

    // WhatsApp eligible: has phone number and not opted out
    const waEligible = allContacts.filter(
      (c: any) => c.phone && c.whatsapp_opt_in !== false && !c.unsubscribed
    ).length;

    // Email eligible: has email and not unsubscribed
    const emailEligible = allContacts.filter(
      (c: any) => c.email && c.email_opt_in !== false && !c.unsubscribed
    ).length;

    // Telegram eligible: has telegram handle/id
    const tgEligible = allContacts.filter(
      (c: any) => c.telegram_chat_id || c.telegram_handle
    ).length;

    const estimatedWhatsAppCostInr = calculateWhatsAppCost(waEligible, 'MARKETING');

    return NextResponse.json({
      success: true,
      data: {
        totalAudience,
        channels: {
          whatsapp: {
            eligible: waEligible,
            skipped: totalAudience - waEligible,
          },
          email: {
            eligible: emailEligible,
            skipped: totalAudience - emailEligible,
          },
          telegram: {
            channelBroadcast: 1,
            directMessageEligible: tgEligible,
          },
        },
        estimatedWhatsAppCostInr,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
