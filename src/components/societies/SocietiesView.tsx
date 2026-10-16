'use client';

import React, { useState } from 'react';
import { Society } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Compass, Calendar, X } from 'lucide-react';
import { getSocietyCategories } from '@/lib/data/societies';

interface SocietiesViewProps {
  societies: Society[];
  isLive?: boolean;
}

export const SocietiesView: React.FC<SocietiesViewProps> = ({ societies, isLive = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = getSocietyCategories();

  const filteredSocieties = societies.filter((society) => {
    // Category filter
    if (selectedCategory !== 'All' && society.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesName = society.name.toLowerCase().includes(q);
      const matchesFull = society.fullName.toLowerCase().includes(q);
      const matchesDesc = society.description.toLowerCase().includes(q);
      const matchesCat = society.category.toLowerCase().includes(q);
      const matchesId = society.id.toLowerCase().includes(q);

      if (!matchesName && !matchesFull && !matchesDesc && !matchesCat && !matchesId) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#43E5D2] bg-[#202631] px-3 py-1 rounded-full border border-[#43E5D2]/30 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-[#43E5D2]" />
              Student Co-Curricular Directory
            </span>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#43E5D2] font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#43E5D2] animate-pulse" />
                Live Supabase Sync ({societies.length})
              </span>
            ) : (
              <span className="text-xs text-[#9EA8B6] font-mono">{societies.length} Verified Societies</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#F3F0E8]">
            Clubs &amp; Societies
          </h1>
          <p className="text-sm text-[#9EA8B6] mt-1">
            Student-run technical, cultural, competitive, and research societies powering IIT Madras BS campus activities.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EA8B6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 30 societies by name, category, or UUID..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#202631] border border-[#343A49] text-sm text-[#F3F0E8] placeholder-[#9EA8B6] focus:outline-none focus:ring-2 focus:ring-[#43E5D2] focus:border-[#43E5D2] transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EA8B6] hover:text-[#F3F0E8]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="space-y-3 pt-2 border-t border-[#343A49]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#43E5D2] text-[#101116] shadow-sm'
                : 'bg-[#202631] text-[#9EA8B6] hover:text-[#F3F0E8] hover:bg-[#28303E] border border-[#343A49]'
            }`}
          >
            All Societies ({societies.length})
          </button>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            const count = societies.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#43E5D2] text-[#101116] shadow-sm'
                    : 'bg-[#202631] text-[#9EA8B6] hover:text-[#F3F0E8] hover:bg-[#28303E] border border-[#343A49]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-[#9EA8B6] pt-1">
          <span>
            Showing <strong className="text-[#F3F0E8]">{filteredSocieties.length}</strong> of{' '}
            {societies.length} societies
          </span>
          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-[#43E5D2] hover:underline font-bold cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Societies Grid or Empty State */}
      {filteredSocieties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSocieties.map((society) => (
            <div
              key={society.id}
              className="p-5 rounded-2xl flex flex-col justify-between bg-[#202631] border border-[#343A49] hover:border-[#43E5D2]/50 transition-all group shadow-xs hover:shadow-[0_0_20px_rgba(67,229,210,0.1)]"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm border"
                    style={{
                      backgroundColor: `${society.accentColor}20`,
                      borderColor: `${society.accentColor}50`,
                      color: society.accentColor,
                    }}
                  >
                    {society.badgeCode}
                  </span>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-mono font-medium text-[#43E5D2] bg-[#43E5D2]/10 px-2.5 py-0.5 rounded-full border border-[#43E5D2]/30">
                      {society.category}
                    </span>
                    {society.id && (
                      <span
                        className="text-[10px] font-mono text-[#9EA8B6] tracking-tight"
                        title={`Supabase Database UUID: ${society.id}`}
                      >
                        UUID: {society.id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#F3F0E8] group-hover:text-[#43E5D2] transition-colors">
                    {society.name}
                  </h3>
                  <p className="text-[11px] text-[#9EA8B6] font-mono mt-0.5">
                    {society.fullName}
                  </p>
                  <p className="text-xs text-[#9EA8B6] mt-2 line-clamp-2 leading-relaxed">
                    {society.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#343A49] flex items-center justify-between text-xs text-[#9EA8B6]">
                <span className="flex items-center gap-1.5 text-[11px]" title="Demo event metric — live event relations not yet wired">
                  <Calendar className="w-3.5 h-3.5 text-[#43E5D2]" />
                  <span><strong className="text-[#F3F0E8]">{society.activeEventsCount}</strong> upcoming (demo)</span>
                </span>
                <span className="text-[11px] text-[#43E5D2] font-mono font-bold">
                  Verified Society
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title={societies.length === 0 ? "No societies registered" : "No societies found"}
          description={
            societies.length === 0
              ? "The database returned zero society records. Check seed data or database connectivity."
              : "Try adjusting your category selection or removing search keywords."
          }
          actionLabel={societies.length === 0 ? undefined : "Clear all filters"}
          onAction={societies.length === 0 ? undefined : resetFilters}
        />
      )}
    </div>
  );
};
