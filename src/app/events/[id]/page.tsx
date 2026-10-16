import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { EventDetailRsvpCard } from '@/components/events/EventDetailRsvpCard';
import { Badge } from '@/components/ui/Badge';
import { getEvents, getEventById } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isUuid, DbEventRow, formatDbEventToHouseEvent } from '@/lib/data/events';
import { HouseEvent } from '@/types';
import type { EventRegistrationStats } from '@/app/events/actions';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  User,
  CheckCircle,
  Award,
  ListOrdered,
  Globe,
  Swords,
} from 'lucide-react';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  const events = getEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

async function resolveEvent(
  idOrSlug: string,
  supabaseClient?: Awaited<ReturnType<typeof createClient>>
): Promise<HouseEvent | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = supabaseClient ?? (await createClient());
      let query = supabase
        .from('events')
        .select(
          'id, slug, title, description, organizer_type, organizer_name, format, venue, starts_at, ends_at, capacity, status, house_points'
        );

      if (isUuid(idOrSlug)) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return formatDbEventToHouseEvent(data as DbEventRow);
      }
    } catch {
      // fallback to static records
    }
  }

  return getEventById(idOrSlug);
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await resolveEvent(id);

  if (!event) {
    return {
      title: 'Event Not Found — HouseOS',
    };
  }

  return {
    title: `${event.title} — HouseOS`,
    description: event.shortDescription,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  let user = null;
  let userRole: string | null = null;
  let initialStats: EventRegistrationStats | null = null;

  if (isSupabaseConfigured()) {
    try {
      supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser ?? null;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        userRole = profile?.role ?? 'student';
      }
    } catch (authErr: unknown) {
      // Non-blocking: during Next.js static prerendering, cookies() throws expected bailout
      const err = authErr as { digest?: string; message?: string };
      if (err?.digest !== 'HANGING_PROMISE_REJECTION' && !err?.message?.includes('cookies()')) {
        console.warn('[EventDetailPage] Auth context check failed:', authErr);
      }
    }
  }

  const event = await resolveEvent(id, supabase ?? undefined);

  if (!event) {
    notFound();
  }

  // Load authoritative registration statistics from Supabase RPC if event is database-backed (UUID)
  if (supabase && isUuid(event.id)) {
    try {
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_event_registration_stats',
        { p_event_id: event.id }
      );

      if (!statsError && statsData) {
        const res = statsData as Record<string, unknown>;
        if (res.success) {
          initialStats = {
            success: true,
            eventId: event.id,
            capacity: typeof res.capacity === 'number' ? res.capacity : null,
            activeRegistrations:
              typeof res.active_registrations === 'number'
                ? res.active_registrations
                : 0,
            spotsLeft: typeof res.spots_left === 'number' ? res.spots_left : null,
            isFull: Boolean(res.is_full),
            userRegistrationStatus:
              (res.user_registration_status as 'registered' | 'cancelled' | null) ||
              null,
          };
        }
      }
    } catch (statsErr) {
      console.warn('[EventDetailPage] Live statistics fetch failed:', statsErr);
    }
  }

  // Fallback initialStats for mock / un-seeded events
  if (!initialStats) {
    const cap = typeof event.capacity === 'number' && event.capacity > 0 ? event.capacity : null;
    const regCount = event.registeredCount ?? 0;
    initialStats = {
      success: true,
      eventId: event.id,
      capacity: cap,
      activeRegistrations: regCount,
      spotsLeft: cap !== null ? Math.max(0, cap - regCount) : null,
      isFull: cap !== null ? regCount >= cap : false,
      userRegistrationStatus: event.isRsvpd ? 'registered' : null,
    };
  }

  const hydratedEvent: HouseEvent = {
    ...event,
    isRsvpd: initialStats.userRegistrationStatus === 'registered',
    registeredCount: initialStats.activeRegistrations,
  };

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
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9EA8B6] hover:text-[#43E5D2] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#9EA8B6] group-hover:-translate-x-0.5 group-hover:text-[#43E5D2] transition-transform" />
            <span>Back to Campus Events Lineup</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="rounded-2xl bg-[#202631] border border-[#343A49] p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getCategoryBadgeVariant(event.category)} size="md">
              {event.category}
            </Badge>

            {/* Delivery mode */}
            {event.deliveryMode === 'offline' ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/30">
                <MapPin className="w-3.5 h-3.5 text-[#FF896D]" />
                Offline · On campus
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30">
                <Globe className="w-3.5 h-3.5 text-[#43E5D2]" />
                Online Stream
              </span>
            )}

            {/* Inter-house competition flag */}
            {event.isInterHouse && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#43E5D2] bg-[#43E5D2]/10 px-2.5 py-1 rounded-full border border-[#43E5D2]/30">
                <Swords className="w-3.5 h-3.5 text-[#43E5D2]" />
                Inter-House Competition
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#8B7CFF] bg-[#8B7CFF]/15 px-2.5 py-1 rounded-full border border-[#8B7CFF]/30">
              <Award className="w-3.5 h-3.5 text-[#8B7CFF]" />
              +{event.housePoints} Community Cup Points
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F3F0E8] tracking-tight leading-tight">
            {event.title}
          </h1>

          <p className="text-sm sm:text-base text-[#9EA8B6] max-w-3xl leading-relaxed">
            {event.shortDescription}
          </p>

          {/* Quick Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#343A49] text-xs">
            <div className="flex items-center gap-2.5 text-[#9EA8B6]">
              <div className="p-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#43E5D2]">
                <Calendar className="w-4 h-4 text-[#43E5D2]" />
              </div>
              <div>
                <p className="text-[11px] text-[#9EA8B6] font-mono">Date &amp; Term</p>
                <p className="font-bold text-[#F3F0E8]">{event.date} • {event.term} Term</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#9EA8B6]">
              <div className="p-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#43E5D2]">
                <Clock className="w-4 h-4 text-[#43E5D2]" />
              </div>
              <div>
                <p className="text-[11px] text-[#9EA8B6] font-mono">Schedule Time</p>
                <p className="font-bold text-[#F3F0E8]">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#9EA8B6]">
              <div className="p-2 rounded-xl bg-[#101116] border border-[#343A49] text-[#FF896D]">
                <MapPin className="w-4 h-4 text-[#FF896D]" />
              </div>
              <div>
                <p className="text-[11px] text-[#9EA8B6] font-mono">Venue / Channel</p>
                <p className="font-bold text-[#F3F0E8] truncate">{event.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Details Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* About Section */}
            <div className="p-6 rounded-2xl space-y-3 bg-[#202631] border border-[#343A49]">
              <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight">
                About this Activity
              </h2>
              <p className="text-sm text-[#9EA8B6] leading-relaxed">
                {event.fullDescription}
              </p>

              {/* Tag Cloud */}
              <div className="pt-3 flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#101116] text-[#43E5D2] border border-[#343A49] font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Inter-house competition details (if applicable) */}
            {event.isInterHouse && (
              <div className="p-6 rounded-2xl space-y-3 border border-[#43E5D2]/30 bg-[#43E5D2]/5">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-[#43E5D2]" />
                  <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight">
                    Inter-House Competition Details
                  </h2>
                </div>
                <p className="text-xs text-[#9EA8B6] leading-relaxed">
                  Points from this verified event contribute directly to the Proposed Community Cup rankings (1st: 100 pts, 2nd: 70 pts, 3rd: 50 pts, Participation: 10 pts).
                </p>
                {event.participatingHouses && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-[#F3F0E8] mb-2 font-mono">
                      Participating Houses:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.participatingHouses.map((house) => (
                        <span
                          key={house}
                          className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#101116] text-[#F3F0E8] border border-[#343A49] font-medium"
                        >
                          {house}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Event Agenda (if present) */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="p-6 rounded-2xl space-y-4 bg-[#202631] border border-[#343A49]">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-[#8B7CFF]" />
                  <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight">
                    Schedule &amp; Program Agenda
                  </h2>
                </div>

                <div className="space-y-4 border-l-2 border-[#8B7CFF]/40 pl-4 ml-1">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#8B7CFF] ring-4 ring-[#202631]" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#43E5D2]">
                          {item.time}
                        </span>
                        <span className="text-[#9EA8B6]">•</span>
                        <span className="text-sm font-bold text-[#F3F0E8]">
                          {item.title}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-[#9EA8B6]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines & Entry Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <div className="p-6 rounded-2xl space-y-3 bg-[#202631] border border-[#343A49]">
                <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight">
                  Guidelines &amp; Entry Requirements
                </h2>
                <ul className="space-y-2">
                  {event.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#9EA8B6]"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#43E5D2] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Organizing Entity Details */}
            <div className="p-5 rounded-2xl flex items-center justify-between gap-4 bg-[#202631] border border-[#343A49]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#101116] border border-[#343A49] flex items-center justify-center text-[#43E5D2]">
                  <User className="w-5 h-5 text-[#43E5D2]" />
                </div>
                <div>
                  <p className="text-xs text-[#9EA8B6] font-mono">Organized by</p>
                  <p className="text-sm font-bold text-[#F3F0E8]">
                    {event.organizingEntity}
                  </p>
                  <p className="text-[11px] text-[#9EA8B6]">
                    {event.organizer.name} • {event.organizer.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Registration Card */}
          <div className="lg:col-span-5 sticky top-20">
            <EventDetailRsvpCard
              event={hydratedEvent}
              initialStats={initialStats}
              isLoggedIn={Boolean(user)}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
