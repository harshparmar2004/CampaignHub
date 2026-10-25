import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDecryptedSettings } from '@/lib/settings';
import { calculateWhatsAppCost } from '@campaignhub/shared';

export async function POST(request: Request) {
  try {
    const { tags, channels, whatsappCategory } = await request.json();

    const supabase = createAdminClient();
    let query = supabase.from('contacts').select('whatsapp_opt_in, email_opt_in, telegram_chat_id, unsubscribed');

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    const { data: contacts, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const totalContacts = contacts?.length || 0;
    let whatsappEligible = 0;
    let emailEligible = 0;
    let telegramEligible = 0;

    contacts?.forEach((c: any) => {
      if (!c.unsubscribed) {
        if (c.whatsapp_opt_in) whatsappEligible++;
        if (c.email_opt_in) emailEligible++;
        if (c.telegram_chat_id) telegramEligible++;
      }
    });

    const settings = await getDecryptedSettings();
    const rates = {
      marketing: settings.price_whatsapp_marketing_inr,
      utility: settings.price_whatsapp_utility_inr,
      auth: settings.price_whatsapp_auth_inr,
    };

    const waCost = channels.includes('whatsapp')
      ? calculateWhatsAppCost(whatsappEligible, whatsappCategory || 'MARKETING', rates)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalAudience: totalContacts,
        channels: {
          whatsapp: {
            eligible: whatsappEligible,
            skipped: totalContacts - whatsappEligible,
            cost_inr: waCost,
          },
          email: {
            eligible: emailEligible,
            skipped: totalContacts - emailEligible,
          },
          telegram: {
            channelBroadcast: 1, // Sent once to channel
            directMessageEligible: telegramEligible,
            directMessageSkipped: totalContacts - telegramEligible,
          },
        },
        estimatedWhatsAppCostInr: waCost,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Audience preview failed' },
      { status: 400 }
    );
  }
}
