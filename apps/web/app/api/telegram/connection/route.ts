import { NextResponse } from 'next/server';
import { getDecryptedSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getDecryptedSettings();
    const botToken = settings.telegram_bot_token;
    const channelId = settings.telegram_channel_id;

    if (!botToken) {
      return NextResponse.json({
        success: false,
        error: 'Telegram Bot Token not configured in Settings.',
      });
    }

    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meRes.json();

    if (!meRes.ok || !meData.ok) {
      return NextResponse.json(
        { success: false, error: meData.description || 'Invalid Telegram Bot Token' },
        { status: 400 }
      );
    }

    let channelTitle = channelId || 'Not configured';
    let subscriberCount = 0;

    if (channelId) {
      const chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${channelId}`);
      const chatData = await chatRes.json();
      if (chatData.ok) {
        channelTitle = chatData.result.title || chatData.result.username || channelId;
      }

      const countRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=${channelId}`);
      const countData = await countRes.json();
      if (countData.ok) {
        subscriberCount = countData.result;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        bot_username: `@${meData.result.username}`,
        bot_name: meData.result.first_name,
        channel_name: channelTitle,
        subscribers_count: subscriberCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Telegram connection check failed' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const settings = await getDecryptedSettings();
    const botToken = settings.telegram_bot_token;
    const channelId = settings.telegram_channel_id;

    if (!botToken || !channelId) {
      return NextResponse.json(
        { success: false, error: 'Telegram Bot Token or Channel ID is missing in Settings.' },
        { status: 400 }
      );
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: '🔔 <b>CampaignHub Diagnostic Test</b>\n\nYour Telegram Bot connection is healthy and authorized to post to this channel.',
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { success: false, error: data.description || 'Telegram test message delivery failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test message delivered to Telegram channel successfully!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Test message failed' },
      { status: 500 }
    );
  }
}
