import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDecryptedSettings } from '@/lib/settings';
import { WhatsAppTemplateCreateSchema } from '@campaignhub/shared';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list WhatsApp templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = WhatsAppTemplateCreateSchema.parse(body);

    const settings = await getDecryptedSettings();
    const token = settings.meta_access_token;
    const wabaId = settings.meta_waba_id;

    if (!token || !wabaId) {
      return NextResponse.json(
        { success: false, error: 'Meta Access Token or WABA ID not configured in Settings.' },
        { status: 400 }
      );
    }

    // Build Meta message_templates components payload
    const components: any[] = [];

    if (validated.header) {
      components.push({
        type: 'HEADER',
        format: 'TEXT',
        text: validated.header,
      });
    }

    components.push({
      type: 'BODY',
      text: validated.body,
    });

    if (validated.footer) {
      components.push({
        type: 'FOOTER',
        text: validated.footer,
      });
    }

    if (validated.buttons && validated.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: validated.buttons.map((b) => {
          if (b.type === 'URL') {
            return { type: 'URL', text: b.text, url: b.url };
          }
          return { type: 'QUICK_REPLY', text: b.text };
        }),
      });
    }

    const metaPayload = {
      name: validated.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category: validated.category,
      language: validated.language || 'en_US',
      components,
    };

    const res = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metaPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || 'Meta template submission failed',
          metaError: data.error,
        },
        { status: 400 }
      );
    }

    const metaTemplateId = data.id || `tpl_${Date.now()}`;
    const status = data.status || 'PENDING';

    const supabase = createAdminClient();
    const { data: inserted, error: dbErr } = await supabase
      .from('whatsapp_templates')
      .insert({
        name: validated.name,
        category: validated.category,
        language: validated.language || 'en_US',
        body: validated.body,
        status,
        meta_template_id: metaTemplateId,
        synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbErr) {
      console.warn('Template created in Meta but DB sync threw error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Template submitted to Meta successfully for approval.',
      data: inserted || { name: validated.name, status, meta_template_id: metaTemplateId },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit template' },
      { status: 400 }
    );
  }
}
