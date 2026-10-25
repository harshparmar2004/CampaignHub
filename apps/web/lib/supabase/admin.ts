import { createClient } from '@supabase/supabase-js';
import { createFallbackClient } from './fallbackStore';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // If Supabase URL is unconfigured, dummy or placeholder, use local persistent fallback store
  const isPlaceholder =
    !supabaseUrl ||
    supabaseUrl.includes('your-project') ||
    supabaseUrl.includes('placeholder') ||
    !supabaseUrl.startsWith('http');

  if (isPlaceholder) {
    return createFallbackClient();
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

