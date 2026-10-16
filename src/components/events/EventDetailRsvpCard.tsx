'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { HouseEvent } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  registerForEventAction,
  cancelRegistrationAction,
  getEventStatsAction,
  type EventRegistrationStats,
  type RegistrationActionResult,
} from '@/app/events/actions';
import {
  CheckCircle2,
  CalendarPlus,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Globe,
  Clock,
  AlertCircle,
  Loader2,
  LogIn,
  AlertTriangle,
  X,
  Users,
} from 'lucide-react';

export interface EventDetailRsvpCardProps {
  event: HouseEvent;
  initialStats?: EventRegistrationStats | null;
  isLoggedIn?: boolean;
  userRole?: string | null;
}

export const EventDetailRsvpCard: React.FC<EventDetailRsvpCardProps> = ({
  event,
  initialStats,
  isLoggedIn = false,
  userRole = null,
}) => {
  // 1. Authoritative registration stats (derived from mutation overrides, server props, or event baseline)
  const [overrideStats, setOverrideStats] = useState<EventRegistrationStats | null>(null);

  const stats: EventRegistrationStats = overrideStats ?? initialStats ?? {
    success: true,
    eventId: event.id,
    capacity: typeof event.capacity === 'number' && event.capacity > 0 ? event.capacity : null,
    activeRegistrations: event.registeredCount ?? 0,
    spotsLeft:
      typeof event.capacity === 'number' && event.capacity > 0
        ? Math.max(0, event.capacity - (event.registeredCount ?? 0))
        : null,
    isFull:
      typeof event.capacity === 'number' && event.capacity > 0
        ? (event.registeredCount ?? 0) >= event.capacity
        : false,
    userRegistrationStatus: event.isRsvpd ? 'registered' : null,
  };

  const [isPending, startTransition] = useTransition();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<{ title: string; message: string } | null>(null);
  const [calendarNotice, setCalendarNotice] = useState(false);

  const handleCalendarClick = () => {
    setCalendarNotice(true);
  };

  // Role check: Wardens and organizers cannot register for student passes
  const isOrganizerOrWarden = Boolean(
    isLoggedIn && (userRole === 'organizer' || userRole === 'warden')
  );

  // Capacity calculations
  const hasFiniteCapacity = typeof stats.capacity === 'number' && stats.capacity > 0;
  const attendeeCount = stats.activeRegistrations;
  const capacity = stats.capacity;
  const spotsLeft =
    hasFiniteCapacity && capacity !== null
      ? stats.spotsLeft !== null
        ? stats.spotsLeft
        : Math.max(0, capacity - attendeeCount)
      : null;
  const isFull = hasFiniteCapacity ? stats.isFull || (spotsLeft !== null && spotsLeft <= 0) : false;
  const fillPercentage =
    hasFiniteCapacity && capacity !== null && capacity > 0
      ? Math.min(100, Math.round((attendeeCount / capacity) * 100))
      : 0;

  const isRegistered = stats.userRegistrationStatus === 'registered';
  const isEventCancelled = event.status === 'cancelled';
  const isEventEnded = event.status === 'completed';

  const returnPath = `/events/${event.slug || event.id}`;
  const loginUrl = `/login?redirectTo=${encodeURIComponent(returnPath)}`;

  // Handle student registration
  const handleRegister = () => {
    if (isPending) return;
    setErrorMessage(null);
    setSuccessToast(null);

    const isDbEvent = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.id);
    if (!isDbEvent) {
      setErrorMessage(
        'This event is currently in preview catalog mode. Direct RSVP opens once event scheduling is published to public.events.'
      );
      return;
    }

    startTransition(async () => {
      try {
        const result: RegistrationActionResult = await registerForEventAction(event.id);

        if (result.success) {
          // Refresh live authoritative statistics
          const fresh = await getEventStatsAction(event.id);
          if (fresh.success) {
            setOverrideStats(fresh.stats);
          } else {
            setOverrideStats({
              ...stats,
              activeRegistrations: stats.activeRegistrations + 1,
              spotsLeft: stats.capacity !== null ? Math.max(0, (stats.spotsLeft ?? stats.capacity) - 1) : null,
              isFull: stats.capacity !== null ? stats.activeRegistrations + 1 >= stats.capacity : false,
              userRegistrationStatus: 'registered',
            });
          }

          const toastTitle =
            result.status === 'already_registered' ? 'Registration Confirmed' : 'Registration Confirmed!';
          const toastMsg =
            result.status === 'already_registered'
              ? 'You are already registered for this event. Your pass remains active.'
              : result.message || `Your entry pass has been reserved for ${event.title}.`;

          setSuccessToast({
            title: toastTitle,
            message: toastMsg,
          });
        } else {
          // Map error codes to clear user-facing messages
          let friendly = result.error;
          if (result.code === 'EVENT_FULL') {
            friendly = 'This event has reached maximum capacity. All available spots are currently taken.';
            // Trigger stats sync to update button state to full
            const fresh = await getEventStatsAction(event.id);
            if (fresh.success) setOverrideStats(fresh.stats);
          } else if (result.code === 'EVENT_ALREADY_STARTED') {
            friendly = 'Registration is closed because this event has already started.';
          } else if (result.code === 'EVENT_CANCELLED') {
            friendly = 'Registration cannot be processed because this event has been cancelled.';
          } else if (result.code === 'EVENT_NOT_PUBLISHED') {
            friendly = 'Registrations are not currently open for unpublished events.';
          } else if (result.code === 'FORBIDDEN_ROLE') {
            friendly = 'Event registration is strictly reserved for verified resident students.';
          } else if (result.code === 'UNAUTHENTICATED') {
            friendly = 'Your authentication session has expired. Please sign in again to register.';
          }
          setErrorMessage(friendly);
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : 'A network error occurred while submitting your registration.'
        );
      }
    });
  };

  // Handle student registration cancellation
  const handleCancelRegistration = () => {
    if (isPending) return;
    setErrorMessage(null);
    setSuccessToast(null);

    startTransition(async () => {
      try {
        const result: RegistrationActionResult = await cancelRegistrationAction(event.id);

        if (result.success) {
          setShowCancelConfirm(false);

          // Refresh live authoritative statistics
          const fresh = await getEventStatsAction(event.id);
          if (fresh.success) {
            setOverrideStats(fresh.stats);
          } else {
            setOverrideStats({
              ...stats,
              activeRegistrations: Math.max(0, stats.activeRegistrations - 1),
              spotsLeft: stats.capacity !== null ? (stats.spotsLeft ?? 0) + 1 : null,
              isFull: false,
              userRegistrationStatus: 'cancelled',
            });
          }

          setSuccessToast({
            title: 'Registration Cancelled',
            message: result.message || `Your pass reservation for ${event.title} has been cancelled.`,
          });
        } else {
          setShowCancelConfirm(false);
          let friendly = result.error;
          if (result.code === 'NOT_REGISTERED') {
            friendly = 'No active registration was found for this event.';
            const fresh = await getEventStatsAction(event.id);
            if (fresh.success) setOverrideStats(fresh.stats);
          }
          setErrorMessage(friendly);
        }
      } catch (err: unknown) {
        setShowCancelConfirm(false);
        setErrorMessage(
          err instanceof Error ? err.message : 'A network error occurred while cancelling your registration.'
        );
      }
    });
  };

  return (
    <div
      id="event-rsvp-card"
      className="p-6 rounded-2xl bg-[#202631] border border-[#343A49] shadow-xl space-y-5"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-[#9EA8B6] mb-2 font-mono">
          <span className="font-bold text-[#F3F0E8] uppercase tracking-wider">Pass Registration</span>
          <span className="text-[#43E5D2] font-bold">Open for Sep Term</span>
        </div>

        {/* Format Pill */}
        <div className="mb-3">
          {event.deliveryMode === 'offline' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/30">
              <MapPin className="w-3.5 h-3.5 text-[#FF896D]" />
              Offline · On campus
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/30">
              <Globe className="w-3.5 h-3.5 text-[#43E5D2]" />
              Online Session
            </span>
          )}
        </div>

        {/* Capacity / Attendance Counter */}
        {hasFiniteCapacity ? (
          <div>
            <div className="flex items-baseline justify-between mb-2" id="rsvp-capacity-counter">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-[#F3F0E8] tracking-tight">
                  {attendeeCount}
                </span>
                <span className="text-sm text-[#9EA8B6]">/ {capacity} capacity</span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  spotsLeft === 0 ? 'text-[#FF896D]' : 'text-[#43E5D2]'
                }`}
              >
                {spotsLeft === 0 ? '0 spots left' : `${spotsLeft} spots left`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#101116] rounded-full h-2 overflow-hidden border border-[#343A49]">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  fillPercentage >= 90 ? 'bg-[#FF896D]' : 'bg-[#43E5D2]'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#101116] border border-[#343A49] space-y-1">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#F3F0E8] tracking-tight">
                  {attendeeCount}
                </span>
                <span className="text-xs text-[#9EA8B6]">registered attendees</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#43E5D2] px-2 py-0.5 rounded-full bg-[#43E5D2]/10 border border-[#43E5D2]/30 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#43E5D2]" />
                Open Capacity
              </span>
            </div>
            <p className="text-[11px] text-[#9EA8B6]">
              No seat limit set. Open to all enrolled student participants.
            </p>
          </div>
        )}
      </div>

      {/* Eligibility and Deadline details */}
      {(event.eligibility || event.registrationDeadline) && (
        <div className="space-y-2 py-3 border-y border-[#343A49] text-xs">
          {event.registrationDeadline && (
            <div className="flex items-start gap-2 text-[#9EA8B6]">
              <Clock className="w-3.5 h-3.5 text-[#43E5D2] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#9EA8B6]">Registration Deadline:</span>{' '}
                <strong className="text-[#F3F0E8]">{event.registrationDeadline}</strong>
              </div>
            </div>
          )}
          {event.eligibility && (
            <div className="flex items-start gap-2 text-[#9EA8B6]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8B7CFF] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#9EA8B6]">Eligibility:</span>{' '}
                <span className="text-[#F3F0E8]">{event.eligibility}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action / State Area */}
      <div className="space-y-3">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            id="rsvp-error-banner"
            role="alert"
            className="p-3.5 rounded-xl bg-[#FF896D]/15 border border-[#FF896D]/40 text-xs text-[#F3F0E8] space-y-1.5 animate-fadeIn"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF896D] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <p className="font-bold text-[#FF896D]">Action Could Not Complete</p>
                <p className="text-[11px] text-[#F3F0E8] mt-0.5">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[#9EA8B6] hover:text-[#F3F0E8] p-0.5 rounded transition-colors"
                aria-label="Dismiss error notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Success Toast Banner */}
        {successToast && (
          <div
            id="rsvp-success-toast"
            role="status"
            className="p-3.5 rounded-xl bg-[#43E5D2]/15 border border-[#43E5D2]/40 text-xs text-[#F3F0E8] flex items-start gap-2.5 animate-fadeIn"
          >
            <Sparkles className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-[#43E5D2]">{successToast.title}</p>
              <p className="text-[11px] text-[#9EA8B6] mt-0.5 leading-relaxed">
                {successToast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-[#9EA8B6] hover:text-[#F3F0E8] p-0.5 rounded transition-colors"
              aria-label="Dismiss success notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Condition 1: Visitor (Unauthenticated) */}
        {!isLoggedIn ? (
          <div
            id="rsvp-visitor-prompt"
            className="space-y-3 p-4 rounded-xl bg-[#101116] border border-[#343A49]"
          >
            <div className="flex items-start gap-2.5">
              <LogIn className="w-4 h-4 text-[#43E5D2] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#F3F0E8]">Student Sign-In Required</p>
                <p className="text-[11px] text-[#9EA8B6] leading-relaxed">
                  Please sign in with your IIT Madras BS student account to reserve your entry pass for this event.
                </p>
              </div>
            </div>
            <Link href={loginUrl} className="block w-full">
              <Button
                id="rsvp-signin-link"
                variant="primary"
                size="md"
                fullWidth
                className="bg-[#43E5D2] hover:bg-[#35D6C3] text-[#101116] font-bold shadow-xs"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Register
              </Button>
            </Link>
          </div>
        ) : isOrganizerOrWarden ? (
          /* Condition 2: Organizer or Warden Role Restriction */
          <div
            id="rsvp-organizer-notice"
            className="p-4 rounded-xl bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 space-y-2 text-xs"
          >
            <div className="flex items-center gap-2 text-[#8B7CFF] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{userRole === 'warden' ? 'Faculty Warden' : 'Organizer'} Console</span>
            </div>
            <p className="text-[11px] text-[#9EA8B6] leading-relaxed">
              Pass registration is reserved for resident students. Administrative profiles cannot RSVP for student activities.
            </p>
          </div>
        ) : isRegistered ? (
          /* Condition 3: Registered Student (Show confirmed badge + cancellation confirmation) */
          <div id="rsvp-registered-state" className="space-y-2.5">
            <div
              id="rsvp-confirmed-badge"
              className="p-3.5 rounded-xl bg-[#43E5D2]/10 border border-[#43E5D2]/40 text-xs text-[#F3F0E8] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#43E5D2] shrink-0" />
                <span className="font-bold text-[#43E5D2]">Pass Confirmed</span>
              </div>
              <span className="text-[10px] font-mono text-[#9EA8B6] uppercase tracking-wider">
                Active Reservation
              </span>
            </div>

            {showCancelConfirm ? (
              <div
                id="rsvp-cancel-confirmation-box"
                className="p-4 rounded-xl bg-[#FF896D]/10 border border-[#FF896D]/40 space-y-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF896D] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#F3F0E8]">Cancel Your Event Registration?</p>
                    <p className="text-[11px] text-[#9EA8B6] leading-relaxed">
                      Your reserved spot will be released immediately for other student residents.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    id="rsvp-cancel-confirm-button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelRegistration}
                    disabled={isPending}
                    className="flex-1 border-[#FF896D]/40 text-[#FF896D] hover:bg-[#FF896D]/15 font-bold"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel Pass'
                    )}
                  </Button>
                  <Button
                    id="rsvp-cancel-keep-button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isPending}
                    className="flex-1 bg-[#28303E] text-[#F3F0E8] hover:bg-[#343A49]"
                  >
                    Keep My Pass
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                id="rsvp-cancel-button"
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setShowCancelConfirm(true)}
                disabled={isPending}
                className="border-[#343A49] text-[#9EA8B6] hover:text-[#FF896D] hover:border-[#FF896D]/40 hover:bg-[#202631] text-xs font-semibold"
              >
                Cancel Registration
              </Button>
            )}
          </div>
        ) : (
          /* Condition 4: Authenticated Student, Not Registered */
          <div id="rsvp-unregistered-state" className="space-y-2.5">
            {isEventEnded ? (
              <Button
                id="rsvp-event-ended-button"
                variant="secondary"
                size="lg"
                fullWidth
                disabled
                className="opacity-60 cursor-not-allowed bg-[#28303E] text-[#9EA8B6]"
              >
                Registration Closed (Event Concluded)
              </Button>
            ) : isEventCancelled ? (
              <Button
                id="rsvp-event-cancelled-button"
                variant="secondary"
                size="lg"
                fullWidth
                disabled
                className="opacity-60 cursor-not-allowed border-[#FF896D]/30 text-[#FF896D] bg-[#28303E]"
              >
                Event Cancelled
              </Button>
            ) : isFull ? (
              <div className="space-y-2">
                <Button
                  id="rsvp-capacity-reached-button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  disabled
                  className="opacity-75 cursor-not-allowed bg-[#28303E] border-[#343A49] text-[#9EA8B6] font-bold"
                >
                  Capacity Reached (Full)
                </Button>
                <p className="text-[11px] text-center text-[#9EA8B6]">
                  All {stats.capacity} spots are booked. If a student cancels, spots will open automatically.
                </p>
              </div>
            ) : (
              <Button
                id="rsvp-register-button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRegister}
                disabled={isPending}
                className="font-black bg-[#43E5D2] hover:bg-[#35D6C3] text-[#101116] border-none shadow-sm transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#101116]" />
                    Securing Entry Pass...
                  </>
                ) : (
                  'Register for this Event'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Add to Calendar (.ics) Simulated with In-App Feedback */}
        <Button
          id="rsvp-calendar-button"
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          className="bg-[#28303E] border-[#343A49] text-[#F3F0E8] hover:bg-[#343A49] text-xs font-semibold cursor-pointer"
          onClick={handleCalendarClick}
        >
          <CalendarPlus className="w-4 h-4 mr-2 text-[#43E5D2]" />
          Add to Calendar (.ics)
        </Button>

        {calendarNotice && (
          <div
            id="rsvp-calendar-notice"
            role="status"
            aria-live="polite"
            className="p-3 rounded-xl bg-[#202631] border border-[#8B7CFF]/40 text-xs text-[#F3F0E8] flex items-start gap-2.5 shadow-sm animate-fadeIn"
          >
            <Clock className="w-4 h-4 text-[#8B7CFF] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="font-bold text-[#8B7CFF]">Calendar Export Unavailable</p>
              <p className="text-[11px] text-[#A0A6B8] leading-snug">
                Direct .ics calendar sync is scheduled for Phase 3. Please refer to the schedule and timetable details above.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCalendarNotice(false)}
              className="text-[#9EA8B6] hover:text-[#F3F0E8] p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Dismiss calendar notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Points & House Policy Note */}
      <div className="pt-4 border-t border-[#343A49] space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#101116] border border-[#343A49]">
          <Award className="w-4 h-4 text-[#8B7CFF] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-[#F3F0E8]">
              +{event.housePoints} Community Cup Points
            </span>
            <p className="text-[11px] text-[#9EA8B6] mt-0.5">
              Verified participation points contribute toward your house standing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#9EA8B6]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#43E5D2]" />
          <span>IIT Madras BS Community Event Guidelines</span>
        </div>
      </div>
    </div>
  );
};
