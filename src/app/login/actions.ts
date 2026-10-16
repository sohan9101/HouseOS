'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface AuthActionResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
  email?: string;
}

/**
 * Validates that a redirect path is local and prevents open redirects.
 * Decodes URI components to block encoded slashes, backslashes, and protocol-relative targets.
 */
function sanitizeRedirect(path: string | null | undefined, fallback = '/'): string {
  if (!path) return fallback;
  let decoded = path.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }
  // Must begin with a single '/' and cannot start with '//' or '/\'
  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.startsWith('/\\')
  ) {
    return fallback;
  }
  // Prevent redirect loops back to /login
  if (
    decoded === '/login' ||
    decoded.startsWith('/login?') ||
    decoded.startsWith('/login/')
  ) {
    return fallback;
  }
  return path.trim();
}

/**
 * Validates email structure.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Server Action: Log in with email and password.
 */
export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email')?.toString().trim() || '';
  const password = formData.get('password')?.toString() || '';
  const rawRedirect = formData.get('redirectTo')?.toString();
  const safeRedirect = sanitizeRedirect(rawRedirect, '/');

  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    };
  }

  if (!password || password.length === 0) {
    return {
      success: false,
      error: 'Password is required.',
    };
  }

  let targetUrl: string = '/';

  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes('invalid login credentials') ||
        error.message.toLowerCase().includes('invalid credentials')
      ) {
        return {
          success: false,
          error: 'Invalid email or password. Please verify your credentials and try again.',
        };
      }
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error:
            'Your email address has not been confirmed yet. Please check your inbox for the activation link.',
        };
      }
      if (error.message.toLowerCase().includes('fetch failed')) {
        return {
          success: false,
          error:
            'Unable to connect to the authentication service. If running locally, please verify that local Supabase (127.0.0.1:54321) is running; if using hosted Supabase, verify network connectivity.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    const user = authData.user;
    if (!user) {
      return {
        success: false,
        error: 'Authentication failed. Please verify your credentials and try again.',
      };
    }

    // Retrieve profile to determine role and house affiliation
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, house_id')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role || 'student';
    const houseId = profile?.house_id || null;

    if (role === 'organizer' || role === 'warden') {
      targetUrl = safeRedirect && safeRedirect !== '/' ? safeRedirect : '/organizer';
    } else {
      // Resident student routing
      if (!houseId) {
        const safeStudentRedirect =
          safeRedirect && safeRedirect !== '/' && safeRedirect !== '/organizer'
            ? safeRedirect
            : null;
        targetUrl = safeStudentRedirect
          ? `/onboarding?redirectTo=${encodeURIComponent(safeStudentRedirect)}`
          : '/onboarding';
      } else {
        targetUrl = safeRedirect === '/organizer' ? '/' : safeRedirect;
      }
    }
  } catch {
    return {
      success: false,
      error: 'Authentication failed due to an unexpected connection error. Please try again.',
    };
  }

  // Redirect on successful authentication (always executed outside try/catch)
  redirect(targetUrl);
}

/**
 * Server Action: Sign up with email, password, and display name.
 * Public signups are strictly provisioned as resident students.
 */
export async function signupAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const displayName = formData.get('displayName')?.toString().trim() || '';
  const email = formData.get('email')?.toString().trim() || '';
  const password = formData.get('password')?.toString() || '';
  const rawRedirect = formData.get('redirectTo')?.toString();
  const safeRedirect = sanitizeRedirect(rawRedirect, '/');

  if (!displayName || displayName.length < 2) {
    return {
      success: false,
      error: 'Display name must be at least 2 characters.',
    };
  }

  if (displayName.length > 50) {
    return {
      success: false,
      error: 'Display name must not exceed 50 characters.',
    };
  }

  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long.',
    };
  }

  let requiresEmailVerification = false;
  let userEmail = email;

  try {
    const supabase = await createClient();

    // Critical security: Do NOT provide role in metadata.
    // The DB trigger strictly assigns 'student' role.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.',
        };
      }
      if (error.message.toLowerCase().includes('fetch failed')) {
        return {
          success: false,
          error:
            'Unable to connect to the authentication service. If running locally, please verify that local Supabase (127.0.0.1:54321) is running; if using hosted Supabase, verify network connectivity.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    // Check if user already exists (Supabase returns empty identities array when user exists and email confirmation is on)
    if (data.user?.identities && data.user.identities.length === 0) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
      };
    }

    userEmail = data.user?.email || email;

    // Detect if email verification is required
    // If session is null, or email_confirmed_at is not set, verification email was sent
    if (!data.session || !data.user?.email_confirmed_at) {
      requiresEmailVerification = true;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    return {
      success: false,
      error: 'Signup failed due to an unexpected server error. Please try again.',
    };
  }

  if (requiresEmailVerification) {
    return {
      success: true,
      requiresVerification: true,
      email: userEmail,
    };
  }

  // If email confirmation is disabled on Supabase, user has active session immediately.
  // Newly registered students have house_id = null and must complete house onboarding.
  const onboardingUrl =
    safeRedirect && safeRedirect !== '/'
      ? `/onboarding?redirectTo=${encodeURIComponent(safeRedirect)}`
      : '/onboarding';
  redirect(onboardingUrl);
}

/**
 * Server Action: Log out the current user and redirect to /login.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
