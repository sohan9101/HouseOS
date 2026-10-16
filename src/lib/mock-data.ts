import {
  HouseEvent,
  HouseAnnouncement,
  HouseStanding,
  HouseResident,
  OrganizerStat,
  EventRegistrationItem,
} from '@/types';
import { OFFICIAL_HOUSES, getHouses, getHouseByName, getHouseById } from './data/houses';
import {
  OFFICIAL_SOCIETIES,
  getSocieties,
  getSocietyCategories,
  getSocietyById,
  mergeDbSocietyWithMeta,
  getSocietyPresentationMeta,
} from './data/societies';
import { ALL_HOUSE_STANDINGS, getStandingsByTerm, getSampleCompetitions, SCORING_POLICY } from './data/standings';

export {
  OFFICIAL_HOUSES,
  getHouses,
  getHouseByName,
  getHouseById,
  OFFICIAL_SOCIETIES,
  getSocieties,
  getSocietyCategories,
  getSocietyById,
  mergeDbSocietyWithMeta,
  getSocietyPresentationMeta,
  ALL_HOUSE_STANDINGS,
  getStandingsByTerm,
  getSampleCompetitions,
  SCORING_POLICY,
};

/**
 * HouseOS Mock Data Repository — IIT Madras BS Community
 * 
 * Centralized data isolating mock entities for Phase 1 UI prototyping.
 * Respects official houses, academic terms (Jan/May/Sep), flagship events, and societies.
 */

export const CURRENT_RESIDENT: HouseResident = {
  id: 'res-aarav-sharma',
  name: 'Aarav Sharma',
  studentId: '22F300142',
  houseName: 'Saranda House',
  term: 'Sep',
  program: 'BS in Data Science & Applications',
  pointsEarned: 160,
  role: 'student',
  avatarInitials: 'AS',
};

export const CURRENT_ORGANIZER: HouseResident = {
  id: 'org-k-ramanathan',
  name: 'Dr. K. Ramanathan',
  studentId: 'FAC-SAC-09',
  houseName: 'Saranda House',
  term: 'Sep',
  program: 'Faculty House Warden & Student Activities Council',
  pointsEarned: 450,
  role: 'organizer',
  avatarInitials: 'KR',
};

