-- ==============================================================================
-- HouseOS Migration: 20261014142500_initial_schema.sql
-- Description: Baseline schema definition for HouseOS Phase 2A
-- Tables: houses, societies, profiles, events, announcements, event_registrations
-- Constraints: Primary keys, foreign keys, unique keys, and domain checks
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Table: public.houses
-- The 12 official residential houses of the IIT Madras BS Degree community
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_houses_name ON public.houses(name);

-- ------------------------------------------------------------------------------
-- 2. Table: public.societies
-- 30 student-run technical, cultural, competitive, and research societies
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT
);

CREATE INDEX IF NOT EXISTS idx_societies_name ON public.societies(name);
CREATE INDEX IF NOT EXISTS idx_societies_category ON public.societies(category);

-- ------------------------------------------------------------------------------
-- 3. Table: public.profiles
-- User profile metadata linked to Supabase auth.users
-- Supported roles: 'student', 'organizer', 'warden'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    house_id UUID REFERENCES public.houses(id) ON DELETE SET NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'warden'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_house_id ON public.profiles(house_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 4. Table: public.events
-- Centralized flagships, society workshops, and inter-house competitions
-- Supported statuses: 'draft', 'published', 'cancelled'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    organizer_type TEXT,
    organizer_name TEXT,
    format TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
    capacity INTEGER,
    house_points INTEGER DEFAULT 0,
    venue TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- ------------------------------------------------------------------------------
-- 5. Table: public.announcements
-- Campus-wide and house-specific broadcast announcements
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ,
    title TEXT NOT NULL,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    is_pinned BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON public.announcements(is_pinned);

-- ------------------------------------------------------------------------------
-- 6. Table: public.event_registrations
-- Student event attendance and RSVP ledger
-- Supported statuses: 'registered', 'cancelled'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
    CONSTRAINT uq_user_event_registration UNIQUE (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.event_registrations(event_id);
