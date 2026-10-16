/**
 * HouseOS Supabase Configuration Validation
 *
 * Reads and validates Supabase credentials from environment variables
 * without exposing secret or key values in log output or error messages.
 * Automatically aligns local development with the local Supabase Docker instance
 * (http://127.0.0.1:54321) where local database migrations are applied.
 */

export interface SupabaseConfig {
  url: string;
  key: string;
}

/**
 * Canonical local Supabase Docker instance credentials.
 * Standard anonymous publishable key for local development.
 */
export const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
export const LOCAL_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

/**
 * Checks whether both the Supabase URL and Publishable Key are present or local defaults are active.
 * Does not throw.
 */
export function isSupabaseConfigured(): boolean {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const envKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  const isExplicitRemote = process.env.USE_REMOTE_SUPABASE === 'true';
  const isVercelOrProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const isHostedUrl = Boolean(
    envUrl &&
      !envUrl.includes('127.0.0.1') &&
      !envUrl.includes('localhost') &&
      envUrl.includes('supabase.co')
  );

  if (isExplicitRemote || isVercelOrProduction || isHostedUrl) {
    return Boolean(envUrl && envKey);
  }
  return true;
}

/**
 * Returns the active Supabase target mode: 'remote' or 'local'.
 */
export function getSupabaseMode(): 'remote' | 'local' {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const isExplicitRemote = process.env.USE_REMOTE_SUPABASE === 'true';
  const isVercelOrProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const isHostedUrl = Boolean(
    envUrl &&
      !envUrl.includes('127.0.0.1') &&
      !envUrl.includes('localhost') &&
      envUrl.includes('supabase.co')
  );
  return isExplicitRemote || isVercelOrProduction || isHostedUrl ? 'remote' : 'local';
}

/**
 * Returns validated Supabase configuration credentials.
 *
 * Selection Rules:
 * 1. When USE_REMOTE_SUPABASE === 'true', in production/Vercel, or when pointing to hosted Supabase,
 *    strictly connects to the configured hosted Supabase project.
 *    Validates that NEXT_PUBLIC_SUPABASE_URL and publishable key are present and well-formed.
 *    Fails with explicit errors if configuration is missing or invalid.
 * 2. When running locally without remote configuration, falls back safely to local development (127.0.0.1:54321).
 *    Guarantees local acceptance tests and Docker-backed development run without remote database dependencies.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const envKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  const isExplicitRemote = process.env.USE_REMOTE_SUPABASE === 'true';
  const isVercelOrProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const isHostedUrl = Boolean(
    envUrl &&
      !envUrl.includes('127.0.0.1') &&
      !envUrl.includes('localhost') &&
      envUrl.includes('supabase.co')
  );
  const isRemoteRequested = isExplicitRemote || isVercelOrProduction || isHostedUrl;

  // Mode 1: Explicit remote hosted Supabase configuration
  if (isRemoteRequested) {
    if (!envUrl) {
      throw new Error(
        '[HouseOS Supabase Config] USE_REMOTE_SUPABASE is set to "true", but NEXT_PUBLIC_SUPABASE_URL is missing. ' +
          'Please configure NEXT_PUBLIC_SUPABASE_URL in your .env.local file.'
      );
    }

    try {
      const parsed = new URL(envUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('protocol');
      }
    } catch {
      throw new Error(
        '[HouseOS Supabase Config] USE_REMOTE_SUPABASE is set to "true", but NEXT_PUBLIC_SUPABASE_URL is malformed. ' +
          'Must be a valid HTTP or HTTPS URL (e.g. https://<project-ref>.supabase.co).'
      );
    }

    if (!envKey) {
      throw new Error(
        '[HouseOS Supabase Config] USE_REMOTE_SUPABASE is set to "true", but NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
          '(or NEXT_PUBLIC_SUPABASE_ANON_KEY) is missing. Please verify your .env.local file.'
      );
    }

    return {
      url: envUrl,
      key: envKey,
    };
  }

  // Mode 2: Local development fallback (Default)
  // If developer explicitly specified a local URL (e.g. http://localhost:54321), use it with local keys
  if (envUrl && (envUrl.includes('127.0.0.1') || envUrl.includes('localhost'))) {
    return {
      url: envUrl,
      key: envKey || LOCAL_SUPABASE_ANON_KEY,
    };
  }

  return {
    url: LOCAL_SUPABASE_URL,
    key: LOCAL_SUPABASE_ANON_KEY,
  };
}
