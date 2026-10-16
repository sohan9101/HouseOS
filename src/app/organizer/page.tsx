import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { OrganizerView } from '@/components/organizer/OrganizerView';
import { createClient } from '@/lib/supabase/server';
import {
  getOrganizerStats,
  getEvents,
  getAnnouncements,
  getRegistrationsRoster,
} from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Organizer Console — HouseOS',
  description:
    'Administrative portal for IIT Madras BS campus event coordination, announcements, and attendance rosters.',
};

export const instant = false;

export default async function OrganizerDashboardPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/organizer');
  }

  // Fetch authenticated user's role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single();

  const isAuthorized = profile?.role === 'organizer' || profile?.role === 'warden';

  if (!isAuthorized) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto my-12 p-8 bg-[#202631] border border-[#343A49] rounded-2xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF896D]/15 border border-[#FF896D]/30 flex items-center justify-center text-[#FF896D]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Access Restricted</h1>
            <p className="text-xs text-[#A0A6B8] max-w-md mx-auto leading-relaxed">
              The Organizer Console is reserved for verified Student Council Executives and Faculty Wardens.
              Your account ({user.email}) is currently registered as a <span className="text-[#43E5D2] font-semibold">Resident Student</span>.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#A0A6B8] text-left space-y-1">
            <p className="font-semibold text-white">Role Security Architecture:</p>
            <p className="text-[11px] leading-relaxed">
              HouseOS requires trusted database administrative provisioning for role elevation. Public signup and profile self-edits cannot alter student permissions.
            </p>
          </div>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#43E5D2] hover:bg-[#38C7B6] text-[#101116] font-bold text-xs transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Resident Portal</span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const stats = getOrganizerStats();
  const events = getEvents();
  const announcements = getAnnouncements();
  const roster = getRegistrationsRoster();

  const organizerProfile = {
    displayName: profile?.display_name || user.email?.split('@')[0] || 'Staff Organizer',
    role: profile?.role || 'organizer',
    email: user.email ?? null,
  };

  return (
    <AppShell>
      <OrganizerView
        stats={stats}
        events={events}
        announcements={announcements}
        roster={roster}
        organizerProfile={organizerProfile}
      />
    </AppShell>
  );
}
