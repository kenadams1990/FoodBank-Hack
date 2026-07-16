// canning.ts — Canning Capacity Matcher
// Ranks facilities by species compatibility, geography, and throughput.
// Returns FacilityMatch[] — requires FACILITY_BOOKING approval before committing.

import type { SurplusLot, CanningFacility, FacilityMatch, CanningJob } from '../../packages/shared/src/types';

/** Haversine distance (km) between two lat/lng pairs — simplified as city-distance proxy */
const REGION_DISTANCES: Record<string, Record<string, number>> = {
  'CA': { 'CA': 0, 'OR': 650, 'WA': 1200 },
  'OR': { 'CA': 650, 'OR': 0, 'WA': 350 },
  'WA': { 'CA': 1200, 'OR': 350, 'WA': 0 },
};

function extractState(location: string): string {
  const match = location.match(/,\s*([A-Z]{2})$/);
  return match ? match[1] : 'CA';
}

function geoScore(lotLocation: string, facilityLocation: string): number {
  const lotState = extractState(lotLocation);
  const facState = extractState(facilityLocation);
  const dist = REGION_DISTANCES[lotState]?.[facState] ?? 800;
  return Math.max(0, Math.round(100 - dist / 15));
}

export function matchFacilities(
  lot: SurplusLot,
  facilities: CanningFacility[]
): FacilityMatch[] {
  const compatible = facilities.filter(
    (f) =>
      f.compatibleSpecies.includes(lot.species) &&
      new Date(f.availableFrom) <= new Date(lot.expiryDate)
  );

  return compatible
    .map((f) => {
      const geo = geoScore(lot.location, f.location);
      // Capacity: how many days to process the lot?
      const estimatedDays = Math.ceil(lot.lbs / (f.capacityCasesPerDay * 24 * 0.3));
      const capScore = Math.max(0, Math.round(100 - estimatedDays * 10));
      // Certification bonus
      const certBonus = f.certifications.includes('SQF Level 3') ? 10 : f.certifications.includes('SQF Level 2') ? 5 : 0;
      const matchScore = Math.min(100, Math.round(geo * 0.4 + capScore * 0.45 + certBonus));
      const estimatedCases = Math.floor(lot.lbs * 1.8 / 24); // 24 cans/case
      return {
        facility: f,
        matchScore,
        estimatedDays,
        estimatedCases,
        rationale:
          `${f.name} in ${f.location}: ${estimatedDays} day(s) to process. ` +
          `Est. ${estimatedCases.toLocaleString()} cases at $${f.costPerCan}/can. ` +
          `Geo score ${geo}/100. Certifications: ${f.certifications.join(', ')}.`,
      } as FacilityMatch;
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/** Legacy: builds a CanningJob from lot + selected facility */
export function buildCanningJob(surplusId: string, lbs: number, slot: { coPackerId: string; name: string; availableDate: string; capacityLbsPerDay: number; costPerCan: number }): CanningJob {
  return {
    surplusId,
    coPackerId: slot.coPackerId,
    cansTarget: Math.floor(lbs * 1.8),
    stagePlan: [
      `Transport ${lbs} lbs to ${slot.name} by ${slot.availableDate}`,
      `Inspect + sort at receiving dock`,
      `Run canning line: ~${Math.ceil(lbs / slot.capacityLbsPerDay)} day(s)`,
      `Label + palletize: TideLift x [FoodBank Partner]`,
      `Stage for route agent pickup`,
    ],
    yieldPct: 88,
  };
}

export const mockCoPacker = [{
  coPackerId: 'cp-bay-001', name: 'Bay Area Cannery Co-Pack',
  location: 'Richmond, CA', availableDate: '2026-07-22',
  capacityLbsPerDay: 5000, costPerCan: 0.38,
}];
