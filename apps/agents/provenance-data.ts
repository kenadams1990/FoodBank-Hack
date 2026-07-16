// provenance-data.ts — source-water contamination reference for the provenance
// check (Piece 3). This is the "test the water, not the fish" idea: heavy-metal
// risk is a property of where the catch came from, so we join catch location
// against known contaminant levels instead of lab-testing every fish.
//
// Levels below are ILLUSTRATIVE / MODELLED for the demo, informed by:
//   • NOAA National Status & Trends — Mussel Watch Program
//     (heavy-metal-in-tissue trends at 300+ coastal sites)
//     https://coastalscience.noaa.gov/science-areas/pollution/mussel-watch/
//   • CA OEHHA fish-consumption advisories (location-specific)
// They are NOT sourced per-site figures — replace with a real Mussel Watch /
// OEHHA lookup for production. Citation is surfaced in the reason string so a
// judge can see the attribution.

export type ContaminationRisk = 'LOW' | 'ELEVATED' | 'HIGH';

export interface ProvenanceSite {
  name: string;
  lat: number;
  lng: number;
  /** Lowercased substrings matched against a catch's `location` string. */
  keywords: string[];
  risk: ContaminationRisk;
  note: string;
}

export const PROVENANCE_SITES: ProvenanceSite[] = [
  {
    name: 'Bodega Bay',
    lat: 38.333,
    lng: -123.048,
    keywords: ['bodega'],
    risk: 'LOW',
    note: 'Open-coast source, no legacy-contaminant history — clean.',
  },
  {
    name: 'Monterey Bay',
    lat: 36.8,
    lng: -121.9,
    keywords: ['monterey'],
    risk: 'LOW',
    note: 'Open bay, national marine sanctuary — low heavy-metal signal.',
  },
  {
    name: 'Tomales Bay',
    lat: 38.163,
    lng: -122.9,
    keywords: ['tomales'],
    risk: 'LOW',
    note: 'Designated shellfish-growing waters (aquaculture) — clean.',
  },
  {
    name: 'San Francisco Bay',
    lat: 37.8,
    lng: -122.3,
    keywords: ['san francisco bay', 'sf bay', 'oakland', 'richmond'],
    risk: 'ELEVATED',
    note: 'OEHHA advisory water — legacy mercury/PCB; route lot for lab screening.',
  },
  {
    name: 'Los Angeles / Palos Verdes Shelf',
    lat: 33.72,
    lng: -118.32,
    keywords: ['palos verdes', 'san pedro', 'los angeles harbor'],
    risk: 'HIGH',
    note: 'Superfund-adjacent DDT/PCB shelf — do not process without clearance.',
  },
];
