'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HouseStanding } from '@/types';
import { Trophy, ArrowRight, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HouseStandingsCardProps {
  standings: HouseStanding[];
  currentUserHouseName?: string | null;
}

export const HouseStandingsCard: React.FC<HouseStandingsCardProps> = ({
  standings,
  currentUserHouseName: initialHouseName,
}) => {
  const [fetchedHouseName, setFetchedHouseName] = useState<string | null>(null);
  const userHouseName = initialHouseName !== undefined ? initialHouseName : fetchedHouseName;

  useEffect(() => {
    if (initialHouseName !== undefined) return;

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
              setFetchedHouseName(raw.name);
            }
          });
      }
    }).catch(() => {});
  }, [initialHouseName]);

  const topHouses = standings.slice(0, 4).map((standing) => {
    const isCurrent = userHouseName
      ? standing.houseName.toLowerCase().replace(/ house$/i, '').trim() ===
        userHouseName.toLowerCase().replace(/ house$/i, '').trim()
      : false;
    return {
      ...standing,
      isCurrentHouse: isCurrent,
    };
  });

  return (
    <div id="house-standings" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#43E5D2]" />
            Community Cup Leaderboard
          </h2>
          <p className="text-xs text-[#9EA8B6] mt-0.5">
            Proposed inter-house activity standings across all 12 houses (Sep 2026 Term)
          </p>
        </div>
        <Link
          href="/standings"
          className="text-xs text-[#43E5D2] hover:underline font-bold inline-flex items-center gap-1.5"
        >
          <span>All 12 Houses</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="p-3 rounded-xl bg-[#202631] border border-[#343A49] text-[11px] text-[#9EA8B6] flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#F3F0E8]">Proposed Demo Scoring:</strong> Illustrative points model (1st: 100, 2nd: 70, 3rd: 50, Participation: 10). Not an official campus policy.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden divide-y divide-[#343A49] bg-[#202631] border border-[#343A49]">
        {topHouses.map((standing) => {
          return (
            <div
              key={standing.houseName}
              className={`p-4 transition-colors ${
                standing.isCurrentHouse
                  ? 'bg-[#43E5D2]/10 hover:bg-[#43E5D2]/15'
                  : 'hover:bg-[#28303E]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      standing.rank === 1
                        ? 'bg-[#43E5D2] text-[#101116] shadow-xs'
                        : standing.rank === 2
                        ? 'bg-[#8B7CFF] text-[#101116]'
                        : standing.rank === 3
                        ? 'bg-[#FF896D] text-[#101116]'
                        : 'bg-[#28303E] text-[#9EA8B6] border border-[#343A49]'
                    }`}
                  >
                    #{standing.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          standing.isCurrentHouse
                            ? 'text-[#43E5D2]'
                            : 'text-[#F3F0E8]'
                        }`}
                      >
                        {standing.houseName}
                      </span>
                      {standing.isCurrentHouse && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#43E5D2]/20 text-[#43E5D2] border border-[#43E5D2]/40">
                          Your House
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9EA8B6]">
                      {standing.recentContribution}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-[#F3F0E8] tracking-tight">
                    {standing.points.toLocaleString()}
                    <span className="text-xs font-normal text-[#9EA8B6] ml-1">pts</span>
                  </div>
                  <div className="text-[11px] text-[#43E5D2] font-mono font-bold">
                    +{standing.pointsThisWeek} this week
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="p-3 bg-[#181D26] text-center">
          <Link
            href="/standings"
            className="text-xs font-bold text-[#43E5D2] hover:underline inline-flex items-center gap-1.5 transition-colors"
          >
            <span>View Full 12-House Standings &amp; Scoring Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
