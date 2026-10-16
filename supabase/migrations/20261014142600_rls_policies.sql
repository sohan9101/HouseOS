-- ==============================================================================
-- HouseOS Migration: 20261014142600_rls_policies.sql
-- Description: Row Level Security (RLS) enablement and baseline SELECT policies
-- Reproduces the verified Phase 2A security posture
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable Row Level Security on all 6 tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Baseline Public Read Policies (Phase 2A Verified)
-- Grants SELECT permission to public (anonymous visitors and authenticated users)
-- ------------------------------------------------------------------------------

-- Houses: Public directory
CREATE POLICY "Allow public read houses"
    ON public.houses
    FOR SELECT
    TO public
    USING (true);

-- Societies: Public directory
CREATE POLICY "Allow public read societies"
    ON public.societies
    FOR SELECT
    TO public
    USING (true);

-- Events: Published records only
CREATE POLICY "Allow public read published events"
    ON public.events
    FOR SELECT
    TO public
    USING (status = 'published');

-- Announcements: Published announcements only
CREATE POLICY "Allow public read announcements"
    ON public.announcements
    FOR SELECT
    TO public
    USING (status = 'published');

-- Profiles: Baseline Phase 2A public read policy
-- Note: Phase 2B will restrict full profile reads to authenticated users to protect PII
CREATE POLICY "Allow public read profiles"
    ON public.profiles
    FOR SELECT
    TO public
    USING (true);

-- Event Registrations: Baseline Phase 2A read policy
CREATE POLICY "Allow read event registrations"
    ON public.event_registrations
    FOR SELECT
    TO public
    USING (true);

-- ------------------------------------------------------------------------------
-- Note on Mutation Policies:
-- In accordance with Phase 2A security specifications, NO INSERT, UPDATE, or
-- DELETE policies are granted to the 'anon' role. All writes are rejected by RLS.
-- Phase 2B will introduce authenticated self-registration, profile auto-provisioning,
-- and role-gated organizer write policies.
-- ------------------------------------------------------------------------------
