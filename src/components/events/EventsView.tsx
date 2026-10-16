'use client';

import React, { useState } from 'react';
import { HouseEvent, DeliveryMode } from '@/types';
import { EventCard } from './EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Calendar, X, MapPin, Globe, Swords, Sparkles } from 'lucide-react';
import { getEventCategories } from '@/lib/mock-data';

interface EventsViewProps {
  initialEvents: HouseEvent[];
  isLive?: boolean;
}

export const EventsView: React.FC<EventsViewProps> = ({ initialEvents, isLive = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | DeliveryMode>('all');
  const [interHouseOnly, setInterHouseOnly] = useState<boolean>(false);
  const [filterRsvpOnly, setFilterRsvpOnly] = useState<boolean>(false);

  const categories = getEventCategories();

  const hasFlagships = initialEvents.some((e) => e.isFlagship);
  const hasParadox = initialEvents.some((e) => e.flagshipType === 'PARADOX');
  const hasSaavan = initialEvents.some((e) => e.flagshipType === 'SAAVAN');

  const filteredEvents = initialEvents.filter((event) => {
    // Category filter
    if (selectedCategory !== 'All' && event.category !== selectedCategory) {
      return false;
    }

    // Delivery mode filter
    if (deliveryFilter !== 'all' && event.deliveryMode !== deliveryFilter) {
      return false;
    }

    // Inter-house filter
    if (interHouseOnly && !event.isInterHouse) {
      return false;
    }

    // RSVP filter
    if (filterRsvpOnly && !event.isRsvpd) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(query);
      const matchesDesc = event.shortDescription.toLowerCase().includes(query);
      const matchesLoc = event.location.toLowerCase().includes(query);
      const matchesEntity = event.organizingEntity.toLowerCase().includes(query);
      const matchesTags = event.tags.some((t) => t.toLowerCase().includes(query));
      const matchesId = event.id.toLowerCase().includes(query);

      if (
        !matchesTitle &&
        !matchesDesc &&
        !matchesLoc &&
        !matchesEntity &&
        !matchesTags &&
        !matchesId
      ) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setDeliveryFilter('all');
    setInterHouseOnly(false);
    setFilterRsvpOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    deliveryFilter !== 'all' ||
    interHouseOnly ||
    filterRsvpOnly ||
    searchQuery !== '';

  return (
    <div className="space-y-6">
      {/* Header and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#43E5D2] bg-[#202631] px-3 py-1 rounded-full border border-[#43E5D2]/30 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#43E5D2]" />
              Official Campus Events
            </span>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#43E5D2] font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#43E5D2] animate-pulse" />
                Live Supabase Sync ({initialEvents.length})
              </span>
            ) : (
              <span className="text-xs text-[#9EA8B6] font-mono">{initialEvents.length} Events Listed</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#F3F0E8]">
            Campus Events &amp; Festival Lineup
          </h1>
          <p className="text-sm text-[#9EA8B6] mt-1">
            Discover centralized flagships, student society workshops, and inter-house competitions.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EA8B6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PARADOX, SAAVAN, chess..."
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

      {/* Flagship Notice Strip - rendered only when supported by database records */}
      {hasFlagships && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1C1F32] via-[#202631] to-[#101116] border border-[#8B7CFF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9EA8B6] shadow-md">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#43E5D2] shrink-0" />
            <span>
              <strong className="text-[#F3F0E8]">Centralized Flagships Active:</strong>{' '}
              {hasParadox && (
                <>
                  <strong className="text-[#FF896D]">PARADOX</strong> (Offline · On campus)
                </>
              )}
              {hasParadox && hasSaavan && ' & '}
              {hasSaavan && (
                <>
                  <strong className="text-[#8B7CFF]">SAAVAN</strong> (Online Stream)
                </>
              )}{' '}
              are open for registrations.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('Flagship')}
              className="px-3.5 py-1.5 rounded-xl bg-[#8B7CFF] text-[#101116] hover:bg-[#A397FF] text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Filter Flagships
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="space-y-3 pt-2 border-t border-[#343A49]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
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
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Format & Inter-House Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Delivery mode */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#202631] border border-[#343A49] text-xs">
              <button
                onClick={() => setDeliveryFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  deliveryFilter === 'all'
                    ? 'bg-[#28303E] text-[#43E5D2]'
                    : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
                }`}
              >
                All Modes
              </button>
              <button
                onClick={() => setDeliveryFilter('offline')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  deliveryFilter === 'offline'
                    ? 'bg-[#FF896D]/20 text-[#FF896D] border border-[#FF896D]/40'
                    : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
                }`}
              >
                <MapPin className="w-3 h-3 text-[#FF896D]" />
                Offline
              </button>
              <button
                onClick={() => setDeliveryFilter('online')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  deliveryFilter === 'online'
                    ? 'bg-[#43E5D2]/20 text-[#43E5D2] border border-[#43E5D2]/40'
                    : 'text-[#9EA8B6] hover:text-[#F3F0E8]'
                }`}
              >
                <Globe className="w-3 h-3 text-[#43E5D2]" />
                Online
              </button>
            </div>

            {/* Inter-house filter toggle */}
            <button
              onClick={() => setInterHouseOnly(!interHouseOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                interHouseOnly
                  ? 'bg-[#43E5D2]/15 text-[#43E5D2] border-[#43E5D2]/40 shadow-xs'
                  : 'bg-[#202631] text-[#9EA8B6] border-[#343A49] hover:text-[#F3F0E8] hover:bg-[#28303E]'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-[#43E5D2]" />
              <span>Cup Events {interHouseOnly ? '✓' : ''}</span>
            </button>
          </div>

          {/* Quick Toggle for Registered Events */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterRsvpOnly(!filterRsvpOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                filterRsvpOnly
                  ? 'bg-[#43E5D2]/20 text-[#43E5D2] border-[#43E5D2]/40 shadow-xs'
                  : 'bg-[#202631] text-[#9EA8B6] border-[#343A49] hover:text-[#F3F0E8] hover:bg-[#28303E]'
              }`}
            >
              My Registered {filterRsvpOnly ? '✓' : ''}
            </button>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-[#9EA8B6] pt-1">
          <span>
            Showing <strong className="text-[#F3F0E8]">{filteredEvents.length}</strong> of{' '}
            {initialEvents.length} campus events
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#43E5D2] hover:underline font-bold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Events Grid or Empty State */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={initialEvents.length === 0 ? "No published events found" : "No campus events match your criteria"}
          description={
            initialEvents.length === 0
              ? "There are currently no published campus events in the live database. Check back soon as organizers announce new activities."
              : "Try adjusting your format selection, toggling off the inter-house filter, or clearing your search keywords."
          }
          actionLabel={initialEvents.length === 0 ? undefined : "Clear all filters"}
          onAction={initialEvents.length === 0 ? undefined : resetFilters}
        />
      )}
    </div>
  );
};
