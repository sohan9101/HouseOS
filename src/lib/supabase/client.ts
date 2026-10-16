import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';
import type { Database } from '@/types/database';

/**
 * Reusable Supabase client for browser (Client Components).
 *
 * Utilizes @supabase/ssr createBrowserClient to persist authentication state
 * via cookies, allowing server-rendered components to inspect the active session.
 */
export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient<Database>(url, key);
}
