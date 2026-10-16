import {
  HouseEvent,
  EventCategory,
  DeliveryMode,
  OrganizerType,
  AcademicTerm,
} from '@/types';
import { MOCK_EVENTS } from '@/lib/mock-data';

export interface DbEventRow {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  organizer_type: string | null;
  organizer_name: string | null;
  format: string | null;
  venue: string | null;
  starts_at: string | null;
  ends_at: string | null;
  capacity: number | null;
  status: string;
  house_points: number | null;
}

/**
 * Validates whether a string matches a standard UUID pattern.
 */
export function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Derives a suitable category based on event text if not an explicit flagship.
 */
function deriveCategoryFromContent(title: string, desc?: string | null, org?: string | null): EventCategory {
  const text = `${title} ${desc || ''} ${org || ''}`.toLowerCase();
  if (text.includes('code') || text.includes('hack') || text.includes('tech') || text.includes('cloud') || text.includes('robot')) {
    return 'Technical & Coding';
  }
  if (text.includes('chess') || text.includes('sport') || text.includes('game') || text.includes('esport')) {
    return 'Sports & eSports';
  }
  if (text.includes('drama') || text.includes('dance') || text.includes('music') || text.includes('art') || text.includes('cultural')) {
    return 'Cultural & Arts';
  }
  if (text.includes('debate') || text.includes('quiz') || text.includes('mun') || text.includes('literary')) {
    return 'Debate & Literary';
  }
  if (text.includes('wellness') || text.includes('mental') || text.includes('health') || text.includes('mindful')) {
    return 'Wellness & Community';
  }
  if (text.includes('research') || text.includes('finance') || text.includes('math') || text.includes('academic')) {
    return 'Academic & Research';
  }
  return 'Technical & Coding';
}

/**
 * Formats a live Supabase `public.events` record into the UI `HouseEvent` model.
 * Uses database UUID as authoritative id, preserves slug for navigation,
 * and maintains strict fidelity to database records.
 */
export function formatDbEventToHouseEvent(dbEvent: DbEventRow): HouseEvent {
  // Format / delivery mode based strictly on database format field
  const deliveryMode: DeliveryMode = dbEvent.format === 'offline' ? 'offline' : 'online';

  // Flagship classification supported by actual records
  const isParadox =
    dbEvent.title.toUpperCase().includes('PARADOX') ||
    (dbEvent.slug ? dbEvent.slug.toLowerCase().includes('paradox') : false);
  const isSaavan =
    dbEvent.title.toUpperCase().includes('SAAVAN') ||
    (dbEvent.slug ? dbEvent.slug.toLowerCase().includes('saavan') : false);

  let isFlagship = false;
  let flagshipType: 'PARADOX' | 'SAAVAN' | undefined = undefined;
  let category: EventCategory;

  if (isParadox) {
    isFlagship = true;
    flagshipType = 'PARADOX';
    category = 'Flagship';
  } else if (isSaavan) {
    isFlagship = true;
    flagshipType = 'SAAVAN';
    category = 'Flagship';
  } else {
    category = deriveCategoryFromContent(dbEvent.title, dbEvent.description, dbEvent.organizer_name);
  }

  // Parse starts_at and ends_at
  let dateStr = 'Date TBD';
  let timeStr = 'Time TBD';
  let term: AcademicTerm = 'Sep';

  if (dbEvent.starts_at) {
    try {
      const start = new Date(dbEvent.starts_at);
      if (!isNaN(start.getTime())) {
        dateStr = start.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        timeStr = start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        if (dbEvent.ends_at) {
          const end = new Date(dbEvent.ends_at);
          if (!isNaN(end.getTime())) {
            timeStr += ` – ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
          }
        }

        const month = start.getMonth(); // 0-11
        if (month >= 0 && month <= 3) term = 'Jan';
        else if (month >= 4 && month <= 7) term = 'May';
        else term = 'Sep';
      }
    } catch {
      // Keep defaults
    }
  }

  // Location / Venue
  const location =
    dbEvent.venue || (deliveryMode === 'online' ? 'Online Session / Interactive Channel' : 'Campus Venue TBD');

  // Check if there is canonical mock presentation data to match reliably
  const canonicalMatch = MOCK_EVENTS.find(
    (m) =>
      (dbEvent.slug && m.slug.toLowerCase() === dbEvent.slug.toLowerCase()) ||
      m.title.toLowerCase() === dbEvent.title.toLowerCase()
  );

  return {
    id: dbEvent.id,
    slug: dbEvent.slug || dbEvent.id,
    title: dbEvent.title,
    category,
    shortDescription: dbEvent.description || 'No description provided.',
    fullDescription: dbEvent.description || 'No detailed description available for this activity.',
    date: dateStr,
    time: timeStr,
    location,
    deliveryMode,
    organizerType: (dbEvent.organizer_type as OrganizerType) || 'central',
    organizingEntity: dbEvent.organizer_name || 'IIT Madras BS Community',
    isInterHouse: (dbEvent.house_points ?? 0) > 0,
    participatingHouses: canonicalMatch?.participatingHouses,
    term,
    organizer: {
      name: dbEvent.organizer_name || 'Event Lead',
      role: dbEvent.organizer_type === 'central' ? 'Central Student Activities Council' : 'Activity Coordinator',
      societyName: dbEvent.organizer_type === 'club_society' ? dbEvent.organizer_name || undefined : undefined,
    },
    capacity: dbEvent.capacity ?? 0,
    registeredCount: 0, // Registered counts are live in event_registrations; 0 avoids false metrics
    housePoints: dbEvent.house_points ?? 0,
    tags: [
      category,
      deliveryMode === 'offline' ? 'Offline' : 'Online',
      dbEvent.organizer_name,
    ].filter((t): t is string => Boolean(t)),
    isRsvpd: false,
    isFlagship,
    flagshipType,
    eligibility: canonicalMatch?.eligibility || 'Open to all enrolled IITM BS students with verified student ID.',
    registrationDeadline: canonicalMatch?.registrationDeadline,
    agenda: canonicalMatch?.agenda,
    requirements: canonicalMatch?.requirements,
    status:
      dbEvent.status === 'cancelled'
        ? 'cancelled'
        : dbEvent.status === 'completed'
          ? 'completed'
          : dbEvent.status === 'draft'
            ? 'draft'
            : 'upcoming',
  };
}
