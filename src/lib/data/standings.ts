import { HouseStanding, CompetitionScoreBreakdown, AcademicTerm } from '@/types';

/**
 * Proposed HouseOS Community Cup Leaderboard
 * 
 * DISCLAIMER: This is a proposed, illustrative demonstration feature for Phase 1.
 * It does NOT represent an official IIT Madras BS ranking system, policy, or actual student record.
 * 
 * Configurable Demo Scoring Policy:
 * - 1st Place in Verified Inter-House Event: 100 points
 * - 2nd Place (Runner-up): 70 points
 * - 3rd Place: 50 points
 * - Verified House Participation: 10 points
 */

export const SCORING_POLICY = {
  FIRST_PLACE: 100,
  SECOND_PLACE: 70,
  THIRD_PLACE: 50,
  PARTICIPATION: 10,
};

export const SAMPLE_COMPETITIONS: CompetitionScoreBreakdown[] = [
  {
    id: 'comp-01',
    competitionTitle: 'Inter-House Quiz Championship 2026',
    organizingSociety: 'WYZ Kids: IITM BS Quiz Society',
    term: 'Sep',
    date: 'Sep 28, 2026',
    winnerHouse: 'Saranda House',
    runnerUpHouse: 'Nilgiri House',
    thirdHouse: 'Sundarbans House',
    participatingHouses: [
      'Saranda House',
      'Nilgiri House',
      'Sundarbans House',
      'Kaziranga House',
      'Nallamala House',
      'Gir House',
    ],
  },
  {
    id: 'comp-02',
    competitionTitle: 'Grandmaster Rapid Chess Blitz',
    organizingSociety: 'Shah Maat - Chess Society',
    term: 'Sep',
    date: 'Oct 04, 2026',
    winnerHouse: 'Kaziranga House',
    runnerUpHouse: 'Saranda House',
    thirdHouse: 'Nallamala House',
    participatingHouses: [
      'Kaziranga House',
      'Saranda House',
      'Nallamala House',
      'Bandipur House',
      'Corbett House',
      'Kanha House',
    ],
  },
  {
    id: 'comp-03',
    competitionTitle: '48-Hour Open Source Sprint',
    organizingSociety: 'CodeCrafters Coding Society',
    term: 'Sep',
    date: 'Oct 09, 2026',
    winnerHouse: 'Sundarbans House',
    runnerUpHouse: 'Saranda House',
    thirdHouse: 'Wayanad House',
    participatingHouses: [
      'Sundarbans House',
      'Saranda House',
      'Wayanad House',
      'Pichavaram House',
      'Namdapha House',
      'Gir House',
    ],
  },
  {
    id: 'comp-04',
    competitionTitle: 'Annual Campus Equity Valuation Challenge',
    organizingSociety: 'Amartya - The Finance Society',
    term: 'May',
    date: 'Jun 14, 2026',
    winnerHouse: 'Nallamala House',
    runnerUpHouse: 'Saranda House',
    thirdHouse: 'Nilgiri House',
    participatingHouses: [
      'Nallamala House',
      'Saranda House',
      'Nilgiri House',
      'Kaziranga House',
      'Pichavaram House',
    ],
  },
  {
    id: 'comp-05',
    competitionTitle: 'National Science Day Research Poster Symposium',
    organizingSociety: 'RaSoR: Ramanujan Society of Research',
    term: 'Jan',
    date: 'Feb 26, 2026',
    winnerHouse: 'Saranda House',
    runnerUpHouse: 'Kaziranga House',
    thirdHouse: 'Bandipur House',
    participatingHouses: [
      'Saranda House',
      'Kaziranga House',
      'Bandipur House',
      'Wayanad House',
      'Corbett House',
    ],
  },
];