export const MOCK_EVENTS: HouseEvent[] = [
  // Flagship 1: PARADOX (Centralized, Offline · On campus)
  {
    id: 'evt-paradox-2026',
    slug: 'paradox-annual-offline-confluence',
    title: 'PARADOX: Annual IIT Madras Campus Confluence',
    category: 'Flagship',
    shortDescription: 'The flagship offline campus gathering bringing IITM BS students to the Chennai campus for cultural, sports, and technical events.',
    fullDescription: 'PARADOX is the premier centralized annual offline festival of the IIT Madras BS Degree program. Students converge on the lush IIT Madras campus in Chennai for flagship hackathons, sports championships, live concerts, guest speaker symposiums, and inter-house cultural tournaments.',
    date: 'Dec 18 – Dec 21, 2026',
    time: '9:00 AM – 10:00 PM IST',
    location: 'IIT Madras Main Campus, Chennai, Tamil Nadu',
    deliveryMode: 'offline',
    organizerType: 'central',
    organizingEntity: 'IITM BS Central Activities Council',
    isInterHouse: true,
    participatingHouses: OFFICIAL_HOUSES.map((h) => h.name),
    term: 'Sep',
    isFlagship: true,
    flagshipType: 'PARADOX',
    eligibility: 'All enrolled IITM BS foundational, diploma, and degree students with verified student ID.',
    registrationDeadline: 'Nov 15, 2026, 11:59 PM IST',
    organizer: {
      name: 'PARADOX Core Team',
      role: 'Central Student Activities Council',
    },
    capacity: 2500,
    registeredCount: 1840,
    housePoints: 50,
    tags: ['Flagship', 'Offline', 'On Campus', 'Cultural', 'Sports', 'Technical'],
    isRsvpd: true,
    status: 'upcoming',
    agenda: [
      { time: 'Day 1 (Dec 18)', title: 'Opening Ceremony & Hackathon Kickoff', description: 'Inauguration at Central Lecture Theatre (CLT).' },
      { time: 'Day 2 (Dec 19)', title: 'Inter-House Sports Finals & Technical Exhibits', description: 'Athletics, cricket, and robotics showdowns.' },
      { time: 'Day 3 (Dec 20)', title: 'Cultural Night & Dramatic Ensembles', description: 'Performances by Aayam, AKORD, and Pravaha.' },
      { time: 'Day 4 (Dec 21)', title: 'Valedictory & Community Cup Grand Finale', description: 'Announcement of annual house standings and trophy presentation.' },
    ],
    requirements: [
      'Original IIT Madras BS Student ID card required for entry gates',
      'Hostel gate pass and biometric check-in at SAC venue',
    ],
  },

  // Flagship 2: SAAVAN (Centralized, Online)
  {
    id: 'evt-saavan-2026',
    slug: 'saavan-annual-virtual-symposium',
    title: 'SAAVAN: Annual Virtual Fest & Symposium',
    category: 'Flagship',
    shortDescription: 'The flagship centralized online community festival connecting remote learners across all houses and global regions.',
    fullDescription: 'SAAVAN is the official centralized online community festival for IIT Madras BS students. Designed to foster deep inter-house connection across India and international study centers, SAAVAN features virtual game arenas, live open-mic stages, tech expos, and house spirit competitions streamed live.',
    date: 'Nov 06 – Nov 08, 2026',
    time: '4:00 PM – 10:30 PM IST',
    location: 'Virtual Stage & Interactive Community Channels',
    deliveryMode: 'online',
    organizerType: 'central',
    organizingEntity: 'IITM BS Central Activities Council',
    isInterHouse: true,
    participatingHouses: OFFICIAL_HOUSES.map((h) => h.name),
    term: 'Sep',
    isFlagship: true,
    flagshipType: 'SAAVAN',
    eligibility: 'Open to all registered BS students globally.',
    registrationDeadline: 'Nov 01, 2026',
    organizer: {
      name: 'SAAVAN Executive Committee',
      role: 'Virtual Events Directorate',
    },
    capacity: 5000,
    registeredCount: 3200,
    housePoints: 30,
    tags: ['Flagship', 'Online', 'Virtual Fest', 'Community', 'All Houses'],
    isRsvpd: true,
    status: 'upcoming',
    agenda: [
      { time: 'Nov 6, 5:00 PM', title: 'Virtual Keynote & House Roll Call', description: 'Live broadcast across all 12 house channels.' },
      { time: 'Nov 7, 2:00 PM', title: 'Online Gaming Arenas & Quizzing', description: 'Hosted by Heighers and WYZ Kids.' },
      { time: 'Nov 8, 7:00 PM', title: 'Grand Musical Gala & Award Showcase', description: 'Collaborative showcase with AKORD Music Society.' },
    ],
    requirements: [
      'Stable internet connection and student portal authentication',
      'Active community Discord / livestream access',
    ],
  },

  // Society Event 1: WYZ Kids Inter-House Quiz
  {
    id: 'evt-wyz-quiz-2026',
    slug: 'inter-house-quiz-championship',
    title: 'Inter-House Quiz Championship 2026',
    category: 'Debate & Knowledge',
    shortDescription: 'The official inter-house trivia battle spanning STEM, geopolitics, and cinema.',
    fullDescription: 'Organized by WYZ Kids (IITM BS Quiz Society), this premier inter-house tournament tests breadth of knowledge across science, global history, sports, and technology. The top-placing house earns 100 Community Cup points.',
    date: 'Saturday, Oct 24, 2026',
    time: '6:00 PM – 8:30 PM IST',
    location: 'Online Auditorium Room 1',
    deliveryMode: 'online',
    organizerType: 'club_society',
    organizingEntity: 'WYZ Kids: IITM BS Quiz Society',
    isInterHouse: true,
    participatingHouses: OFFICIAL_HOUSES.map((h) => h.name),
    term: 'Sep',
    eligibility: 'Teams of up to 4 residents nominated per house.',
    registrationDeadline: 'Oct 22, 2026',
    organizer: {
      name: 'WYZ Kids Core',
      role: 'IITM BS Quiz Society Lead',
      societyName: 'WYZ Kids: IITM BS Quiz Society',
    },
    capacity: 200,
    registeredCount: 96,
    housePoints: 25,
    tags: ['Quiz', 'Inter-House', 'WYZ Kids', 'Online'],
    isRsvpd: false,
    status: 'upcoming',
    agenda: [
      { time: '6:00 PM', title: 'Prelims Elimination Round', description: '30 written rapid-fire trivia questions.' },
      { time: '7:00 PM', title: 'Intermission & Score Audit', description: 'Top 6 houses advance to stage finals.' },
      { time: '7:20 PM', title: 'Final Buzzer Rounds', description: 'Audio-visual and pounce-and-bounce rounds.' },
    ],
    requirements: ['One team per house', 'Google Meet video required for finalists'],
  },

  // Society Event 2: Shah Maat Rapid Chess Clash
  {
    id: 'evt-shah-maat-chess',
    slug: 'inter-house-rapid-chess-clash',
    title: 'Inter-House Rapid Chess Clash',
    category: 'Sports & eSports',
    shortDescription: 'Swiss-system 10+2 rapid chess tournament pitting house champions across the board.',
    fullDescription: 'Hosted by Shah Maat (Chess Society), this high-speed inter-house chess battle features rated rapid games with points contributing directly to the Community Cup leaderboard.',
    date: 'Sunday, Oct 25, 2026',
    time: '4:00 PM – 7:30 PM IST',
    location: 'Lichess Swiss Arena & Video Proctoring',
    deliveryMode: 'online',
    organizerType: 'club_society',
    organizingEntity: 'Shah Maat - Chess Society',
    isInterHouse: true,
    participatingHouses: OFFICIAL_HOUSES.map((h) => h.name),
    term: 'Sep',
    eligibility: 'Open to all house members with registered Lichess handles.',
    registrationDeadline: 'Oct 24, 2026',
    organizer: {
      name: 'Shah Maat Tournament Desk',
      role: 'Chess Society Arbiter',
      societyName: 'Shah Maat - Chess Society',
    },
    capacity: 120,
    registeredCount: 84,
    housePoints: 20,
    tags: ['Chess', 'Inter-House', 'Shah Maat', 'Online'],
    isRsvpd: true,
    status: 'upcoming',
    agenda: [
      { time: '4:00 PM', title: 'Round 1 – 3 Pairing', description: 'Swiss system 10m + 2s increment.' },
      { time: '5:30 PM', title: 'Round 4 – 6 Pairing', description: 'Championship board pairings.' },
      { time: '7:00 PM', title: 'Tiebreaks & Points Verification', description: 'Buchholz tiebreak verification.' },
    ],
    requirements: ['Fair play agreement', 'Screen share during official games'],
  },

  // Society Event 3: CodeCrafters 48-Hour Open Source Sprint
  {
    id: 'evt-codecrafters-sprint',
    slug: 'codecrafters-open-source-sprint',
    title: '48-Hour Open Source Sprint',
    category: 'Technical & Coding',
    shortDescription: 'Build useful student developer tooling, documentation, and web modules for campus life.',
    fullDescription: 'CodeCrafters Coding Society challenges resident developers to build open-source utilities for the student ecosystem. Code quality, test coverage, and documentation will be evaluated by student reviewers.',
    date: 'Oct 30 – Nov 01, 2026',
    time: '6:00 PM (Fri) – 6:00 PM (Sun) IST',
    location: 'GitHub Classroom & Discord Hackroom',
    deliveryMode: 'online',
    organizerType: 'club_society',
    organizingEntity: 'CodeCrafters Coding Society',
    isInterHouse: true,
    participatingHouses: OFFICIAL_HOUSES.map((h) => h.name),
    term: 'Sep',
    eligibility: 'Individual or teams of up to 3 residents.',
    registrationDeadline: 'Oct 29, 2026',
    organizer: {
      name: 'CodeCrafters Mentors',
      role: 'Technical Society Core',
      societyName: 'CodeCrafters Coding Society',
    },
    capacity: 150,
    registeredCount: 92,
    housePoints: 25,
    tags: ['Coding', 'Hackathon', 'Open Source', 'CodeCrafters'],
    isRsvpd: false,
    status: 'upcoming',
    agenda: [
      { time: 'Oct 30, 6:00 PM', title: 'Problem Statements Released', description: 'Three domain tracks announced.' },
      { time: 'Oct 31, 2:00 PM', title: 'Mid-Hack Progress Check-in', description: 'Architecture reviews by mentors.' },
      { time: 'Nov 01, 6:00 PM', title: 'PR Submissions Closes', description: 'Automated CI test checks.' },
    ],
    requirements: ['Public GitHub repository with MIT/Apache license'],
  },

  // Society Event 4: Pravaha Dance Showcase
  {
    id: 'evt-pravaha-showcase',
    slug: 'pravaha-rhythm-and-grace-showcase',
    title: 'Rhythm & Grace: Classical Fusion Showcase',
    category: 'Cultural & Arts',
    shortDescription: 'Digital choreography showcase celebrating traditional Indian classical dance and contemporary fusion.',
    fullDescription: 'Presented by Pravaha (The Dance Society), this evening highlights solo and ensemble choreography submitted by students across Bharatnatyam, Kathak, Odissi, and contemporary styles.',
    date: 'Friday, Nov 13, 2026',
    time: '7:00 PM – 8:30 PM IST',
    location: 'Pravaha Digital Stage Livestream',
    deliveryMode: 'online',
    organizerType: 'club_society',
    organizingEntity: 'Pravaha: The Dance Society',
    isInterHouse: false,
    term: 'Sep',
    eligibility: 'Open to all students and cultural enthusiasts.',
    registrationDeadline: 'Nov 12, 2026',
    organizer: {
      name: 'Pravaha Curators',
      role: 'Dance Society President',
      societyName: 'Pravaha: The Dance Society',
    },
    capacity: 300,
    registeredCount: 168,
    housePoints: 10,
    tags: ['Dance', 'Cultural', 'Pravaha', 'Online'],
    isRsvpd: false,
    status: 'upcoming',
    requirements: ['Open livestream for all registered house members'],
  },

  // Society Event 5: RAAHAT Wellness Circle
  {
    id: 'evt-raahat-wellness',
    slug: 'mindful-pauses-before-quiz-2',
    title: 'Mindful Pauses: De-stressing Before Quiz 2',
    category: 'Wellness & Community',
    shortDescription: 'Peer-guided meditation, burnout prevention strategies, and open discussion circles.',
    fullDescription: 'Organized by RAAHAT (Mental Health & Wellness Society), this intentional 60-minute session offers guided breathing routines, effective pacing advice for Quiz 2, and anonymous Q&A on managing course loads.',
    date: 'Tuesday, Nov 17, 2026',
    time: '8:00 PM – 9:00 PM IST',
    location: 'Interactive Google Meet Circle',
    deliveryMode: 'online',
    organizerType: 'club_society',
    organizingEntity: 'RAAHAT: Mental Health & Wellness Society',
    isInterHouse: false,
    term: 'Sep',
    eligibility: 'Open to all students in Sep Term.',
    registrationDeadline: 'Nov 17, 2026',
    organizer: {
      name: 'RAAHAT Peer Mentors',
      role: 'Student Wellness Facilitator',
      societyName: 'RAAHAT: Mental Health & Wellness Society',
    },
    capacity: 80,
    registeredCount: 54,
    housePoints: 10,
    tags: ['Wellness', 'Mental Health', 'RAAHAT', 'Peer Circle'],
    isRsvpd: false,
    status: 'upcoming',
    requirements: ['Safe, confidential space; camera optional'],
  },

  // Society Event 6: Amartya Finance Challenge
  {
    id: 'evt-amartya-valuation',
    slug: 'campus-equity-valuation-challenge',
    title: 'Inter-House Equity Valuation Challenge',
    category: 'Academic & Research',
    shortDescription: 'Build DCF financial models and pitch an emerging Indian enterprise in front of industry alumni.',
    fullDescription: 'Organized by Amartya (The Finance Society), houses compete in teams of 2 to analyze real-world financial statements, project cash flows, and justify enterprise multiples.',
    date: 'Saturday, Nov 21, 2026',
    time: '3:00 PM – 6:30 PM IST',
    location: 'Online Seminar Hall 3',
    deliveryMode: 'online',
    organizerType: 'club_society',
    organizingEntity: 'Amartya - The Finance Society',
    isInterHouse: true,
    participatingHouses: OFFICIAL_HOUSES.map((h) => h.name),
    term: 'Sep',
    eligibility: 'Two student representatives per house.',
    registrationDeadline: 'Nov 18, 2026',
    organizer: {
      name: 'Amartya Research Cell',
      role: 'Finance Society Convenor',
      societyName: 'Amartya - The Finance Society',
    },
    capacity: 60,
    registeredCount: 38,
    housePoints: 20,
    tags: ['Finance', 'Valuation', 'Amartya', 'Inter-House'],
    isRsvpd: false,
    status: 'upcoming',
    requirements: ['Excel / Google Sheets workbook submission required'],
  },
];

