import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { OFFICIAL_HOUSES } from '@/lib/data/houses';
import { OnboardingView, type OnboardingHouseItem } from '@/components/onboarding/OnboardingView';

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
  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.startsWith('/\\')
  ) {
    return fallback;
  }
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

export const metadata: Metadata = {
  title: 'Student House Onboarding — HouseOS',
  description:
    'Select your official House affiliation for IIT Madras BS Degree tournaments, Community Cup standings, and local council representation.',
};

export const instant = false;

interface OnboardingPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  await connection();
  const { redirectTo } = await searchParams;

  if (!isSupabaseConfigured()) {
    redirect('/login');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/login?redirectTo=/onboarding';
    redirect(loginUrl);
  }

  // Fetch student profile to verify role and house assignment status
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, role, house_id')
    .eq('id', user.id)
    .maybeSingle();

  // Guard 1: Non-students should not access student house onboarding
  if (profile && profile.role !== 'student') {
    if (profile.role === 'organizer' || profile.role === 'warden') {
      redirect('/organizer');
    }
    redirect('/');
  }

  // Guard 2: Students with an already assigned house should not be repeatedly prompted
  if (profile && profile.house_id) {
    const destination = sanitizeStudentRedirect(redirectTo, '/');
    redirect(destination);
  }

  // Fetch official house choices from public.houses (never hardcoded duplicate database records)
  const { data: dbHouses, error: housesError } = await supabase
    .from('houses')
    .select('id, name')
    .order('name', { ascending: true });

  if (housesError || !dbHouses || dbHouses.length === 0) {
    return (
      <div className="min-h-screen bg-[#101116] flex items-center justify-center p-6 text-[#F3F0E8]">
        <div className="p-8 rounded-2xl bg-[#202631] border border-[#FF896D]/40 max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold text-white">House Directory Unavailable</h1>
          <p className="text-xs text-[#9EA8B6]">
            Failed to load official house records from the database. Please try again or contact campus support.
          </p>
        </div>
      </div>
    );
  }

  // Merge database house records with canonical presentation metadata (zones, colors, crest codes)
  const houses: OnboardingHouseItem[] = dbHouses.map((dbh) => {
    const match = OFFICIAL_HOUSES.find(
      (oh) =>
        oh.name.toLowerCase().includes(dbh.name.toLowerCase()) ||
        dbh.name.toLowerCase().includes(oh.name.toLowerCase())
    );

    return {
      id: dbh.id,
      name: dbh.name,
      code: match?.code || dbh.name.substring(0, 3).toUpperCase(),
      zone: match?.zone || 'Campus Zone',
      colorHex: match?.colorHex || '#43E5D2',
      accentHex: match?.accentHex || '#8B7CFF',
      residentCount: match?.residentCount || 300,
    };
  });

  const displayName =
    profile?.display_name ||
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'Resident Student';

  return (
    <OnboardingView
      houses={houses}
      userDisplayName={displayName}
      userEmail={user.email || 'student@study.iitm.ac.in'}
      redirectTo={redirectTo}
    />
  );
}
