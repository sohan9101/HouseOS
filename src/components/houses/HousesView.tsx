'use client';

import React, { useState } from 'react';
import { House, HouseStanding } from '@/types';
import { Search, Building2, Users, Trophy, Info, Sparkles, LayoutGrid, Orbit } from 'lucide-react';
import { TechfestConstellation3D } from '@/components/dashboard/TechfestConstellation3D';

interface HousesViewProps {
  houses: House[];
  standings: HouseStanding[];
  isLive?: boolean;
}

export const HousesView: React.FC<HousesViewProps> = ({ houses, standings, isLive = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'constellation'>('grid');

  const filteredHouses = houses.filter((house) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      house.name.toLowerCase().includes(q) ||
      house.zone.toLowerCase().includes(q) ||
      house.code.toLowerCase().includes(q) ||
      house.id.toLowerCase().includes(q)
    );
  });

  const getHouseStanding = (houseName: string) => {
    const clean = houseName.toLowerCase().replace(/ house$/i, '').trim();
    return standings.find(
      (s) => s.houseName.toLowerCase().replace(/ house$/i, '').trim() === clean
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#43E5D2] bg-[#202631] px-3 py-1 rounded-full border border-[#43E5D2]/30 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-[#43E5D2]" />
              Official 12 Houses Directory
            </span>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#43E5D2] font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#43E5D2] animate-pulse" />
                Live Supabase Sync
              </span>
            ) : (
              <span className="text-xs text-[#9EA8B6] font-mono">IIT Madras BS Community</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#F3F0E8]">
            The 12 Houses of IITM BS
          </h1>
          <p className="text-sm text-[#9EA8B6] mt-1">
            Every enrolled student belongs to one of the 12 official houses for campus gatherings, sports, and cultural tournaments.
          </p>
        </div>

        {/* View Switcher & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#202631] border border-[#343A49] text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#43E5D2] text-[#101116] shadow-sm'
                  : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
            <button
              onClick={() => setViewMode('constellation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'constellation'
                  ? 'bg-[#8B7CFF] text-[#101116] shadow-sm'
                  : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Constellation</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EA8B6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search house by name, code..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#202631] border border-[#343A49] text-sm text-[#F3F0E8] placeholder-[#9EA8B6] focus:outline-none focus:ring-2 focus:ring-[#43E5D2] focus:border-[#43E5D2] transition-colors shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Notice regarding official logos and authentic representation */}
      <div className="p-4 rounded-2xl bg-[#202631] border border-[#343A49] flex items-start gap-3 text-xs text-[#9EA8B6] shadow-xs">
        <Info className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#F3F0E8]">Canonical Directory Notice:</strong> All 12 IIT Madras BS houses are synchronized live from the Supabase database with authoritative record UUIDs. Visual crest colorways and regional zone labels are paired by canonical name, while resident headcounts reflect illustrative Phase 1 demo values pending Phase 2B student roster synchronization.
        </p>
      </div>

      {/* Constellation Interactive View */}
      {viewMode === 'constellation' && (
        <div className="space-y-4">
          <div className="relative rounded-2xl bg-[#101116] border border-[#343A49] overflow-hidden min-h-[460px] flex items-center justify-center shadow-2xl">
            <TechfestConstellation3D houses={houses} />
            <div className="absolute top-4 left-4 z-10 p-3 rounded-xl bg-[#202631]/90 border border-[#343A49] backdrop-blur-md text-xs text-[#9EA8B6] max-w-xs">
              <p className="font-bold text-[#43E5D2] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#43E5D2]" />
                Interactive 12-House Constellation
              </p>
              <p className="text-[11px] mt-1 leading-snug">
                Rotate with mouse or touch. Glowing nodes represent the 12 houses linked into one campus universe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Houses Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHouses.map((house, idx) => {
          const standing = getHouseStanding(house.name);
          const isCurrent =
            house.name.toLowerCase().includes('saranda') ||
            house.id === '54c113c2-f998-44d8-a45e-1f6cd344e42c' ||
            house.id === 'house-saranda';

          return (
            <div
              key={house.id}
              className={`p-5 rounded-2xl flex flex-col justify-between border bg-[#202631] transition-all group ${
                isCurrent
                  ? 'border-[#43E5D2]/60 shadow-[0_0_20px_rgba(67,229,210,0.15)] ring-1 ring-[#43E5D2]/30'
                  : 'border-[#343A49] hover:border-[#475063] hover:bg-[#28303E]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  {/* Clean Fallback Crest Container */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-md border"
                    style={{
                      backgroundColor: `${house.colorHex}20`,
                      borderColor: `${house.colorHex}50`,
                      color: house.accentHex || '#43E5D2',
                    }}
                  >
                    {house.code}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#9EA8B6] block">
                      #{idx + 1} House
                    </span>
                    <span
                      className="text-[10px] font-mono text-[#43E5D2]/80 block"
                      title={`Supabase Database UUID: ${house.id}`}
                    >
                      UUID: {house.id.slice(0, 8)}...
                    </span>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#43E5D2]/20 text-[#43E5D2] border border-[#43E5D2]/40">
                        Your House
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#F3F0E8] group-hover:text-[#43E5D2] transition-colors tracking-tight">
                    {house.name}
                  </h3>
                  <p className="text-xs text-[#9EA8B6] mt-0.5 font-mono">
                    {house.zone} • IIT Madras BS
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#343A49] text-xs">
                  <div className="p-2.5 rounded-xl bg-[#101116] border border-[#343A49]">
                    <span className="text-[11px] text-[#9EA8B6] block flex items-center gap-1 font-mono">
                      <Users className="w-3.5 h-3.5 text-[#43E5D2]" /> Residents (Demo)
                    </span>
                    <strong className="text-[#F3F0E8] text-sm font-bold font-mono">
                      {house.residentCount}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#101116] border border-[#343A49]">
                    <span className="text-[11px] text-[#9EA8B6] block flex items-center gap-1 font-mono">
                      <Trophy className="w-3.5 h-3.5 text-[#43E5D2]" /> Proposed Rank
                    </span>
                    <strong className="text-[#F3F0E8] text-sm font-bold font-mono">
                      #{standing ? standing.rank : idx + 1}
                      <span className="text-[11px] text-[#9EA8B6] font-normal ml-1">
                        ({standing ? standing.points : 0} pts)
                      </span>
                    </strong>
                  </div>
                </div>
              </div>

              {standing?.recentContribution && (
                <div className="mt-4 pt-3 border-t border-[#343A49] text-[11px] text-[#9EA8B6]">
                  <span className="block truncate font-mono text-[10px]">
                    Recent: <strong className="text-[#F3F0E8]">{standing.recentContribution}</strong>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
