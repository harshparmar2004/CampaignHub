import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailTemplateCreateSchema } from '@campaignhub/shared';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const normalized = (data || []).map((row: any) => ({
      ...row,
      html: row.html || row.body_html || '',
      body_html: row.body_html || row.html || '',
    }));

    return NextResponse.json({ success: true, data: normalized });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list email templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = EmailTemplateCreateSchema.parse(body);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: validated.name,
        subject: validated.subject,
        html: validated.html,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Validation error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing template ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('email_templates').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}
