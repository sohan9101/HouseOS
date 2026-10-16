import React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { StandingsView } from '@/components/standings/StandingsView';
import { getSampleCompetitions } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Community Cup Standings (Proposed) — HouseOS',
  description: 'Proposed Community Cup leaderboard across all 12 houses with term history and competition breakdowns.',
};

export default function StandingsPage() {
  const competitions = getSampleCompetitions();

  return (
    <AppShell>
      <StandingsView initialCompetitions={competitions} />
    </AppShell>
  );
}
