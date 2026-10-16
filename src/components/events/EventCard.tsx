'use client';

import React from 'react';
import Link from 'next/link';
import { HouseEvent } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  Globe,
  Swords,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface EventCardProps {
  event: HouseEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isRsvpd = event.isRsvpd || false;
  const registeredCount = event.registeredCount;

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

  const fillPercentage = event.capacity > 0 ? Math.round((registeredCount / event.capacity) * 100) : 0;
  const isAtCapacity = event.capacity > 0 ? registeredCount >= event.capacity : false;
  const isFlagship = event.isFlagship;
  const isUuid = event.id.length > 20 && /^[0-9a-f-]{36}$/i.test(event.id);

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-2xl transition-all border group ${
        isFlagship
          ? 'bg-gradient-to-br from-[#1C1F32] via-[#202631] to-[#101116] border-[#8B7CFF]/50 shadow-lg hover:shadow-[0_0_24px_rgba(139,124,255,0.2)]'
          : 'bg-[#202631] border-[#343A49] hover:border-[#475063] hover:bg-[#28303E] shadow-xs'
      }`}
    >
      <div className="space-y-3.5">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={getCategoryBadgeVariant(event.category)} size="sm">
              {event.category}
            </Badge>

            {/* Delivery mode */}
            {event.deliveryMode === 'offline' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/30">
                <MapPin className="w-3 h-3 text-[#FF896D]" />
                Offline
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30">
                <Globe className="w-3 h-3 text-[#43E5D2]" />
                Online
              </span>
            )}

            {/* Inter-House badge */}
            {event.isInterHouse && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#43E5D2] bg-[#43E5D2]/10 px-2 py-0.5 rounded-full border border-[#43E5D2]/30">
                <Swords className="w-3 h-3 text-[#43E5D2]" />
                Cup Event
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isRsvpd && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#43E5D2] bg-[#202631] px-2 py-0.5 rounded-full border border-[#43E5D2]/40">
                <CheckCircle2 className="w-3 h-3 text-[#43E5D2]" />
                RSVP’d
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#8B7CFF] bg-[#8B7CFF]/15 px-2 py-0.5 rounded-full border border-[#8B7CFF]/30">
              <Award className="w-3 h-3 text-[#8B7CFF]" />
              +{event.housePoints} pts
            </span>
          </div>
        </div>

        {/* Title and Short Description */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <Link href={`/events/${event.slug || event.id}`} className="focus:outline-none flex-1">
              <h3 className="text-base font-black text-[#F3F0E8] group-hover:text-[#43E5D2] transition-colors line-clamp-1">
                {event.title}
              </h3>
            </Link>
            {isUuid && (
              <span
                className="text-[10px] font-mono text-[#9EA8B6] shrink-0"
                title={`Database UUID: ${event.id}`}
              >
                UUID: {event.id.slice(0, 8)}...
              </span>
            )}
          </div>
          <p className="text-xs text-[#9EA8B6] mt-1.5 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>

        {/* Event Meta Details */}
        <div className="space-y-1.5 text-xs text-[#9EA8B6] pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#43E5D2] shrink-0" />
            <span className="text-[#F3F0E8] font-semibold">{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#9EA8B6] shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#43E5D2] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 text-[11px] border-t border-[#343A49]">
            <span className="text-[#9EA8B6] truncate font-mono">
              By: <strong className="text-[#F3F0E8]">{event.organizingEntity}</strong>
            </span>
            <span className="text-[#8B7CFF] shrink-0 font-mono font-semibold">{event.term} Term</span>
          </div>
        </div>
      </div>

      {/* Footer: Capacity and Actions */}
      <div className="mt-5 pt-3.5 border-t border-[#343A49] space-y-3">
        {/* Capacity Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#9EA8B6] mb-1.5">
            <span className="flex items-center gap-1 text-[11px]">
              <Users className="w-3 h-3 text-[#9EA8B6]" />
              <span>
                {event.capacity > 0 ? (
                  <>
                    <strong className="text-[#F3F0E8]">{registeredCount}</strong> / {event.capacity} registered (demo)
                  </>
                ) : (
                  <span className="text-[#F3F0E8] font-semibold">Open Attendance</span>
                )}
              </span>
            </span>
            <span className="text-[11px] font-mono text-[#43E5D2]">
              {event.capacity > 0
                ? isAtCapacity
                  ? 'Full'
                  : `${event.capacity - registeredCount} spots left`
                : 'Unlimited'}
            </span>
          </div>
          <div className="w-full bg-[#101116] rounded-full h-1.5 overflow-hidden border border-[#343A49]">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                fillPercentage >= 90
                  ? 'bg-[#FF896D]'
                  : 'bg-[#43E5D2]'
              }`}
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/events/${event.slug || event.id}`} className="flex-1">
            <Button
              variant={isRsvpd ? 'outline' : 'primary'}
              size="sm"
              fullWidth
              className={`font-bold ${
                isRsvpd
                  ? 'border-[#43E5D2]/40 text-[#43E5D2] bg-[#202631] hover:bg-[#28303E]'
                  : 'bg-[#43E5D2] hover:bg-[#35D6C3] text-[#101116] border-none shadow-xs'
              }`}
              disabled={!isRsvpd && isAtCapacity}
            >
              {isRsvpd ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#43E5D2]" />
                  Pass Reserved
                </>
              ) : isAtCapacity ? (
                'Capacity Full'
              ) : (
                <>
                  <span>Reserve Pass</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </Button>
          </Link>

          <Link href={`/events/${event.slug || event.id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="px-3 bg-[#202631] border-[#343A49] text-[#F3F0E8] hover:bg-[#28303E] hover:text-[#43E5D2]"
              title="View event details & schedule"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
