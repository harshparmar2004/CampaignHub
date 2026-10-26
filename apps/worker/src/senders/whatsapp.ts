import axios, { AxiosError } from 'axios';
import { getWorkerSettings } from '../lib/settings.js';
import {
  interpolateWhatsApp,
  extractWhatsAppVariables,
  type Contact,
  type Campaign,
} from '@campaignhub/shared';

export interface WhatsAppSendResult {
  success: boolean;
  providerId?: string;
  error?: string;
  isTransient?: boolean;
}

export async function sendWhatsAppMessage(
  contact: Contact,
  campaign: Campaign
): Promise<WhatsAppSendResult> {
  const settings = await getWorkerSettings();
  const token = settings.meta_access_token;
  const phoneId = settings.meta_phone_number_id;

  if (!token || !phoneId) {
    return {
      success: false,
      error: 'WhatsApp credentials (access token or phone number ID) missing in settings.',
      isTransient: false,
    };
  }

  if (!campaign.whatsapp_template_id) {
    return {
      success: false,
      error: 'No WhatsApp template specified for campaign.',
      isTransient: false,
    };
  }

  const recipientPhone = contact.phone.replace(/\D/g, '');

  let payload: any;
  const isTemplateMode =
    campaign.whatsapp_template_id &&
    campaign.whatsapp_template_id !== 'custom_message' &&
    campaign.whatsapp_template_id !== 'custom';

  if (isTemplateMode) {
    // Build template parameters from variable map
    const variableMap = campaign.whatsapp_variable_map || {};
    const parameters: { type: 'text'; text: string }[] = [];

    const sortedKeys = Object.keys(variableMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    for (const key of sortedKeys) {
      const mappedField = variableMap[key];
      let val = '';
      if (mappedField.startsWith('fixed:')) {
        val = mappedField.substring(6);
      } else {
        val = String((contact as any)[mappedField] || '');
      }
      parameters.push({ type: 'text', text: val || ' ' });
    }

    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'template',
      template: {
        name: campaign.whatsapp_template_id,
        language: { code: 'en_US' },
      },
    };

    if (parameters.length > 0) {
      payload.template.components = [
        {
          type: 'body',
          parameters,
        },
      ];
    }
  } else if ((campaign as any).whatsapp_image_url && (campaign as any).whatsapp_image_url.trim()) {
    const rawText = (campaign as any).whatsapp_message_text || '';
    const text = rawText
      .replace(/\{\{name\}\}/gi, contact.name || 'Valued Guest')
      .replace(/\{\{first_name\}\}/gi, (contact.name || 'Valued Guest').split(' ')[0]);

    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'image',
      image: {
        link: (campaign as any).whatsapp_image_url.trim(),
        caption: text,
      },
    };
  } else {
    const rawText = (campaign as any).whatsapp_message_text || 'Announcement from CampaignHub';
    const text = rawText
      .replace(/\{\{name\}\}/gi, contact.name || 'Valued Guest')
      .replace(/\{\{first_name\}\}/gi, (contact.name || 'Valued Guest').split(' ')[0]);

    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: {
        preview_url: Boolean((campaign as any).whatsapp_link_url),
        body: text,
      },
    };
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    const providerId = data.messages?.[0]?.id;

    return {
      success: true,
      providerId: providerId || 'wamid_placeholder',
    };
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<any>;
      const metaError = axiosErr.response?.data?.error;
      const errorCode = metaError?.code;
      const errorMsg = metaError?.message || axiosErr.message;

      // Classify error: permanent vs transient
      // 130429 = Rate limit hit (transient)
      // 131056 = Too many requests (transient)
      // 500/503 = Server error (transient)
      const isTransient = Boolean(
        errorCode === 130429 ||
        errorCode === 131056 ||
        (axiosErr.response?.status && axiosErr.response.status >= 500)
      );

      return {
        success: false,
        error: `Meta API Error [${errorCode || axiosErr.response?.status}]: ${errorMsg}`,
        isTransient,
      };
    }

    return {
      success: false,
      error: err.message || 'Unknown network error communicating with Meta Cloud API',
      isTransient: true,
    };
  }
}
