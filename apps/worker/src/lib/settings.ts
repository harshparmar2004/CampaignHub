import { db } from './db.js';
import { decryptSecret, type SettingsMap } from '@campaignhub/shared';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

let cachedSettings: SettingsMap | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds cache

export async function getWorkerSettings(forceRefresh = false): Promise<SettingsMap> {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  const { data, error } = await db.from('settings').select('key, encrypted_value');
  if (error || !data) {
    console.error('[Worker Settings] Error fetching settings:', error);
    return cachedSettings || {};
  }

  const result: Record<string, any> = {};
  for (const row of data) {
    try {
      const decrypted = decryptSecret(row.encrypted_value, ENCRYPTION_KEY);
      if (row.key.startsWith('rate_limit_') || row.key.startsWith('price_')) {
        result[row.key] = parseFloat(decrypted);
      } else {
        result[row.key] = decrypted;
      }
    } catch (err: any) {
      console.error(`[Worker Settings] Could not decrypt ${row.key}:`, err.message);
    }
  }

  cachedSettings = result as SettingsMap;
  lastFetchTime = now;
  return cachedSettings;
}
