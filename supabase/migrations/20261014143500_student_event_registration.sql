-- ==============================================================================
-- HouseOS Migration: 20261014143500_student_event_registration.sql
-- Description: Phase 2C.1 Student Event Registration Database & Backend Foundation
--
-- Features:
-- 1. Adds cancelled_at TIMESTAMPTZ to public.event_registrations
-- 2. Atomic public.register_for_event(p_event_id UUID) function:
--    - Enforces authentication and student role (profiles.role = 'student')
--    - Locks event row with FOR NO KEY UPDATE to eliminate capacity race conditions
--    - Rejects drafts, cancelled events, and events that have already started
--    - Handles null starts_at correctly (open for registration)
--    - Handles capacity = NULL correctly (unlimited capacity)
--    - Handles duplicate registration idempotently (returns 'already_registered')
--    - Handles re-registration after cancellation (clears cancelled_at, sets status = 'registered')
--    - Preserves unique (user_id, event_id) constraint
-- 3. Atomic public.cancel_event_registration(p_event_id UUID) function:
--    - Derives user strictly from auth.uid()
--    - Locks event first, then registration row (consistent lock order prevents deadlocks)
--    - Sets status = 'cancelled' and cancelled_at = now()
--    - Idempotent repeated cancellation (returns 'already_cancelled')
-- 4. Safe aggregate public.get_event_registration_stats(p_event_id UUID) function:
--    - Restricts to published events
--    - Returns aggregate counts without exposing individual student records (RLS-safe)
-- 5. Strict privilege management:
--    - SECURITY DEFINER with fixed search_path = public, pg_temp
--    - REVOKE EXECUTE FROM PUBLIC, anon
--    - GRANT EXECUTE to authenticated (and anon for read-only stats)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Schema Evolution: Add cancelled_at to public.event_registrations
-- ------------------------------------------------------------------------------
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- ------------------------------------------------------------------------------
-- 2. Atomic Registration Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_for_event(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_event RECORD;
    v_existing_reg RECORD;
    v_active_count INTEGER;
    v_reg_id UUID;
BEGIN
    -- 1. Authentication check
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNAUTHENTICATED',
            'message', 'Authentication required to register for events.'
        );
    END IF;

    -- 2. Role authorization check: Only students may register
    SELECT role INTO v_user_role
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_user_role IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'PROFILE_NOT_FOUND',
            'message', 'Resident profile not found.'
        );
    END IF;

    IF v_user_role <> 'student' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'FORBIDDEN_ROLE',
            'message', 'Only users with the student role may register for events.'
        );
    END IF;

    -- 3. Lock event record to serialize concurrent registrations on this event
    -- Consistent lock order across all procedures: events(id) -> event_registrations(user_id, event_id)
    SELECT id, status, capacity, starts_at INTO v_event
    FROM public.events
    WHERE id = p_event_id
    FOR NO KEY UPDATE;

    IF v_event.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'EVENT_NOT_FOUND',
            'message', 'Event not found.'
        );
    END IF;

    -- 4. Validate event status
    IF v_event.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'EVENT_CANCELLED',
            'message', 'This event has been cancelled.'
        );
    END IF;

    IF v_event.status <> 'published' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'EVENT_NOT_PUBLISHED',
            'message', 'Registrations are only accepted for published events.'
        );
    END IF;

    -- 5. Validate event start time (reject events that have already started; NULL starts_at accepted)
    IF v_event.starts_at IS NOT NULL AND v_event.starts_at <= now() THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'EVENT_ALREADY_STARTED',
            'message', 'Registration is closed because this event has already started.'
        );
    END IF;

    -- 6. Check existing registration for this user and event (second in lock order)
    SELECT id, status INTO v_existing_reg
    FROM public.event_registrations
    WHERE user_id = v_user_id AND event_id = p_event_id
    FOR UPDATE;

    -- Duplicate check: Already registered returns clean idempotent success
    IF v_existing_reg.id IS NOT NULL AND v_existing_reg.status = 'registered' THEN
        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_registered',
            'registration_id', v_existing_reg.id,
            'event_id', p_event_id,
            'message', 'You are already registered for this event.'
        );
    END IF;

    -- 7. Check capacity constraint if event has a finite limit
    IF v_event.capacity IS NOT NULL THEN
        SELECT count(*) INTO v_active_count
        FROM public.event_registrations
        WHERE event_id = p_event_id AND status = 'registered';

        IF v_active_count >= v_event.capacity THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'EVENT_FULL',
                'message', 'This event has reached maximum capacity.'
            );
        END IF;
    END IF;

    -- 8. Upsert registration: reactivate cancelled record or insert fresh
    IF v_existing_reg.id IS NOT NULL THEN
        UPDATE public.event_registrations
        SET status = 'registered',
            registered_at = now(),
            cancelled_at = NULL
        WHERE id = v_existing_reg.id
        RETURNING id INTO v_reg_id;
    ELSE
        INSERT INTO public.event_registrations (user_id, event_id, status, registered_at, cancelled_at)
        VALUES (v_user_id, p_event_id, 'registered', now(), NULL)
        RETURNING id INTO v_reg_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'registered',
        'registration_id', v_reg_id,
        'event_id', p_event_id,
        'registered_at', now(),
        'message', 'Registration confirmed successfully.'
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Atomic Cancellation Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_event_registration(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_event RECORD;
    v_existing_reg RECORD;
BEGIN
    -- 1. Authentication check
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNAUTHENTICATED',
            'message', 'Authentication required.'
        );
    END IF;

    -- 2. Lock event record first to maintain consistent lock order: events -> event_registrations
    SELECT id, status INTO v_event
    FROM public.events
    WHERE id = p_event_id
    FOR NO KEY UPDATE;

    IF v_event.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'EVENT_NOT_FOUND',
            'message', 'Event not found.'
        );
    END IF;

    -- 3. Locate registration record (second in lock order)
    SELECT id, status INTO v_existing_reg
    FROM public.event_registrations
    WHERE user_id = v_user_id AND event_id = p_event_id
    FOR UPDATE;

    IF v_existing_reg.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'NOT_REGISTERED',
            'message', 'No registration found for this event.'
        );
    END IF;

    -- 4. Idempotent check: already cancelled returns safe, predictable result
    IF v_existing_reg.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_cancelled',
            'registration_id', v_existing_reg.id,
            'event_id', p_event_id,
            'message', 'Registration was already cancelled.'
        );
    END IF;

    -- 5. Mark cancelled and set timestamp
    UPDATE public.event_registrations
    SET status = 'cancelled',
        cancelled_at = now()
    WHERE id = v_existing_reg.id;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'cancelled',
        'registration_id', v_existing_reg.id,
        'event_id', p_event_id,
        'cancelled_at', now(),
        'message', 'Registration cancelled successfully.'
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. Safe Aggregate Statistics Function (Preserves User PII under RLS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_event_registration_stats(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_event RECORD;
    v_active_count INTEGER;
    v_user_status TEXT := NULL;
    v_user_id UUID;
BEGIN
    -- Only exposed for published events
    SELECT id, status, capacity INTO v_event
    FROM public.events
    WHERE id = p_event_id;

    IF v_event.id IS NULL OR v_event.status <> 'published' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'EVENT_NOT_FOUND',
            'message', 'Event not found or not published.'
        );
    END IF;

    -- Calculate total active registrations
    SELECT count(*) INTO v_active_count
    FROM public.event_registrations
    WHERE event_id = p_event_id AND status = 'registered';

    -- If caller is authenticated, include their personal registration status
    v_user_id := auth.uid();
    IF v_user_id IS NOT NULL THEN
        SELECT status INTO v_user_status
        FROM public.event_registrations
        WHERE event_id = p_event_id AND user_id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'event_id', p_event_id,
        'capacity', v_event.capacity,
        'active_registrations', v_active_count,
        'spots_left', CASE WHEN v_event.capacity IS NOT NULL THEN GREATEST(0, v_event.capacity - v_active_count) ELSE NULL END,
        'is_full', CASE WHEN v_event.capacity IS NOT NULL THEN v_active_count >= v_event.capacity ELSE false END,
        'user_registration_status', v_user_status
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. Function Access Control & Privileges
-- ------------------------------------------------------------------------------

-- Revoke all permissions on all 3 functions from PUBLIC and anon
REVOKE ALL ON FUNCTION public.register_for_event(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_event_registration(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_event_registration_stats(UUID) FROM PUBLIC;

-- Grant execution to intended roles
-- Authenticated users can invoke registration and cancellation
GRANT EXECUTE ON FUNCTION public.register_for_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_event_registration(UUID) TO authenticated;

-- Both anonymous and authenticated users can read aggregate published event statistics
GRANT EXECUTE ON FUNCTION public.get_event_registration_stats(UUID) TO anon, authenticated;
