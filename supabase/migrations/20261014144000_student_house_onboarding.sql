-- ==============================================================================
-- HouseOS Migration: 20261014144000_student_house_onboarding.sql
-- Description: Student House Onboarding & Narrow Self-Assignment Security Model
--
-- Features:
-- 1. Narrowly scoped, race-safe public.assign_student_house(p_house_id UUID):
--    - Derives target user strictly from auth.uid()
--    - Verifies house existence in public.houses
--    - Serializes concurrent requests using FOR UPDATE row locking on profiles
--    - Enforces role = 'student' and house_id IS NULL
--    - Rejects non-students (organizer/warden) with FORBIDDEN_ROLE
--    - Rejects changes to existing house assignment with HOUSE_ALREADY_ASSIGNED
--    - Prevents tampering with role, id, or other fields
--    - Runs with fixed search_path = public, pg_temp
-- 2. Enhanced immutable fields trigger:
--    - Direct PostgREST client UPDATE (current_user = 'authenticated') cannot modify house_id, role, or id
--    - Inside trusted functions (auth.role() = 'authenticated'), prevents mutating role, id, or already-assigned house_id
-- 3. Strict privilege control:
--    - REVOKE EXECUTE FROM PUBLIC, anon
--    - GRANT EXECUTE to authenticated
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Update Profile Protection Trigger for Safe House Assignment
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- Direct updates initiated by the authenticated client role are strictly blocked from mutating role, id, or house_id
    IF (current_user = 'authenticated') THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Role elevation is restricted to administrative processes and cannot be altered directly.';
        END IF;

        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Profile ID is immutable.';
        END IF;

        IF NEW.house_id IS DISTINCT FROM OLD.house_id THEN
            RAISE EXCEPTION 'House assignment cannot be modified directly. Assignments require administrative processing.';
        END IF;
    END IF;

    -- Even when invoked through security definer functions under authenticated context:
    IF (auth.role() = 'authenticated') THEN
        -- Role elevation or alteration is strictly prohibited
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Role elevation is restricted to administrative processes and cannot be altered directly.';
        END IF;

        -- Profile identity is immutable
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Profile ID is immutable.';
        END IF;

        -- Once a house has been assigned, it cannot be altered or overwritten
        IF OLD.house_id IS NOT NULL AND NEW.house_id IS DISTINCT FROM OLD.house_id THEN
            RAISE EXCEPTION 'House assignment is permanent and cannot be altered once set.';
        END IF;

        -- Non-students cannot have a house assigned through onboarding
        IF OLD.role <> 'student' AND NEW.house_id IS DISTINCT FROM OLD.house_id THEN
            RAISE EXCEPTION 'House onboarding is strictly reserved for students.';
        END IF;
    END IF;

    -- Enforce server-managed timestamp; clients cannot spoof updated_at
    NEW.updated_at := now();

    RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. Race-Safe Atomic Student House Assignment Function
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.assign_student_house(p_house_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_role TEXT;
    v_existing_house_id UUID;
    v_house_name TEXT;
BEGIN
    -- 1. Authentication check
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNAUTHENTICATED',
            'message', 'Authentication required to select a house.'
        );
    END IF;

    -- 2. Input validation
    IF p_house_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'INVALID_INPUT',
            'message', 'Please select a valid house.'
        );
    END IF;

    -- 3. Verify target house exists in public.houses
    SELECT name INTO v_house_name
    FROM public.houses
    WHERE id = p_house_id;

    IF v_house_name IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'HOUSE_NOT_FOUND',
            'message', 'The selected house does not exist.'
        );
    END IF;

    -- 4. Lock caller profile row to serialize concurrent onboarding requests (race-safety)
    SELECT role, house_id INTO v_role, v_existing_house_id
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_role IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'PROFILE_NOT_FOUND',
            'message', 'Resident profile not found.'
        );
    END IF;

    -- 5. Role check: only students can self-select their house
    IF v_role <> 'student' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'FORBIDDEN_ROLE',
            'message', 'House onboarding is strictly reserved for student residents.'
        );
    END IF;

    -- 6. Immutability check: cannot overwrite an already assigned house
    IF v_existing_house_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'HOUSE_ALREADY_ASSIGNED',
            'message', 'A house has already been assigned to this resident profile and cannot be changed.'
        );
    END IF;

    -- 7. Persist house assignment
    UPDATE public.profiles
    SET house_id = p_house_id,
        updated_at = now()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'house_id', p_house_id,
        'house_name', v_house_name,
        'message', 'House onboarding completed successfully.'
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Privileges and Access Control
-- ------------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.assign_student_house(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_student_house(UUID) TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
