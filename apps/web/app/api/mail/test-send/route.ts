import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDecryptedSettings } from '@/lib/settings';
import { TestSendEmailSchema } from '@campaignhub/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = TestSendEmailSchema.parse(body);

    const settings = await getDecryptedSettings();
    const apiKey = settings.resend_api_key;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Resend API key not configured in Settings.' },
        { status: 400 }
      );
    }

    const fromName = settings.resend_from_name || 'CampaignHub Test';
    const fromEmail = settings.resend_from_email || 'onboarding@resend.dev';
    const from = `${fromName} <${fromEmail}>`;

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [validated.to],
      subject: `[TEST] ${validated.subject}`,
      html: validated.html,
    });

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to dispatch test email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully dispatched to ${validated.to}`,
      providerId: data.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Test send failed' },
      { status: 400 }
    );
  }
}
