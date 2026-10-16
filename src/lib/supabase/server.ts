import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';
import type { Database } from '@/types/database';

/**
 * Reusable Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Implements the asynchronous Next.js 16 cookies() API to read and write auth cookies.
 * A new client should be instantiated per request.
 */
export async function createClient() {
  const { url, key } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component during render.
          // This can be ignored if session refresh is handled via middleware or actions.
        }
      },
    },
  });
}
