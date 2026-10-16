import { Society, SocietyCategory } from '@/types';

/**
 * Official IIT Madras BS Clubs & Societies Directory
 * 
 * 30 Verified Student Societies from the community directory.
 * Names and titles preserved exactly as specified.
 * Categorized into 6 suggested browsing groups.
 */

export const OFFICIAL_SOCIETIES: Society[] = [
  // 1. Technology & Research
  {
    id: 'soc-codecrafters',
    name: 'CodeCrafters',
    fullName: 'CodeCrafters Coding Society',
    description: 'Competitive programming, algorithmic problem-solving, open source projects, and software development challenges.',
    category: 'Technology & Research',
    accentColor: '#6366f1',
    badgeCode: 'CC',
    activeEventsCount: 3,
  },
  {
    id: 'soc-aws',
    name: 'AWS Cloud Club',
    fullName: 'AWS Cloud Club',
    description: 'Cloud architecture workshops, AWS certification roadmaps, and distributed systems architecture.',
    category: 'Technology & Research',
    accentColor: '#f59e0b',
    badgeCode: 'AWS',
    activeEventsCount: 2,
  },
  {
    id: 'soc-rasor',
    name: 'RaSoR',
    fullName: 'RaSoR: Ramanujan Society of Research',
    description: 'Pure and applied mathematics research, paper reading groups, and data science symposiums.',
    category: 'Technology & Research',
    accentColor: '#38bdf8',
    badgeCode: 'RSR',
    activeEventsCount: 2,
  },
  {
    id: 'soc-yantra',
    name: 'Yantra',
    fullName: 'Yantra Robotics Society',
    description: 'Embedded systems, robotics simulation, hardware design, and IoT integration.',
    category: 'Technology & Research',
    accentColor: '#10b981',
    badgeCode: 'YNT',
    activeEventsCount: 1,
  },
  {
    id: 'soc-tech-soc',
    name: 'Tech Society',
    fullName: 'Tech Society',
    description: 'Flagship engineering discussions, tech meetups, and developer tooling exploration.',
    category: 'Technology & Research',
    accentColor: '#8b5cf6',
    badgeCode: 'TCH',
    activeEventsCount: 2,
  },
  {
    id: 'soc-women-in-tech',
    name: 'Women in Tech',
    fullName: 'Women in Tech Society',
    description: 'Empowering women engineers in computing, mentorship circles, and diversity-focused hackathons.',
    category: 'Technology & Research',
    accentColor: '#ec4899',
    badgeCode: 'WIT',
    activeEventsCount: 2,
  },
  {
    id: 'soc-jarvis',
    name: 'JARVIS',
    fullName: 'JARVIS',
    description: 'Artificial intelligence research, machine learning model fine-tuning, and neural networks.',
    category: 'Technology & Research',
    accentColor: '#06b6d4',
    badgeCode: 'JRV',
    activeEventsCount: 1,
  },
  {
    id: 'soc-synapse',
    name: 'SYNAPSE',
    fullName: 'SYNAPSE',
    description: 'Neuroscience, cognitive science modeling, and computational biology intersections.',
    category: 'Technology & Research',
    accentColor: '#14b8a6',
    badgeCode: 'SYN',
    activeEventsCount: 1,
  },

  // 2. Business & Entrepreneurship
  {
    id: 'soc-amartya',
    name: 'Amartya',
    fullName: 'Amartya - The Finance Society',
    description: 'Quantitative finance, equity research, portfolio optimization, and valuation case competitions.',
    category: 'Business & Entrepreneurship',
    accentColor: '#10b981',
    badgeCode: 'AMT',
    activeEventsCount: 2,
  },
  {
    id: 'soc-business-io',
    name: 'Business.io',
    fullName: 'Business.io',
    description: 'Venture capital pitch decks, product management frameworks, and startup incubation.',
    category: 'Business & Entrepreneurship',
    accentColor: '#f97316',
    badgeCode: 'BIO',
    activeEventsCount: 2,
  },
  {
    id: 'soc-iris',
    name: 'IRIS Society',
    fullName: 'IRIS Society',
    description: 'Industry insights, strategy consulting case studies, and corporate networking.',
    category: 'Business & Entrepreneurship',
    accentColor: '#6366f1',
    badgeCode: 'IRS',
    activeEventsCount: 1,
  },

  // 3. Culture & Creative Arts
  {
    id: 'soc-aayam',
    name: 'Aayam',
    fullName: 'Aayam: IITM BS Drama Society',
    description: 'Stage plays, street theatre (Nukkad Natak), scriptwriting, and dramatic performance.',
    category: 'Culture & Creative Arts',
    accentColor: '#ef4444',
    badgeCode: 'AYM',
    activeEventsCount: 2,
  },
  {
    id: 'soc-akord',
    name: 'AKORD',
    fullName: 'AKORD Music Society',
    description: 'Vocal ensembles, instrumental bands, classical fusion, and digital music production.',
    category: 'Culture & Creative Arts',
    accentColor: '#a855f7',
    badgeCode: 'AKR',
    activeEventsCount: 2,
  },
  {
    id: 'soc-pravaha',
    name: 'Pravaha',
    fullName: 'Pravaha: The Dance Society',
    description: 'Classical, western contemporary, and folk choreography productions.',
    category: 'Culture & Creative Arts',
    accentColor: '#f43f5e',
    badgeCode: 'PRV',
    activeEventsCount: 1,
  },
  {
    id: 'soc-pixels',
    name: 'Pixels N Panels',
    fullName: 'Pixels N Panels',
    description: 'Visual arts, graphic design, comic illustration, and digital photography.',
    category: 'Culture & Creative Arts',
    accentColor: '#38bdf8',
    badgeCode: 'PNP',
    activeEventsCount: 2,
  },
  {
    id: 'soc-sahityika',
    name: 'Sahityika',
    fullName: 'Sahityika: Literary Society',
    description: 'Creative writing workshops, poetry slams, book discussions, and campus literary journals.',
    category: 'Culture & Creative Arts',
    accentColor: '#eab308',
    badgeCode: 'SHT',
    activeEventsCount: 1,
  },
  {
    id: 'soc-deva-bhasha',
    name: 'Deva-Bhasha',
    fullName: 'Deva-Bhasha: The Sanskrit Society',
    description: 'Sanskrit linguistics, ancient scientific treatises, and classical literature studies.',
    category: 'Culture & Creative Arts',
    accentColor: '#d97706',
    badgeCode: 'DVB',
    activeEventsCount: 1,
  },

  // 4. Debate & Knowledge
  {
    id: 'soc-wyz-kids',
    name: 'WYZ Kids',
    fullName: 'WYZ Kids: IITM BS Quiz Society',
    description: 'General quiz competitions, domain trivia, and the Inter-House Quiz League.',
    category: 'Debate & Knowledge',
    accentColor: '#6366f1',
    badgeCode: 'WYZ',
    activeEventsCount: 3,
  },
  {
    id: 'soc-adhyay',
    name: 'Adhyay',
    fullName: 'Adhyay - The Civil Services Society',
    description: 'Public administration, policy analysis, governance case studies, and civil services guidance.',
    category: 'Debate & Knowledge',
    accentColor: '#0ea5e9',
    badgeCode: 'ADH',
    activeEventsCount: 1,
  },
  {
    id: 'soc-diplomacia',
    name: 'Diplomacia',
    fullName: 'Diplomacia',
    description: 'Model United Nations, parliamentary debate, foreign affairs, and geopolitical discussions.',
    category: 'Debate & Knowledge',
    accentColor: '#3b82f6',
    badgeCode: 'DPL',
    activeEventsCount: 2,
  },
  {
    id: 'soc-jitsie',
    name: 'JITSIE',
    fullName: 'JITSIE',
    description: 'Student publication, campus journalism, interview features, and investigative articles.',
    category: 'Debate & Knowledge',
    accentColor: '#8b5cf6',
    badgeCode: 'JIT',
    activeEventsCount: 1,
  },

  // 5. Sports & Gaming
  {
    id: 'soc-shah-maat',
    name: 'Shah Maat',
    fullName: 'Shah Maat - Chess Society',
    description: 'Blitz and rapid chess tournaments, grandmaster game analysis, and inter-house chess ladders.',
    category: 'Sports & Gaming',
    accentColor: '#64748b',
    badgeCode: 'SHM',
    activeEventsCount: 2,
  },
  {
    id: 'soc-sportify',
    name: 'Sportify',
    fullName: 'Sportify - Sports Society',
    description: 'Intramural athletic tournaments, football, cricket, badminton leagues, and fitness routines.',
    category: 'Sports & Gaming',
    accentColor: '#10b981',
    badgeCode: 'SPT',
    activeEventsCount: 2,
  },
  {
    id: 'soc-heighers',
    name: 'Heighers',
    fullName: 'Heighers eSports Society',
    description: 'Competitive gaming tournaments, LAN finals, Valorant, BGMI, and Rocket League showdowns.',
    category: 'Sports & Gaming',
    accentColor: '#f97316',
    badgeCode: 'HGR',
    activeEventsCount: 2,
  },

  // 6. Community & Other Interests
  {
    id: 'soc-raahat',
    name: 'RAAHAT',
    fullName: 'RAAHAT: Mental Health & Wellness Society',
    description: 'Peer counseling, wellness circles, stress management before midterms, and mindfulness.',
    category: 'Community & Other Interests',
    accentColor: '#2dd4bf',
    badgeCode: 'RHT',
    activeEventsCount: 2,
  },
  {
    id: 'soc-sahara',
    name: 'SAHARA',
    fullName: 'SAHARA - The Social Welfare Society',
    description: 'Community service, educational outreach, digital literacy, and NGO volunteering drives.',
    category: 'Community & Other Interests',
    accentColor: '#84cc16',
    badgeCode: 'SHR',
    activeEventsCount: 1,
  },
  {
    id: 'soc-nature-nurture',
    name: 'Nature Nurture',
    fullName: 'Nature Nurture Society',
    description: 'Environmental conservation, campus cleanliness, tree planting, and sustainability audits.',
    category: 'Community & Other Interests',
    accentColor: '#22c55e',
    badgeCode: 'NN',
    activeEventsCount: 1,
  },
  {
    id: 'soc-boundless',
    name: 'Boundless',
    fullName: 'Boundless - IITM BS Travel Society',
    description: 'Regional travel meetups, trekking expeditions, cultural heritage trails, and local group itineraries.',
    category: 'Community & Other Interests',
    accentColor: '#06b6d4',
    badgeCode: 'BND',
    activeEventsCount: 1,
  },
  {
    id: 'soc-avasya',
    name: 'AVASYA',
    fullName: 'AVASYA Society',
    description: 'Social networking, regional student chapters, and cross-house community bonds.',
    category: 'Community & Other Interests',
    accentColor: '#a855f7',
    badgeCode: 'AVS',
    activeEventsCount: 1,
  },
  {
    id: 'soc-alpha-gamma-nu',
    name: 'Alpha Gamma Nu',
    fullName: 'Alpha Gamma Nu',
    description: 'Leadership development, alumni relations, and student guild activities.',
    category: 'Community & Other Interests',
    accentColor: '#6366f1',
    badgeCode: 'AGN',
    activeEventsCount: 1,
  },
];