export const MOCK_ANNOUNCEMENTS: HouseAnnouncement[] = [
  {
    id: 'anc-001',
    title: 'Sep 2026 Term: End-Term Exam City Confirmation Window',
    content: 'The portal for selecting your preferred examination center for Sep Term End-Term exams is now live on the academic dashboard. Please confirm before the deadline to ensure your first choice of city.',
    author: {
      name: 'Academic Operations Cell',
      role: 'IITM BS Degree Office',
    },
    date: 'Today at 10:30 AM',
    priority: 'urgent',
    category: 'Exam',
    term: 'Sep',
  },
  {
    id: 'anc-002',
    title: 'PARADOX 2026: Campus Entry Pass & Accommodation Advisory',
    content: 'Students attending PARADOX offline at the IIT Madras campus can now download their verified digital gate passes. Please review the hostel check-in hours and mandatory identity verification steps.',
    author: {
      name: 'PARADOX Organizing Secretariat',
      role: 'Student Activities Council',
    },
    date: 'Yesterday at 4:15 PM',
    priority: 'pinned',
    category: 'Hostel/Campus',
    term: 'Sep',
  },
  {
    id: 'anc-003',
    title: 'Course Registration for Jan 2027 Term: Timeline Announced',
    content: 'Preliminary course allocation guidelines and prerequisite trees for the upcoming Jan 2027 Term have been published in the academic handbook. Advisor sessions will be hosted on Zoom.',
    author: {
      name: 'Curriculum & Advising Committee',
      role: 'Academic Affairs',
    },
    date: 'Oct 11, 2026',
    priority: 'normal',
    category: 'Academic',
    term: 'Sep',
  },
  {
    id: 'anc-004',
    title: 'Saranda House Council Representative Nominations',
    content: 'Nominations are open for House Council student representatives for Saranda House. Interested candidates should review the term guidelines and submit nomination forms via the portal.',
    author: {
      name: 'House Election Committee',
      role: 'Saranda House Administration',
    },
    date: 'Oct 09, 2026',
    priority: 'normal',
    category: 'Council',
    term: 'Sep',
  },
];

