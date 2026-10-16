'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/data/events';

export type AssignHouseErrorCode =
  | 'UNAUTHENTICATED'
  | 'PROFILE_NOT_FOUND'
  | 'FORBIDDEN_ROLE'
  | 'HOUSE_NOT_FOUND'
  | 'HOUSE_ALREADY_ASSIGNED'
  | 'INVALID_INPUT'
  | 'DATABASE_ERROR';

export type AssignHouseResult =
  | {
      success: true;
      houseId: string;
      houseName: string;
      message: string;
      redirectTo: string;
    }
  | {
      success: false;
      code: AssignHouseErrorCode;
      error: string;
    };

/**
 * Validates local redirect path for students and blocks open redirects,
 * protocol tricks, and unauthorized routes (/login, /onboarding, /organizer).
 */
function sanitizeStudentRedirect(path: string | null | undefined, fallback = '/'): string {
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
  // Prevent redirect loops and unauthorized route destinations
  if (
    decoded === '/login' ||
    decoded.startsWith('/login?') ||
    decoded.startsWith('/login/') ||
    decoded === '/onboarding' ||
    decoded.startsWith('/onboarding?') ||
    decoded.startsWith('/onboarding/') ||
    decoded === '/organizer' ||
    decoded.startsWith('/organizer?') ||
    decoded.startsWith('/organizer/')
  ) {
    return fallback;
  }
  return path.trim();
}

/**
 * Server Action: Assign the authenticated student to an official house.
 * Uses atomic PostgreSQL RPC assign_student_house.
 */
export async function assignHouseAction(
  houseId: string,
  redirectTo?: string | null
): Promise<AssignHouseResult> {
  const cleanId = houseId?.trim() || '';
  if (!cleanId || !isUuid(cleanId)) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      error: 'Please select a valid house from the official directory.',
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        code: 'UNAUTHENTICATED',
        error: 'Your session has expired. Please sign in again.',
      };
    }

    const { data, error } = await supabase.rpc('assign_student_house', {
      p_house_id: cleanId,
    });

    if (error) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: error.message || 'Database error occurred during house assignment.',
      };
    }

    const res = data as Record<string, unknown> | null;
    if (!res) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: 'Empty response returned from house assignment service.',
      };
    }

    if (!res.success) {
      return {
        success: false,
        code: (res.code as AssignHouseErrorCode) || 'DATABASE_ERROR',
        error: (res.message as string) || 'House assignment could not be completed.',
      };
    }

    // Step 4: Verify and refresh the authenticated student's profile from Supabase
    const { data: updatedProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, display_name, role, house_id, houses(id, name)')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !updatedProfile || updatedProfile.house_id !== cleanId) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: 'House assignment could not be confirmed in your student profile record.',
      };
    }

    const rawHouse = updatedProfile.houses as { id: string; name: string } | null;
    const houseName = rawHouse?.name || (res.house_name as string) || 'Assigned House';

    // Step 3: Revalidate the relevant profile and dashboard data
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/onboarding');
      revalidatePath('/houses');
      revalidatePath('/standings');
    } catch {
      // Revalidation errors outside request context can be safely ignored
    }

    // Step 5: Redirect to requested target or fallback to '/'
    const targetUrl = sanitizeStudentRedirect(redirectTo, '/');
    return {
      success: true,
      houseId: cleanId,
      houseName,
      message: (res.message as string) || 'House onboarding completed successfully.',
      redirectTo: targetUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return {
      success: false,
      code: 'DATABASE_ERROR',
      error: message,
    };
  }
}