// Deterministic mock standings across all 12 houses
export const ALL_HOUSE_STANDINGS: HouseStanding[] = [
  {
    rank: 1,
    houseName: 'Saranda House',
    points: 1540,
    janPoints: 510,
    mayPoints: 480,
    sepPoints: 550,
    pointsThisWeek: 70,
    isCurrentHouse: true,
    colorHex: '#6366f1',
    recentContribution: '+100 pts: 1st Place in WYZ Kids Quiz Championship',
  },
  {
    rank: 2,
    houseName: 'Kaziranga House',
    points: 1470,
    janPoints: 490,
    mayPoints: 470,
    sepPoints: 510,
    pointsThisWeek: 100,
    isCurrentHouse: false,
    colorHex: '#06b6d4',
    recentContribution: '+100 pts: 1st Place in Shah Maat Rapid Chess Clash',
  },
  {
    rank: 3,
    houseName: 'Sundarbans House',
    points: 1420,
    janPoints: 460,
    mayPoints: 460,
    sepPoints: 500,
    pointsThisWeek: 100,
    isCurrentHouse: false,
    colorHex: '#10b981',
    recentContribution: '+100 pts: 1st Place in CodeCrafters Open Source Sprint',
  },
  {
    rank: 4,
    houseName: 'Nilgiri House',
    points: 1390,
    janPoints: 470,
    mayPoints: 450,
    sepPoints: 470,
    pointsThisWeek: 70,
    isCurrentHouse: false,
    colorHex: '#8b5cf6',
    recentContribution: '+70 pts: 2nd Place in WYZ Kids Quiz Championship',
  },
  {
    rank: 5,
    houseName: 'Nallamala House',
    points: 1350,
    janPoints: 440,
    mayPoints: 490,
    sepPoints: 420,
    pointsThisWeek: 50,
    isCurrentHouse: false,
    colorHex: '#38bdf8',
    recentContribution: '+50 pts: 3rd Place in Shah Maat Rapid Chess Clash',
  },
  {
    rank: 6,
    houseName: 'Bandipur House',
    points: 1310,
    janPoints: 460,
    mayPoints: 430,
    sepPoints: 420,
    pointsThisWeek: 10,
    isCurrentHouse: false,
    colorHex: '#ec4899',
    recentContribution: '+10 pts: Participation in Shah Maat Rapid Chess',
  },
  {
    rank: 7,
    houseName: 'Wayanad House',
    points: 1290,
    janPoints: 430,
    mayPoints: 430,
    sepPoints: 430,
    pointsThisWeek: 50,
    isCurrentHouse: false,
    colorHex: '#84cc16',
    recentContribution: '+50 pts: 3rd Place in CodeCrafters Sprint',
  },
  {
    rank: 8,
    houseName: 'Gir House',
    points: 1260,
    janPoints: 420,
    mayPoints: 420,
    sepPoints: 420,
    pointsThisWeek: 10,
    isCurrentHouse: false,
    colorHex: '#f97316',
    recentContribution: '+10 pts: Participation in WYZ Kids Quiz',
  },
  {
    rank: 9,
    houseName: 'Corbett House',
    points: 1240,
    janPoints: 430,
    mayPoints: 410,
    sepPoints: 400,
    pointsThisWeek: 10,
    isCurrentHouse: false,
    colorHex: '#a855f7',
    recentContribution: '+10 pts: Participation in Shah Maat Rapid Chess',
  },
  {
    rank: 10,
    houseName: 'Pichavaram House',
    points: 1220,
    janPoints: 410,
    mayPoints: 410,
    sepPoints: 400,
    pointsThisWeek: 10,
    isCurrentHouse: false,
    colorHex: '#2dd4bf',
    recentContribution: '+10 pts: Participation in CodeCrafters Sprint',
  },
  {
    rank: 11,
    houseName: 'Kanha House',
    points: 1190,
    janPoints: 400,
    mayPoints: 400,
    sepPoints: 390,
    pointsThisWeek: 10,
    isCurrentHouse: false,
    colorHex: '#ef4444',
    recentContribution: '+10 pts: Participation in Shah Maat Rapid Chess',
  },
  {
    rank: 12,
    houseName: 'Namdapha House',
    points: 1170,
    janPoints: 390,
    mayPoints: 390,
    sepPoints: 390,
    pointsThisWeek: 10,
    isCurrentHouse: false,
    colorHex: '#eab308',
    recentContribution: '+10 pts: Participation in CodeCrafters Sprint',
  },
];

export function getStandingsByTerm(
  term: 'all' | AcademicTerm = 'Sep'
): HouseStanding[] {
  if (term === 'all') {
    // Sort by cumulative points
    return [...ALL_HOUSE_STANDINGS].sort((a, b) => b.points - a.points);
  }

  // Sort by specific term points
  const key =
    term === 'Jan' ? 'janPoints' : term === 'May' ? 'mayPoints' : 'sepPoints';

  const sorted = [...ALL_HOUSE_STANDINGS].sort((a, b) => b[key] - a[key]);

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
    points: item[key],
  }));
}

export function getSampleCompetitions(): CompetitionScoreBreakdown[] {
  return SAMPLE_COMPETITIONS;
}
