import axios from 'axios';
import { getWorkerSettings } from '../lib/settings.js';
import { db } from '../lib/db.js';
import type { Contact, Campaign } from '@campaignhub/shared';

export async function sendTelegramChannelPost(
  campaign: Campaign
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const settings = await getWorkerSettings();
  const botToken = settings.telegram_bot_token;
  const channelId = settings.telegram_channel_id;

  if (!botToken || !channelId) {
    const err = 'Telegram Bot Token or Channel ID is missing in settings.';
    await db.from('telegram_posts').insert({
      campaign_id: campaign.id,
      text: campaign.telegram_text || '',
      image_url: campaign.telegram_image_url,
      status: 'failed',
      error: err,
    });
    return { success: false, error: err };
  }

  const text = campaign.telegram_text || '';
  const imageUrl = campaign.telegram_image_url;

  try {
    let res;
    if (imageUrl && imageUrl.trim()) {
      res = await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        chat_id: channelId,
        photo: imageUrl,
        caption: text,
        parse_mode: 'HTML',
      });
    } else {
      res = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: channelId,
        text,
        parse_mode: 'HTML',
      });
    }

    const messageId = String(res.data?.result?.message_id || '');

    // Record in telegram_posts table
    await db.from('telegram_posts').insert({
      campaign_id: campaign.id,
      text,
      image_url: imageUrl,
      status: 'posted',
      message_id: messageId,
    });

    return { success: true, messageId };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.description || err.message || 'Telegram Bot API error';

    await db.from('telegram_posts').insert({
      campaign_id: campaign.id,
      text,
      image_url: imageUrl,
      status: 'failed',
      error: errorMsg,
    });

    return { success: false, error: errorMsg };
  }
}

export async function sendTelegramDirectMessage(
  contact: Contact,
  campaign: Campaign
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const settings = await getWorkerSettings();
  const botToken = settings.telegram_bot_token;

  if (!botToken) {
    return { success: false, error: 'Telegram Bot Token missing' };
  }

  if (!contact.telegram_chat_id) {
    return { success: false, error: 'Contact has no telegram_chat_id' };
  }

  try {
    const res = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: contact.telegram_chat_id,
      text: campaign.telegram_text,
      parse_mode: 'HTML',
    });

    const msgId = String(res.data?.result?.message_id || '');
    return { success: true, messageId: msgId };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.description || err.message,
    };
  }
}
