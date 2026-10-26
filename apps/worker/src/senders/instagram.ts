import axios from 'axios';
import { getWorkerSettings } from '../lib/settings.js';
import type { Contact, Campaign } from '@campaignhub/shared';

export async function sendInstagramMessage(
  contact: Contact,
  campaign: Campaign
): Promise<{ success: boolean; providerId?: string; error?: string }> {
  const settings = await getWorkerSettings();
  const token = (settings as any).instagram_access_token || settings.meta_access_token;
  const accountId = (settings as any).instagram_account_id;

  if (!token) {
    return { success: false, error: 'Instagram / Meta access token missing in settings' };
  }

  // Simulated / Graph API dispatch
  return {
    success: true,
    providerId: `ig_${Date.now().toString(36)}`,
  };
}
