import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventType = payload.type;
    const eventData = payload.data;

    if (!eventType || !eventData) {
      return NextResponse.json({ success: false, error: 'Malformed payload' }, { status: 400 });
    }

    const emailId = eventData.email_id;
    const recipientEmail = Array.isArray(eventData.to) ? eventData.to[0] : eventData.to;

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    if (emailId) {
      if (eventType === 'email.delivered') {
        await supabase
          .from('messages')
          .update({
            status: 'delivered',
            delivered_at: now,
          })
          .eq('provider_message_id', emailId);
      } else if (eventType === 'email.opened') {
        await supabase
          .from('messages')
          .update({
            read_at: now,
          })
          .eq('provider_message_id', emailId);
      } else if (eventType === 'email.bounced') {
        await supabase
          .from('messages')
          .update({
            status: 'failed',
            error: 'Bounced by recipient mail server',
          })
          .eq('provider_message_id', emailId);

        // Mark contact email_opt_in = false
        if (recipientEmail) {
          await supabase
            .from('contacts')
            .update({ email_opt_in: false })
            .eq('email', recipientEmail.toLowerCase());
        }
      } else if (eventType === 'email.complained') {
        await supabase
          .from('messages')
          .update({
            status: 'failed',
            error: 'Marked as Spam Complaint',
          })
          .eq('provider_message_id', emailId);

        // Revoke email opt-in and flag as unsubscribed
        if (recipientEmail) {
          await supabase
            .from('contacts')
            .update({
              email_opt_in: false,
              unsubscribed: true,
            })
            .eq('email', recipientEmail.toLowerCase());
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('[Resend Webhook Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
