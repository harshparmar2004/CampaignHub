import { Resend } from 'resend';
import { getWorkerSettings } from '../lib/settings.js';
import {
  interpolateEmail,
  generateUnsubscribeToken,
  type Contact,
  type Campaign,
} from '@campaignhub/shared';

const APP_SECRET = process.env.APP_SECRET || 'fallback-app-secret-32-characters-min';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendCampaignEmail(
  contact: Contact,
  campaign: Campaign
): Promise<{ success: boolean; providerId?: string; error?: string }> {
  const settings = await getWorkerSettings();
  const apiKey = settings.resend_api_key;

  if (!apiKey) {
    return { success: false, error: 'Resend API key is not configured in settings.' };
  }

  const fromName = settings.resend_from_name || 'CampaignHub';
  const fromEmail = settings.resend_from_email || 'onboarding@resend.dev';
  const from = `${fromName} <${fromEmail}>`;

  const resend = new Resend(apiKey);

  // 1. Generate signed unsubscribe URL
  const token = generateUnsubscribeToken(contact.id, APP_SECRET);
  const unsubUrl = `${APP_URL}/api/unsubscribe/${token}`;

  // 2. Personalize subject and body
  const subject = interpolateEmail(campaign.email_subject || 'Update from CampaignHub', contact);
  let html = interpolateEmail(campaign.email_html || '', contact);

  // Replace {{unsubscribe_url}} placeholder if present, or append standard footer
  if (html.includes('{{unsubscribe_url}}')) {
    html = html.replace(/\{\{unsubscribe_url\}\}/g, unsubUrl);
  } else {
    html += `
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #DCE5DD; font-size: 12px; color: #52645A; font-family: sans-serif;">
        <p>You received this message because you opted in to notifications. <a href="${unsubUrl}" style="color: #1E6B4F; text-decoration: underline;">Unsubscribe from all future emails</a>.</p>
      </div>
    `;
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [contact.email],
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to send email via Resend' };
    }

    return { success: true, providerId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Resend API exception' };
  }
}
