import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDecryptedSettings } from '@/lib/settings';
import { TelegramComposePostSchema } from '@campaignhub/shared';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch posts history
    const { data: posts, error } = await supabase
      .from('telegram_posts')
      .select(`
        id,
        text,
        image_url,
        status,
        message_id,
        error,
        posted_at,
        campaigns (id, name)
      `)
      .order('posted_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    let sent = 0;
    let failed = 0;
    let lastPostTime: string | null = null;

    posts?.forEach((p: any) => {
      if (p.status === 'posted') {
        sent++;
        if (!lastPostTime) lastPostTime = p.posted_at;
      }
      if (p.status === 'failed') failed++;
    });

    return NextResponse.json({
      success: true,
      stats: {
        sent,
        failed,
        lastPostTime,
      },
      data: posts || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list Telegram posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = TelegramComposePostSchema.parse(body);

    const settings = await getDecryptedSettings();
    const botToken = settings.telegram_bot_token;
    const channelId = settings.telegram_channel_id;

    if (!botToken || !channelId) {
      return NextResponse.json(
        { success: false, error: 'Telegram Bot Token or Channel ID is missing in Settings.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let tgRes;
    if (validated.image_url && validated.image_url.trim()) {
      tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          photo: validated.image_url,
          caption: validated.text,
          parse_mode: 'HTML',
        }),
      });
    } else {
      tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text: validated.text,
          parse_mode: 'HTML',
        }),
      });
    }

    const tgData = await tgRes.json();
    if (!tgRes.ok || !tgData.ok) {
      const errMsg = tgData.description || 'Telegram Bot API error';

      await supabase.from('telegram_posts').insert({
        text: validated.text,
        image_url: validated.image_url || null,
        status: 'failed',
        error: errMsg,
      });

      return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
    }

    const messageId = String(tgData.result?.message_id || '');
    const { data: record, error: dbErr } = await supabase
      .from('telegram_posts')
      .insert({
        text: validated.text,
        image_url: validated.image_url || null,
        status: 'posted',
        message_id: messageId,
        posted_at: new Date().toISOString(),
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      message: 'Successfully broadcast post to Telegram channel!',
      data: record,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Telegram post failed' },
      { status: 400 }
    );
  }
}