export function getSocieties(): Society[] {
  return OFFICIAL_SOCIETIES;
}

export function getSocietyCategories(): SocietyCategory[] {
  return [
    'Technology & Research',
    'Business & Entrepreneurship',
    'Culture & Creative Arts',
    'Debate & Knowledge',
    'Sports & Gaming',
    'Community & Other Interests',
  ];
}

export function getSocietyById(id: string): Society | undefined {
  return OFFICIAL_SOCIETIES.find((s) => s.id === id);
}

export interface SocietyPresentationMeta {
  fullName: string;
  accentColor: string;
  badgeCode: string;
  demoActiveEventsCount: number;
}

const SOCIETY_META_BY_NAME = new Map<string, SocietyPresentationMeta>(
  OFFICIAL_SOCIETIES.map((s) => [
    s.name.toLowerCase().trim(),
    {
      fullName: s.fullName,
      accentColor: s.accentColor,
      badgeCode: s.badgeCode,
      demoActiveEventsCount: s.activeEventsCount,
    },
  ])
);

/**
 * Look up static presentation metadata (fullName, accentColor, badgeCode, demoActiveEventsCount)
 * by canonical society name.
 */
export function getSocietyPresentationMeta(name: string): SocietyPresentationMeta {
  const meta = SOCIETY_META_BY_NAME.get(name.toLowerCase().trim());
  if (meta) {
    return meta;
  }

  // Safe fallback for uncataloged societies
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return {
    fullName: name,
    accentColor: '#43E5D2',
    badgeCode: initials || 'SOC',
    demoActiveEventsCount: 0,
  };
}

/**
 * Merges a live Supabase society record with canonical presentation metadata.
 * Uses the database UUID as the authoritative record identifier.
 * Preserves live name, description, and category from Supabase.
 */
export function mergeDbSocietyWithMeta(dbSociety: {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}): Society {
  const meta = getSocietyPresentationMeta(dbSociety.name);
  return {
    id: dbSociety.id,
    name: dbSociety.name,
    fullName: meta.fullName || dbSociety.name,
    description: dbSociety.description ?? '',
    category: (dbSociety.category as SocietyCategory) || 'Community & Other Interests',
    accentColor: meta.accentColor,
    badgeCode: meta.badgeCode,
    activeEventsCount: meta.demoActiveEventsCount,
  };
}

