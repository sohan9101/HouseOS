import { House } from '@/types';

/**
 * Official IIT Madras BS House Directory
 * 
 * Final 12 Houses:
 * 1. Saranda House
 * 2. Nallamala House
 * 3. Pichavaram House
 * 4. Sundarbans House
 * 5. Wayanad House
 * 6. Namdapha House
 * 7. Gir House
 * 8. Kanha House
 * 9. Bandipur House
 * 10. Corbett House
 * 11. Nilgiri House
 * 12. Kaziranga House
 * 
 * Note: Individual official house logo image assets are not present in the repository.
 * We render clean neutral crest badges with distinctive color accents as fallback.
 */

export const OFFICIAL_HOUSES: House[] = [
  {
    id: 'house-saranda',
    name: 'Saranda House',
    code: 'SRN',
    zone: 'East Zone',
    colorHex: '#6366f1', // Indigo
    accentHex: '#818cf8',
    residentCount: 312,
  },
  {
    id: 'house-nallamala',
    name: 'Nallamala House',
    code: 'NLM',
    zone: 'South Zone',
    colorHex: '#38bdf8', // Sky
    accentHex: '#7dd3fc',
    residentCount: 298,
  },
  {
    id: 'house-pichavaram',
    name: 'Pichavaram House',
    code: 'PCH',
    zone: 'Coastal Zone',
    colorHex: '#2dd4bf', // Teal
    accentHex: '#5eead4',
    residentCount: 305,
  },
  {
    id: 'house-sundarbans',
    name: 'Sundarbans House',
    code: 'SND',
    zone: 'Delta Zone',
    colorHex: '#10b981', // Emerald
    accentHex: '#34d399',
    residentCount: 320,
  },
  {
    id: 'house-wayanad',
    name: 'Wayanad House',
    code: 'WYD',
    zone: 'Highland Zone',
    colorHex: '#84cc16', // Lime
    accentHex: '#a3e635',
    residentCount: 290,
  },
  {
    id: 'house-namdapha',
    name: 'Namdapha House',
    code: 'NDP',
    zone: 'Northeast Zone',
    colorHex: '#eab308', // Yellow
    accentHex: '#fde047',
    residentCount: 285,
  },
  {
    id: 'house-gir',
    name: 'Gir House',
    code: 'GIR',
    zone: 'West Zone',
    colorHex: '#f97316', // Orange
    accentHex: '#fb923c',
    residentCount: 310,
  },
  {
    id: 'house-kanha',
    name: 'Kanha House',
    code: 'KNH',
    zone: 'Central Zone',
    colorHex: '#ef4444', // Red
    accentHex: '#f87171',
    residentCount: 300,
  },
  {
    id: 'house-bandipur',
    name: 'Bandipur House',
    code: 'BND',
    zone: 'Plateau Zone',
    colorHex: '#ec4899', // Pink
    accentHex: '#f472b6',
    residentCount: 295,
  },
  {
    id: 'house-corbett',
    name: 'Corbett House',
    code: 'CBT',
    zone: 'Foothills Zone',
    colorHex: '#a855f7', // Purple
    accentHex: '#c084fc',
    residentCount: 315,
  },
  {
    id: 'house-nilgiri',
    name: 'Nilgiri House',
    code: 'NLG',
    zone: 'Blue Ridge Zone',
    colorHex: '#8b5cf6', // Violet
    accentHex: '#a78bfa',
    residentCount: 308,
  },
  {
    id: 'house-kaziranga',
    name: 'Kaziranga House',
    code: 'KZR',
    zone: 'Riverine Zone',
    colorHex: '#06b6d4', // Cyan
    accentHex: '#22d3ee',
    residentCount: 325,
  },
];

export function getHouses(): House[] {
  return OFFICIAL_HOUSES;
}

export function getHouseByName(name: string): House | undefined {
  return OFFICIAL_HOUSES.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
}

export function getHouseById(id: string): House | undefined {
  return OFFICIAL_HOUSES.find((h) => h.id === id);
}

export interface HousePresentationMeta {
  code: string;
  zone: string;
  colorHex: string;
  accentHex: string;
  demoResidentCount: number;
}

export const HOUSE_PRESENTATION_METADATA: Record<string, HousePresentationMeta> = {
  saranda: { code: 'SRN', zone: 'East Zone', colorHex: '#6366f1', accentHex: '#818cf8', demoResidentCount: 312 },
  nallamala: { code: 'NLM', zone: 'South Zone', colorHex: '#38bdf8', accentHex: '#7dd3fc', demoResidentCount: 298 },
  pichavaram: { code: 'PCH', zone: 'Coastal Zone', colorHex: '#2dd4bf', accentHex: '#5eead4', demoResidentCount: 305 },
  sundarbans: { code: 'SND', zone: 'Delta Zone', colorHex: '#10b981', accentHex: '#34d399', demoResidentCount: 320 },
  wayanad: { code: 'WYD', zone: 'Highland Zone', colorHex: '#84cc16', accentHex: '#a3e635', demoResidentCount: 290 },
  namdapha: { code: 'NDP', zone: 'Northeast Zone', colorHex: '#eab308', accentHex: '#fde047', demoResidentCount: 285 },
  gir: { code: 'GIR', zone: 'West Zone', colorHex: '#f97316', accentHex: '#fb923c', demoResidentCount: 310 },
  kanha: { code: 'KNH', zone: 'Central Zone', colorHex: '#ef4444', accentHex: '#f87171', demoResidentCount: 300 },
  bandipur: { code: 'BND', zone: 'Plateau Zone', colorHex: '#ec4899', accentHex: '#f472b6', demoResidentCount: 295 },
  corbett: { code: 'CBT', zone: 'Foothills Zone', colorHex: '#a855f7', accentHex: '#c084fc', demoResidentCount: 315 },
  nilgiri: { code: 'NLG', zone: 'Blue Ridge Zone', colorHex: '#8b5cf6', accentHex: '#a78bfa', demoResidentCount: 308 },
  kaziranga: { code: 'KZR', zone: 'Riverine Zone', colorHex: '#06b6d4', accentHex: '#22d3ee', demoResidentCount: 325 },
};

/**
 * Look up static presentation metadata (code, zone, colors) by canonical house name.
 */
export function getHousePresentationMeta(name: string): HousePresentationMeta {
  const key = name.toLowerCase().replace(/ house$/i, '').trim();
  return (
    HOUSE_PRESENTATION_METADATA[key] || {
      code: name.slice(0, 3).toUpperCase(),
      zone: 'General Campus',
      colorHex: '#43E5D2',
      accentHex: '#43E5D2',
      demoResidentCount: 300,
    }
  );
}

/**
 * Merges a live Supabase house record (id, name) with canonical presentation metadata.
 * Uses the database UUID as the authoritative record identifier.
 */
export function mergeDbHouseWithMeta(dbHouse: { id: string; name: string }): House {
  const meta = getHousePresentationMeta(dbHouse.name);
  const displayName = dbHouse.name.endsWith('House') ? dbHouse.name : `${dbHouse.name} House`;
  return {
    id: dbHouse.id,
    name: displayName,
    code: meta.code,
    zone: meta.zone,
    colorHex: meta.colorHex,
    accentHex: meta.accentHex,
    residentCount: meta.demoResidentCount,
  };
}
