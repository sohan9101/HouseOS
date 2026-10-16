import React from 'react';
import Link from 'next/link';
import { HouseEvent } from '@/types';
import { Calendar, MapPin, Users, ArrowRight, Award, Globe, Swords, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface UpcomingEventsListProps {
  events: HouseEvent[];
}

export const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({ events }) => {
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'Flagship':
        return 'acid';
      case 'Technical & Coding':
        return 'cyan';
      case 'Sports & eSports':
        return 'acid';
      case 'Debate & Literary':
        return 'violet';
      case 'Cultural & Arts':
        return 'coral';
      case 'Wellness & Community':
        return 'acid';
      case 'Academic & Research':
        return 'violet';
      default:
        return 'dark';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#43E5D2]" />
            Campus Gatherings &amp; Tournaments
          </h2>
          <p className="text-xs text-[#9EA8B6] mt-0.5">
            Active competitions and sessions hosted across societies and houses
          </p>
        </div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#43E5D2] hover:underline transition-colors"
        >
          <span>All Events ({events.length + 2})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid gap-3.5">
        {events.map((event, index) => {
          const hasFiniteCapacity = typeof event.capacity === 'number' && event.capacity > 0;
          const fillPercentage = hasFiniteCapacity
            ? Math.min(100, Math.max(0, Math.round(((event.registeredCount || 0) / event.capacity) * 100)))
            : 0;
          const isFeatured = index === 0;

          return (
            <div
              key={event.id}
              className={`rounded-2xl transition-all border ${
                isFeatured
                  ? 'bg-gradient-to-r from-[#1B2232] via-[#202631] to-[#171B24] border-[#43E5D2]/40 p-5 shadow-lg hover:border-[#43E5D2]'
                  : 'bg-[#202631] border-[#343A49] p-4 hover:border-[#475063] hover:bg-[#28303E]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getCategoryBadgeVariant(event.category)} size="sm">
                      {event.category}
                    </Badge>

                    {/* Delivery Mode Badge */}
                    {event.deliveryMode === 'offline' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/30">
                        <MapPin className="w-3 h-3 text-[#FF896D]" />
                        Offline
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30">
                        <Globe className="w-3 h-3 text-[#43E5D2]" />
                        Online
                      </span>
                    )}

                    {/* Inter-house competition flag */}
                    {event.isInterHouse && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#43E5D2] bg-[#43E5D2]/10 px-2 py-0.5 rounded-full border border-[#43E5D2]/30">
                        <Swords className="w-3 h-3 text-[#43E5D2]" />
                        Inter-House
                      </span>
                    )}

                    {event.isRsvpd && (
                      <span className="text-[11px] font-bold text-[#43E5D2] bg-[#202631] px-2.5 py-0.5 rounded-full border border-[#43E5D2]/40 shadow-xs">
                        ✓ Registered
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#8B7CFF] bg-[#8B7CFF]/15 px-2 py-0.5 rounded-full border border-[#8B7CFF]/30">
                      <Award className="w-3 h-3 text-[#8B7CFF]" />
                      +{event.housePoints} pts
                    </span>
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className="block group focus:outline-none"
                  >
                    <h3 className={`font-black text-[#F3F0E8] group-hover:text-[#43E5D2] transition-colors ${
                      isFeatured ? 'text-lg sm:text-xl' : 'text-base'
                    }`}>
                      {event.title}
                    </h3>
                    <p className="text-xs text-[#9EA8B6] line-clamp-2 mt-1 leading-relaxed">
                      {event.shortDescription}
                    </p>
                  </Link>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#9EA8B6] pt-1">
                    <span className="flex items-center gap-1.5 text-[#F3F0E8] font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#43E5D2]" />
                      {event.date} • {event.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#43E5D2]" />
                      {event.location}
                    </span>
                    <span className="text-[#8B7CFF] hidden sm:inline font-mono">
                      Org: {event.organizingEntity}
                    </span>
                  </div>
                </div>

                {/* Action and capacity */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#343A49]">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-[#9EA8B6] justify-end">
                      <Users className="w-3.5 h-3.5 text-[#9EA8B6]" />
                      <span>
                        <strong className="text-[#F3F0E8]">{event.registeredCount ?? 0}</strong>
                        {hasFiniteCapacity ? ` / ${event.capacity}` : ' attendees'}
                      </span>
                    </div>
                    {hasFiniteCapacity ? (
                      <div className="w-24 bg-[#101116] rounded-full h-1.5 mt-1.5 overflow-hidden ml-auto hidden sm:block border border-[#343A49]">
                        <div
                          className={`h-1.5 rounded-full ${fillPercentage >= 90 ? 'bg-[#FF896D]' : 'bg-[#43E5D2]'}`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-[#43E5D2] hidden sm:block mt-0.5">
                        Open Capacity
                      </span>
                    )}
                  </div>

                  <Link href={`/events/${event.id}`}>
                    <span className="inline-flex items-center justify-center text-xs font-bold rounded-xl px-3.5 py-1.5 bg-[#28303E] hover:bg-[#43E5D2] text-[#F3F0E8] hover:text-[#101116] border border-[#343A49] hover:border-[#43E5D2] transition-all shadow-xs">
                      View Details
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
