export type AcademicTerm = 'Jan' | 'May' | 'Sep';

export type DeliveryMode = 'offline' | 'online';

export type OrganizerType = 'central' | 'club_society' | 'house';

export type EventCategory =
  | 'Flagship'
  | 'Technical & Coding'
  | 'Cultural & Arts'
  | 'Sports & eSports'
  | 'Debate & Knowledge'
  | 'Debate & Literary'
  | 'Wellness & Community'
  | 'Academic & Research'
  | 'Governance & Council';

export interface EventOrganizer {
  name: string;
  role: string;
  societyName?: string;
  avatarUrl?: string;
  email?: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  description?: string;
}

export interface HouseEvent {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  shortDescription: string;
  fullDescription: string;
  date: string;
  time: string;
  location: string;
  deliveryMode: DeliveryMode;
  organizerType: OrganizerType;
  organizingEntity: string;
  isInterHouse: boolean;
  participatingHouses?: string[];
  term: AcademicTerm;
  organizer: EventOrganizer;
  capacity: number;
  registeredCount: number;
  housePoints: number;
  tags: string[];
  isRsvpd?: boolean;
  isFlagship?: boolean;
  flagshipType?: 'PARADOX' | 'SAAVAN';
  eligibility?: string;
  registrationDeadline?: string;
  agenda?: EventAgendaItem[];
  requirements?: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft' | 'cancelled';
}

export type AnnouncementPriority = 'urgent' | 'pinned' | 'normal';
export type AnnouncementCategory = 'Academic' | 'Exam' | 'Hostel/Campus' | 'Council' | 'General';

export interface HouseAnnouncement {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  date: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  term?: AcademicTerm;
}

export interface House {
  id: string;
  name: string;
  code: string;
  zone: string;
  colorHex: string;
  accentHex: string;
  residentCount: number;
}

export interface HouseStanding {
  rank: number;
  houseName: string;
  points: number;
  janPoints: number;
  mayPoints: number;
  sepPoints: number;
  pointsThisWeek: number;
  isCurrentHouse: boolean;
  colorHex: string;
  recentContribution: string;
}

export interface CompetitionScoreBreakdown {
  id: string;
  competitionTitle: string;
  organizingSociety: string;
  term: AcademicTerm;
  date: string;
  winnerHouse: string;
  runnerUpHouse: string;
  thirdHouse: string;
  participatingHouses: string[];
}

export interface HouseResident {
  id: string;
  name: string;
  studentId: string;
  houseName: string;
  term: AcademicTerm;
  program: string;
  pointsEarned: number;
  role: 'student' | 'organizer';
  avatarInitials: string;
}

export interface OrganizerStat {
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  description: string;
}

export interface EventRegistrationItem {
  id: string;
  residentName: string;
  houseName: string;
  studentId: string;
  registeredAt: string;
  checkedIn: boolean;
  pointsAwarded: boolean;
}

export type SocietyCategory =
  | 'Technology & Research'
  | 'Business & Entrepreneurship'
  | 'Culture & Creative Arts'
  | 'Debate & Knowledge'
  | 'Sports & Gaming'
  | 'Community & Other Interests';

export interface Society {
  id: string;
  name: string;
  fullName: string;
  description: string;
  category: SocietyCategory;
  accentColor: string;
  badgeCode: string;
  activeEventsCount: number;
}
