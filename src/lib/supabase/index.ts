/**
 * HouseOS Supabase Integration
 *
 * Usage:
 * - In Client Components ('use client'):
 *     import { createClient } from '@/lib/supabase/client';
 * - In Server Components, Server Actions, or Route Handlers:
 *     import { createClient } from '@/lib/supabase/server';
 * - Configuration helpers:
 *     import { isSupabaseConfigured, getSupabaseConfig } from '@/lib/supabase';
 */

export { isSupabaseConfigured, getSupabaseConfig } from './config';
export type { SupabaseConfig } from './config';
