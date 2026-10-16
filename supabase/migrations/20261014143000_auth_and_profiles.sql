-- ==============================================================================
-- HouseOS Migration: 20261014143000_auth_and_profiles.sql
-- Description: Phase 2B Authentication Security Hardening (Stage 2)
--
-- Security Enhancements:
-- 1. Automatic profile provisioning trigger on auth.users:
--    - Hardcoded role = 'student' (metadata ignored for role & permissions)
--    - house_id left NULL (metadata ignored for house assignment)
--    - Fails transaction on error to prevent orphaned auth users
-- 2. Immutable fields trigger (SECURITY INVOKER):
--    - Correct caller identification (auth.role() and current_user = 'authenticated')
--    - Prevents modification of role, id, or house_id by authenticated users
--    - Enforces server-managed updated_at = now()
-- 3. Column-Level SQL Privileges (Defense-in-Depth):
--    - Grants UPDATE ONLY on display_name to authenticated users
--    - Denies UPDATE on role, house_id, id, and updated_at at the SQL grant level
-- 4. Hardened RLS Policies:
--    - profiles: Owner-only SELECT and UPDATE (auth.uid() = id)
--    - event_registrations: Owner-only SELECT (auth.uid() = user_id), no writes
--    - events & announcements: Published-only SELECT (status = 'published')
--    - houses & societies: Public read directories (USING true)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Automatic Profile Provisioning Trigger on auth.users
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_display_name TEXT;
BEGIN
    -- Extract and sanitize optional display_name from raw_user_meta_data
    v_display_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), '');

    -- Limit length to prevent overflow or malformed inputs
    IF v_display_name IS NOT NULL AND length(v_display_name) > 100 THEN
        v_display_name := substring(v_display_name FROM 1 FOR 100);
    END IF;

    -- If no display name was provided, fall back to email username
    IF v_display_name IS NULL AND NEW.email IS NOT NULL THEN
        v_display_name := split_part(NEW.email, '@', 1);
    END IF;

    -- Default fallback if username extraction is empty
    IF v_display_name IS NULL OR length(v_display_name) = 0 THEN
        v_display_name := 'Resident Student';
    END IF;

    -- CRITICAL ROLE & HOUSE SECURITY:
    -- 1. Every public signup is strictly provisioned with role = 'student'.
    -- 2. house_id is strictly NULL; user metadata cannot assign house membership.
    -- 3. User metadata is NEVER trusted for role, permissions, or house assignment.
    -- No EXCEPTION block: Any failure aborts the transaction to prevent orphaned accounts.
    INSERT INTO public.profiles (id, display_name, role, house_id)
    VALUES (NEW.id, v_display_name, 'student', NULL)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Trigger firing immediately after a user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. Database-Level Protection for Immutable & Privileged Fields
-- ------------------------------------------------------------------------------

-- SECURITY INVOKER ensures current_user identifies the actual caller (e.g. 'authenticated')
-- rather than the function owner ('postgres').
CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- Intercept updates initiated by the authenticated client role
    IF (current_user = 'authenticated' OR auth.role() = 'authenticated') THEN
        -- Prevent role elevation or alteration
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Role elevation is restricted to administrative processes and cannot be altered directly.';
        END IF;

        -- Prevent primary key / user_id mutation
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Profile ID is immutable.';
        END IF;

        -- Prevent self-assigned or cross-user house reassignment
        IF NEW.house_id IS DISTINCT FROM OLD.house_id THEN
            RAISE EXCEPTION 'House assignment cannot be modified directly. Assignments require administrative processing.';
        END IF;
    END IF;

    -- Enforce server-managed timestamp; clients cannot spoof updated_at
    NEW.updated_at := now();

    RETURN NEW;
END;
$$;

-- Drop prior trigger name if present, then attach the hardened trigger
DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
DROP TRIGGER IF EXISTS tr_protect_profile_immutable_fields ON public.profiles;
CREATE TRIGGER tr_protect_profile_immutable_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_immutable_fields();

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

-- Ensure RLS is active on all tables
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- (a) public.profiles
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON public.profiles;

-- Only authenticated users may view their own profile (protects PII)
CREATE POLICY "Allow authenticated users to read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Authenticated users may update their own profile
CREATE POLICY "Allow authenticated users to update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- (b) public.event_registrations
DROP POLICY IF EXISTS "Allow read event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Allow authenticated users to read own registrations" ON public.event_registrations;

-- Authenticated users may only read their own event registrations
CREATE POLICY "Allow authenticated users to read own registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Note: No INSERT, UPDATE, or DELETE policies exist for event_registrations in this stage.

-- (c) public.events
DROP POLICY IF EXISTS "Allow public read published events" ON public.events;
CREATE POLICY "Allow public read published events"
    ON public.events
    FOR SELECT
    TO public
    USING (status = 'published');

-- (d) public.announcements
DROP POLICY IF EXISTS "Allow public read announcements" ON public.announcements;
CREATE POLICY "Allow public read announcements"
    ON public.announcements
    FOR SELECT
    TO public
    USING (status = 'published');

-- (e) public.houses & public.societies
DROP POLICY IF EXISTS "Allow public read houses" ON public.houses;
CREATE POLICY "Allow public read houses"
    ON public.houses
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Allow public read societies" ON public.societies;
CREATE POLICY "Allow public read societies"
    ON public.societies
    FOR SELECT
    TO public
    USING (true);

-- ------------------------------------------------------------------------------
-- 4. SQL Table & Column Grants (First Line of Defense)
-- ------------------------------------------------------------------------------

-- Revoke all permissions on all 6 tables from anon and authenticated roles
REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.event_registrations FROM anon, authenticated;
REVOKE ALL ON public.events FROM anon, authenticated;
REVOKE ALL ON public.announcements FROM anon, authenticated;
REVOKE ALL ON public.houses FROM anon, authenticated;
REVOKE ALL ON public.societies FROM anon, authenticated;

-- Public read directories: anon and authenticated can SELECT
GRANT SELECT ON public.houses TO anon, authenticated;
GRANT SELECT ON public.societies TO anon, authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.announcements TO anon, authenticated;

-- Scoped authenticated access:
-- 1. Profiles: authenticated can read rows permitted by RLS
GRANT SELECT ON public.profiles TO authenticated;

-- 2. Profiles: authenticated can ONLY update display_name
-- (Attempts to update role, house_id, id, or updated_at fail at SQL grant level)
GRANT UPDATE (display_name) ON public.profiles TO authenticated;

-- 3. Event Registrations: authenticated can read rows permitted by RLS
GRANT SELECT ON public.event_registrations TO authenticated;

-- Explicitly ensure no mutation privileges exist for anon or authenticated
REVOKE INSERT, DELETE ON public.profiles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.event_registrations FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.announcements FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.houses FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.societies FROM anon, authenticated;
