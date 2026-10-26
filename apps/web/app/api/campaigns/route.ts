import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateCampaignSchema } from '@campaignhub/shared';
import { executeCampaignPipeline } from '@/lib/pipeline/dispatchEngine';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Attach message counts to each campaign
    const enriched = await Promise.all(
      (campaigns || []).map(async (camp: any) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('status')
          .eq('campaign_id', camp.id);

        let sent = 0;
        let delivered = 0;
        let failed = 0;
        let queued = 0;
        let totalCostInr = 0;

        messages?.forEach((m: any) => {
          if (m.status === 'sent') sent++;
          if (m.status === 'delivered' || m.status === 'read') delivered++;
          if (m.status === 'failed') failed++;
          if (m.status === 'queued') queued++;
          if (m.cost_inr) totalCostInr += Number(m.cost_inr) || 0;
        });

        const total = messages?.length || 0;
        const progressPercent = total > 0 ? Math.round(((delivered + sent + failed) / total) * 100) : 0;

        return {
          ...camp,
          recipientsCount: total,
          progressPercent,
          totalCostInr: Number(totalCostInr.toFixed(2)),
          stats: {
            queued,
            sent,
            delivered,
            failed,
          },
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || 'launch'; // 'launch' | 'draft'
    const validated = CreateCampaignSchema.parse(body);

    const isScheduled = Boolean(validated.scheduled_at && new Date(validated.scheduled_at) > new Date());
    let initialStatus = 'running';

    if (action === 'draft') {
      initialStatus = 'draft';
    } else if (isScheduled) {
      initialStatus = 'scheduled';
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: validated.name,
        status: initialStatus,
        channels: validated.channels,
        audience_tags: validated.audience_tags || [],
        audience_tier: validated.audience_tier || 'all',
        whatsapp_template_id: validated.whatsapp_template_id || null,
        whatsapp_variable_map: validated.whatsapp_variable_map || {},
        whatsapp_image_url: validated.whatsapp_image_url || null,
        whatsapp_message_text: validated.whatsapp_message_text || null,
        whatsapp_link_url: validated.whatsapp_link_url || null,
        whatsapp_link_title: validated.whatsapp_link_title || null,
        email_subject: validated.email_subject || null,
        email_html: validated.email_html || null,
        email_link_url: validated.email_link_url || null,
        telegram_text: validated.telegram_text || null,
        telegram_image_url: validated.telegram_image_url || null,
        telegram_link_url: validated.telegram_link_url || null,
        instagram_image_url: validated.instagram_image_url || null,
        instagram_caption: validated.instagram_caption || null,
        instagram_link_url: validated.instagram_link_url || null,
        instagram_link_title: validated.instagram_link_title || null,
        instagram_additional_links: validated.instagram_additional_links || [],
        scheduled_at: validated.scheduled_at || null,
        started_at: initialStatus === 'running' ? now : null,
        created_at: now,
      })
      .select()
      .single();

    if (error || !campaign) {
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to create campaign' },
        { status: 400 }
      );
    }

    // If status is running, trigger real-time multi-channel dispatch pipeline immediately
    if (initialStatus === 'running') {
      console.log(`[CampaignsAPI] Launching real-time execution for campaign ${campaign.id}...`);
      executeCampaignPipeline(campaign.id).catch((err) => {
        console.error(`[CampaignsAPI] Pipeline execution error for ${campaign.id}:`, err);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Campaign created successfully with status "${initialStatus}". Dispatched in real-time.`,
      data: campaign,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Validation error' },
      { status: 400 }
    );
  }
}
