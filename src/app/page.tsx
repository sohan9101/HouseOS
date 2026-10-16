import React from 'react';
import { connection } from 'next/server';
import { AppShell } from '@/components/layout/AppShell';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { FlagshipFeatures } from '@/components/dashboard/FlagshipFeatures';
import { UpcomingEventsList } from '@/components/dashboard/UpcomingEventsList';
import { SocietiesPreview } from '@/components/dashboard/SocietiesPreview';
import { HouseStandingsCard } from '@/components/dashboard/HouseStandingsCard';
import { AnnouncementsFeed } from '@/components/dashboard/AnnouncementsFeed';
import {
  getEvents,
  getFlagshipEvents,
  getHouseStandings,
  getSocieties,
} from '@/lib/mock-data';
import { getLiveAnnouncements } from '@/lib/data/announcements';

export const instant = false;

export default async function CommunityDashboardPage() {
  await connection();
  const allEvents = getEvents();
  const flagshipEvents = getFlagshipEvents();
  const regularUpcomingEvents = allEvents.filter((e) => !e.isFlagship).slice(0, 4);
  const { announcements, error: announcementsError } = await getLiveAnnouncements(4);
  const standings = getHouseStandings();
  const societies = getSocieties();


  return (
    <AppShell>
      <div className="space-y-8">
        {/* 1. Welcome Section with Student House Identity */}
        <WelcomeSection />

        {/* 2. Featured Centralized Flagship Events: PARADOX (Offline) & SAAVAN (Online) */}
        <FlagshipFeatures flagshipEvents={flagshipEvents} />

        {/* 3. Upcoming Campus Events & 6. Announcements Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Column: Regular Club & Society Events */}
          <div className="lg:col-span-7 space-y-6">
            <UpcomingEventsList events={regularUpcomingEvents} />
          </div>

          {/* Right Column: Campus Notices & Announcements */}
          <div id="announcements" className="lg:col-span-5 space-y-6">
            <AnnouncementsFeed
              announcements={announcements}
              error={announcementsError}
            />
          </div>
        </div>

        {/* 4. Club and Society Discovery Section */}
        <SocietiesPreview societies={societies} />

        {/* 5. Inter-House Competitions & Community Cup Standings */}
        <div className="pt-2 border-t border-[#343A49]">
          <HouseStandingsCard standings={standings} />
        </div>
      </div>
    </AppShell>
  );
}

