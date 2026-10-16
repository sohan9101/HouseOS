'use client';

import React, { useState } from 'react';
import {
  HouseEvent,
  HouseAnnouncement,
  OrganizerStat,
  EventRegistrationItem,
} from '@/types';
import { OrganizerStatsBar } from './OrganizerStatsBar';
import { OrganizerEventsTable } from './OrganizerEventsTable';
import { OrganizerAnnouncementsManager } from './OrganizerAnnouncementsManager';
import { OrganizerRosterTable } from './OrganizerRosterTable';
import {
  ShieldCheck,
  Calendar,
  Bell,
  Users,
  Info,
} from 'lucide-react';
import { CURRENT_ORGANIZER } from '@/lib/mock-data';

interface OrganizerViewProps {
  stats: OrganizerStat[];
  events: HouseEvent[];
  announcements: HouseAnnouncement[];
  roster: EventRegistrationItem[];
  organizerProfile?: {
    displayName: string;
    role: string;
    email?: string | null;
  } | null;
}

export const OrganizerView: React.FC<OrganizerViewProps> = ({
  stats,
  events,
  announcements,
  roster,
  organizerProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'announcements' | 'roster'>(
    'events'
  );

  const orgName = organizerProfile?.displayName || CURRENT_ORGANIZER.name;
  const orgSubtitle = organizerProfile
    ? `${organizerProfile.role.toUpperCase()} • ${organizerProfile.email || 'Verified Administration'}`
    : CURRENT_ORGANIZER.program;
  const orgInitials = orgName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="rounded-2xl bg-[#202631] border border-[#343A49] p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#43E5D2]" />
                Organizer Console
              </span>
              <span className="text-xs text-[#A0A6B8] font-mono">IIT Madras BS Community Administration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#F3F0E8]">
              Campus Activities &amp; House Operations
            </h1>
            <p className="text-sm text-[#A0A6B8] max-w-2xl leading-relaxed">
              Administrative portal for managing flagship events (PARADOX &amp; SAAVAN), society workshops, and recording inter-house competition results.
            </p>
          </div>

          {/* Organizer Session Profile */}
          <div className="p-3.5 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#F3F0E8] shrink-0 self-start sm:self-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#202631] border border-[#43E5D2]/40 flex items-center justify-center font-black text-xs text-[#43E5D2]">
                {orgInitials}
              </div>
              <div>
                <p className="font-bold text-[#F3F0E8]">{orgName}</p>
                <p className="text-[11px] text-[#A0A6B8] truncate max-w-[200px]">
                  {orgSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Advisory Notice */}
        <div className="p-3.5 rounded-xl bg-[#101116] border border-[#43E5D2]/30 flex items-start gap-2.5 text-xs text-[#A0A6B8]">
          <Info className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#F3F0E8]">Operations Notice:</strong> Centralized flagships, society sessions, and inter-house competitions are fully configurable. Results published here update the Community Cup demonstration feed.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <OrganizerStatsBar stats={stats} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#343A49] pb-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
              : 'text-[#A0A6B8] hover:text-[#F3F0E8] hover:bg-[#202631]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events &amp; Competitions ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
              : 'text-[#A0A6B8] hover:text-[#F3F0E8] hover:bg-[#202631]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Campus Notices ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
              : 'text-[#A0A6B8] hover:text-[#F3F0E8] hover:bg-[#202631]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Attendance &amp; Roster ({roster.length})</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="pt-2">
        {activeTab === 'events' && <OrganizerEventsTable events={events} />}
        {activeTab === 'announcements' && (
          <OrganizerAnnouncementsManager announcements={announcements} />
        )}
        {activeTab === 'roster' && (
          <OrganizerRosterTable initialRoster={roster} />
        )}
      </div>
    </div>
  );
};