export const MOCK_ORGANIZER_STATS: OrganizerStat[] = [
  {
    label: 'Campus Events Logged',
    value: 8,
    trend: '2 Flagship, 6 Society',
    trendDirection: 'up',
    description: 'PARADOX (Offline) & SAAVAN (Online) active',
  },
  {
    label: 'Total RSVPs Received',
    value: 5472,
    trend: '+24% this cycle',
    trendDirection: 'up',
    description: 'Across 12 houses and 30 societies',
  },
  {
    label: 'Active House Notices',
    value: 4,
    trend: '1 Exam Deadline',
    trendDirection: 'neutral',
    description: 'Targeted to Sep 2026 Term residents',
  },
  {
    label: 'House Engagement Rate',
    value: '88.2%',
    trend: '+5.4% QoQ',
    trendDirection: 'up',
    description: 'Residents participating in 1+ event',
  },
];

export const MOCK_REGISTRATIONS_ROSTER: EventRegistrationItem[] = [
  {
    id: 'reg-01',
    residentName: 'Aarav Sharma',
    houseName: 'Saranda House',
    studentId: '22F300142',
    registeredAt: 'Oct 12, 14:22',
    checkedIn: true,
    pointsAwarded: true,
  },
  {
    id: 'reg-02',
    residentName: 'Meera Nambiar',
    houseName: 'Wayanad House',
    studentId: '23F100889',
    registeredAt: 'Oct 12, 16:04',
    checkedIn: true,
    pointsAwarded: true,
  },
  {
    id: 'reg-03',
    residentName: 'Aditya Sen',
    houseName: 'Sundarbans House',
    studentId: '21F200456',
    registeredAt: 'Oct 13, 09:11',
    checkedIn: false,
    pointsAwarded: false,
  },
  {
    id: 'reg-04',
    residentName: 'Ananya Deshmukh',
    houseName: 'Gir House',
    studentId: '22F300712',
    registeredAt: 'Oct 13, 11:45',
    checkedIn: true,
    pointsAwarded: true,
  },
  {
    id: 'reg-05',
    residentName: 'Vikramaditya Roy',
    houseName: 'Kaziranga House',
    studentId: '23F200331',
    registeredAt: 'Oct 13, 13:30',
    checkedIn: false,
    pointsAwarded: false,
  },
  {
    id: 'reg-06',
    residentName: 'Pooja Reddy',
    houseName: 'Nallamala House',
    studentId: '22F100902',
    registeredAt: 'Oct 13, 15:52',
    checkedIn: true,
    pointsAwarded: true,
  },
];

