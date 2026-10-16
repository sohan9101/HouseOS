'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/data/events';

export type RegistrationActionSuccess = {
  success: true;
  status: 'registered' | 'already_registered' | 'cancelled' | 'already_cancelled';
  registrationId?: string;
  eventId?: string;
  message: string;
};

export type RegistrationActionError = {
  success: false;
  code:
    | 'UNAUTHENTICATED'
    | 'PROFILE_NOT_FOUND'
    | 'FORBIDDEN_ROLE'
    | 'INVALID_INPUT'
    | 'EVENT_NOT_FOUND'
    | 'EVENT_NOT_PUBLISHED'
    | 'EVENT_CANCELLED'
    | 'EVENT_ALREADY_STARTED'
    | 'EVENT_FULL'
    | 'NOT_REGISTERED'
    | 'DATABASE_ERROR';
  error: string;
};

export type RegistrationActionResult = RegistrationActionSuccess | RegistrationActionError;

export interface EventRegistrationStats {
  success: boolean;
  eventId: string;
  capacity: number | null;
  activeRegistrations: number;
  spotsLeft: number | null;
  isFull: boolean;
  userRegistrationStatus: 'registered' | 'cancelled' | null;
}

export type EventStatsResult =
  | { success: true; stats: EventRegistrationStats }
  | { success: false; code: string; error: string };

/**
 * Server Action: Register current authenticated student for an event.
 */
export async function registerForEventAction(eventId: string): Promise<RegistrationActionResult> {
  const cleanId = eventId?.trim() || '';
  if (!cleanId || !isUuid(cleanId)) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      error: 'Invalid event identifier provided.',
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('register_for_event', {
      p_event_id: cleanId,
    });

    if (error) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: error.message || 'Database error occurred during registration.',
      };
    }

    const res = data as Record<string, unknown> | null;
    if (!res) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: 'Empty response returned from registration service.',
      };
    }

    if (!res.success) {
      return {
        success: false,
        code: (res.code as RegistrationActionError['code']) || 'DATABASE_ERROR',
        error: (res.message as string) || 'Registration could not be completed.',
      };
    }

    try {
      revalidatePath('/events');
      revalidatePath(`/events/${cleanId}`);
    } catch {
      // Ignore revalidation errors outside Next.js request context
    }

    return {
      success: true,
      status: (res.status as RegistrationActionSuccess['status']) || 'registered',
      registrationId: res.registration_id as string | undefined,
      eventId: res.event_id as string | undefined,
      message: (res.message as string) || 'Registration confirmed successfully.',
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

/**
 * Server Action: Cancel current authenticated student's registration for an event.
 */
export async function cancelRegistrationAction(eventId: string): Promise<RegistrationActionResult> {
  const cleanId = eventId?.trim() || '';
  if (!cleanId || !isUuid(cleanId)) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      error: 'Invalid event identifier provided.',
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('cancel_event_registration', {
      p_event_id: cleanId,
    });

    if (error) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: error.message || 'Database error occurred during cancellation.',
      };
    }

    const res = data as Record<string, unknown> | null;
    if (!res) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: 'Empty response returned from cancellation service.',
      };
    }

    if (!res.success) {
      return {
        success: false,
        code: (res.code as RegistrationActionError['code']) || 'DATABASE_ERROR',
        error: (res.message as string) || 'Cancellation could not be completed.',
      };
    }

    try {
      revalidatePath('/events');
      revalidatePath(`/events/${cleanId}`);
    } catch {
      // Ignore revalidation errors outside Next.js request context
    }

    return {
      success: true,
      status: (res.status as RegistrationActionSuccess['status']) || 'cancelled',
      registrationId: res.registration_id as string | undefined,
      eventId: res.event_id as string | undefined,
      message: (res.message as string) || 'Registration cancelled successfully.',
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

/**
 * Server Action: Fetch public registration statistics and current user RSVP status.
 */
export async function getEventStatsAction(eventId: string): Promise<EventStatsResult> {
  const cleanId = eventId?.trim() || '';
  if (!cleanId || !isUuid(cleanId)) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      error: 'Invalid event identifier provided.',
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_event_registration_stats', {
      p_event_id: cleanId,
    });

    if (error) {
      return {
        success: false,
        code: 'DATABASE_ERROR',
        error: error.message || 'Failed to fetch event statistics.',
      };
    }

    const res = data as Record<string, unknown> | null;
    if (!res || !res.success) {
      return {
        success: false,
        code: (res?.code as string) || 'EVENT_NOT_FOUND',
        error: (res?.message as string) || 'Event statistics not found.',
      };
    }

    return {
      success: true,
      stats: {
        success: true,
        eventId: cleanId,
        capacity: typeof res.capacity === 'number' ? res.capacity : null,
        activeRegistrations: typeof res.active_registrations === 'number' ? res.active_registrations : 0,
        spotsLeft: typeof res.spots_left === 'number' ? res.spots_left : null,
        isFull: Boolean(res.is_full),
        userRegistrationStatus: (res.user_registration_status as 'registered' | 'cancelled' | null) || null,
      },
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
