'use client';

import React, { useState } from 'react';
import { CompetitionScoreBreakdown } from '@/types';
import { Badge } from '@/components/ui/Badge';
import {
  Trophy,
  Award,
  Info,
  Layers,
} from 'lucide-react';
import { SCORING_POLICY, getStandingsByTerm } from '@/lib/data/standings';
import { createClient } from '@/lib/supabase/client';

interface StandingsViewProps {
  initialCompetitions: CompetitionScoreBreakdown[];
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  initialCompetitions,
}) => {
  const [activeTerm, setActiveTerm] = useState<'Sep' | 'May' | 'Jan' | 'all'>('Sep');
  const [userHouseName, setUserHouseName] = useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('houses(name)')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            const raw = data?.houses as { name: string } | null;
            if (raw?.name) {
              setUserHouseName(raw.name);
            }
          });
      }
    }).catch(() => {});
  }, []);

  const rawStandings = getStandingsByTerm(activeTerm);
  const currentStandings = rawStandings.map((standing) => ({
    ...standing,
    isCurrentHouse: userHouseName
      ? standing.houseName.toLowerCase().replace(/ house$/i, '').trim() ===
        userHouseName.toLowerCase().replace(/ house$/i, '').trim()
      : false,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#202631] border border-[#343A49] p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30 shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-[#43E5D2]" />
                Proposed Feature Demonstration
              </span>
              <span className="text-xs text-[#9EA8B6] font-mono">12 Houses</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#F3F0E8]">
              HouseOS Community Cup Leaderboard
            </h1>
            <p className="text-sm text-[#9EA8B6] max-w-2xl mt-1 leading-relaxed">
              An illustrative, proposed inter-house championship model celebrating verified club, sports, and technical competition participation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101116] border border-[#343A49] text-xs text-[#F3F0E8] shrink-0">
            <span className="text-[11px] text-[#9EA8B6] font-mono block">Current Leader</span>
            <strong className="text-base text-[#43E5D2] block mt-0.5">
              {currentStandings[0]?.houseName}
            </strong>
            <span className="text-[#8B7CFF] font-mono font-bold text-xs">
              {currentStandings[0]?.points} points
            </span>
          </div>
        </div>

        {/* Mandatory Transparency Notice */}
        <div className="p-3.5 rounded-xl bg-[#101116] border border-[#43E5D2]/30 text-xs text-[#9EA8B6] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#F3F0E8]">Demonstration Only:</strong> No official house leaderboard or scoring policy has been approved by the institute. This leaderboard uses deterministic sample data to illustrate how points could be credited transparently for Phase 1.
          </p>
        </div>
      </div>

      {/* Proposed Scoring Rules Card */}
      <div className="p-5 rounded-2xl bg-[#202631] border border-[#343A49] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-[#43E5D2]" />
            Proposed Points Policy &amp; Allocation
          </h2>
          <span className="text-[11px] text-[#9EA8B6] font-mono">Verified Results Only</span>
        </div>
        <p className="text-xs text-[#9EA8B6] leading-relaxed">
          Points are awarded deterministically per verified inter-house competition organized by registered societies. Ordinary students cannot edit scores; results are submitted by authorized organizers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#101116] border border-[#43E5D2]/30 text-center">
            <span className="text-xs text-[#43E5D2] font-bold block">1st Place</span>
            <strong className="text-2xl text-[#F3F0E8] font-black">+{SCORING_POLICY.FIRST_PLACE}</strong>
            <span className="text-[10px] text-[#9EA8B6] block font-mono">pts</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101116] border border-[#8B7CFF]/30 text-center">
            <span className="text-xs text-[#8B7CFF] font-bold block">2nd Place</span>
            <strong className="text-2xl text-[#F3F0E8] font-black">+{SCORING_POLICY.SECOND_PLACE}</strong>
            <span className="text-[10px] text-[#9EA8B6] block font-mono">pts</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101116] border border-[#FF896D]/30 text-center">
            <span className="text-xs text-[#FF896D] font-bold block">3rd Place</span>
            <strong className="text-2xl text-[#F3F0E8] font-black">+{SCORING_POLICY.THIRD_PLACE}</strong>
            <span className="text-[10px] text-[#9EA8B6] block font-mono">pts</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101116] border border-[#343A49] text-center">
            <span className="text-xs text-[#9EA8B6] font-bold block">Participation</span>
            <strong className="text-2xl text-[#F3F0E8] font-black">+{SCORING_POLICY.PARTICIPATION}</strong>
            <span className="text-[10px] text-[#9EA8B6] block font-mono">pts</span>
          </div>
        </div>
      </div>

      {/* Term History Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#343A49]">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#202631] border border-[#343A49] text-xs">
          <button
            onClick={() => setActiveTerm('Sep')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTerm === 'Sep'
                ? 'bg-[#43E5D2] text-[#101116] shadow-sm'
                : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
            }`}
          >
            Sep 2026 Term (Active)
          </button>
          <button
            onClick={() => setActiveTerm('May')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTerm === 'May'
                ? 'bg-[#43E5D2] text-[#101116] shadow-sm'
                : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
            }`}
          >
            May 2026 Term
          </button>
          <button
            onClick={() => setActiveTerm('Jan')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTerm === 'Jan'
                ? 'bg-[#43E5D2] text-[#101116] shadow-sm'
                : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
            }`}
          >
            Jan 2026 Term
          </button>
          <button
            onClick={() => setActiveTerm('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTerm === 'all'
                ? 'bg-[#43E5D2] text-[#101116] shadow-sm'
                : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
            }`}
          >
            Cumulative (All Terms)
          </button>
        </div>

        <span className="text-xs text-[#9EA8B6] font-mono">
          Showing <strong className="text-[#F3F0E8]">12 Houses</strong> ranked by points
        </span>
      </div>

      {/* 12-House Standings Table */}
      <div className="rounded-2xl border border-[#343A49] bg-[#202631] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F3F0E8]">
            <thead className="bg-[#101116] text-[11px] uppercase tracking-wider text-[#9EA8B6] font-mono border-b border-[#343A49]">
              <tr>
                <th className="px-4 py-3.5 font-bold">Rank</th>
                <th className="px-4 py-3.5 font-bold">House Name</th>
                <th className="px-4 py-3.5 font-bold">Jan Term</th>
                <th className="px-4 py-3.5 font-bold">May Term</th>
                <th className="px-4 py-3.5 font-bold">Sep Term</th>
                <th className="px-4 py-3.5 font-bold">Selected Score</th>
                <th className="px-4 py-3.5 font-bold text-right">Latest Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#343A49]">
              {currentStandings.map((standing) => (
                <tr
                  key={standing.houseName}
                  className={`transition-colors ${
                    standing.isCurrentHouse
                      ? 'bg-[#43E5D2]/10 hover:bg-[#43E5D2]/15'
                      : 'hover:bg-[#28303E]'
                  }`}
                >
                  <td className="px-4 py-3.5 font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black ${
                        standing.rank === 1
                          ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
                          : standing.rank === 2
                          ? 'bg-[#8B7CFF] text-[#101116]'
                          : standing.rank === 3
                          ? 'bg-[#FF896D] text-[#101116]'
                          : 'text-[#9EA8B6]'
                      }`}
                    >
                      #{standing.rank}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-bold text-[#F3F0E8]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: standing.colorHex }}
                      />
                      <span>{standing.houseName}</span>
                      {standing.isCurrentHouse && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#43E5D2]/20 text-[#43E5D2] border border-[#43E5D2]/40">
                          Your House
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-[#9EA8B6] font-mono">
                    {standing.janPoints} pts
                  </td>

                  <td className="px-4 py-3.5 text-[#9EA8B6] font-mono">
                    {standing.mayPoints} pts
                  </td>

                  <td className="px-4 py-3.5 text-[#9EA8B6] font-mono">
                    {standing.sepPoints} pts
                  </td>

                  <td className="px-4 py-3.5 font-black text-[#F3F0E8] text-sm">
                    {standing.points.toLocaleString()}
                    <span className="text-[11px] font-normal text-[#9EA8B6] ml-1">
                      pts
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right text-[11px] text-[#9EA8B6]">
                    <span className="truncate max-w-xs inline-block">
                      {standing.recentContribution}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Breakdown of Contributing Competitions */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8B7CFF]" />
          Sample Breakdown of Contributing Competitions
        </h2>
        <p className="text-xs text-[#9EA8B6]">
          Illustrative breakdown of recent inter-house competitions driving the current scores.
        </p>

        <div className="grid gap-3">
          {initialCompetitions.map((comp) => (
            <div
              key={comp.id}
              className="p-4 rounded-2xl bg-[#202631] border border-[#343A49] text-xs text-[#F3F0E8]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-[#F3F0E8]">
                    {comp.competitionTitle}
                  </h3>
                  <p className="text-[11px] text-[#43E5D2] font-mono">
                    Organized by: {comp.organizingSociety}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="violet" size="sm">
                    {comp.term} Term
                  </Badge>
                  <span className="text-[11px] text-[#9EA8B6] font-mono">{comp.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#343A49] text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#101116] border border-[#43E5D2]/30">
                  <span className="text-[#43E5D2] font-bold block">1st Place (+100 pts)</span>
                  <strong className="text-[#F3F0E8] text-xs">{comp.winnerHouse}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101116] border border-[#8B7CFF]/30">
                  <span className="text-[#8B7CFF] font-bold block">2nd Place (+70 pts)</span>
                  <strong className="text-[#F3F0E8] text-xs">{comp.runnerUpHouse}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101116] border border-[#FF896D]/30">
                  <span className="text-[#FF896D] font-bold block">3rd Place (+50 pts)</span>
                  <strong className="text-[#F3F0E8] text-xs">{comp.thirdHouse}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