// Helper Functions
export function getEvents(): HouseEvent[] {
  return MOCK_EVENTS;
}

export function getFlagshipEvents(): HouseEvent[] {
  return MOCK_EVENTS.filter((e) => e.isFlagship);
}

export function getEventById(idOrSlug: string): HouseEvent | undefined {
  return MOCK_EVENTS.find(
    (e) => e.id === idOrSlug || e.slug === idOrSlug
  );
}

export function getUpcomingEvents(limit: number = 4): HouseEvent[] {
  return MOCK_EVENTS.filter((e) => e.status === 'upcoming').slice(0, limit);
}

export function getAnnouncements(limit?: number): HouseAnnouncement[] {
  if (limit) {
    return MOCK_ANNOUNCEMENTS.slice(0, limit);
  }
  return MOCK_ANNOUNCEMENTS;
}

export function getHouseStandings(): HouseStanding[] {
  return ALL_HOUSE_STANDINGS;
}

export function getOrganizerStats(): OrganizerStat[] {
  return MOCK_ORGANIZER_STATS;
}

export function getRegistrationsRoster(): EventRegistrationItem[] {
  return MOCK_REGISTRATIONS_ROSTER;
}

export function getEventCategories(): string[] {
  return [
    'All',
    'Flagship',
    'Technical & Coding',
    'Cultural & Arts',
    'Sports & eSports',
    'Debate & Knowledge',
    'Debate & Literary',
    'Wellness & Community',
    'Academic & Research',
  ];
}
