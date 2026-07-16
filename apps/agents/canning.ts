// canning.ts — Canning Capacity Matcher
// Returns ranked FacilityMatch[] — never auto-books. Agent recommends. You decide.

import type { SurplusLot, CanningFacility, FacilityMatch, CanningJob } from '../../packages/shared/src/types';

export type CoPackerSlot = {
  coPackerId: string;
  name: string;
  location: string;
  availableDate: string;
  capacityLbsPerDay: number;
  costPerCan: number;
};

export const mockCoPacker: CoPackerSlot[] = [
  {
    coPackerId: 'cp-bay-001',
    name: 'Bay Area Cannery Co-Pack',
    location: 'Richmond, CA',
    availableDate: '2026-07-22',
    capacityLbsPerDay: 5000,
    costPerCan: 0.38,
  },
];

const STATE_DISTANCE_SCORE: Record<string, number> = {
  CA: 25,
  OR: 18,
  WA: 12,
};

export function matchFacilities(
  lot: SurplusLot,
  facilities: CanningFacility[]
): FacilityMatch[] {
  const CANS_PER_LB = 1.8;
  const results: FacilityMatch[] = [];

  for (const facility of facilities) {
    if (!facility.compatibleSpecies.includes(lot.species as any)) continue;

    const validSlots = facility.availableSlots.filter(
      s => !s.reserved && s.capacityLbs >= lot.minOrderLbs
    );
    if (validSlots.length === 0) continue;

    const bestSlot = validSlots.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

    const estimatedCans = Math.floor(lot.weightLbs * CANS_PER_LB * 0.88); // 88% yield
    const estimatedDays = Math.ceil(lot.weightLbs / facility.capacityLbsPerDay);
    const totalCanningCost = Math.round(estimatedCans * facility.costPerCan * 100) / 100;

    // Score: capacity fit (40) + cost (35) + geography (25)
    const capacityScore = Math.min(40, Math.round((Math.min(1, lot.weightLbs / facility.capacityLbsPerDay)) * 40));
    const costScore = Math.round((1 - Math.min(1, facility.costPerCan / 0.50)) * 35);
    const geoScore = STATE_DISTANCE_SCORE[facility.state] ?? 10;
    const matchScore = capacityScore + costScore + geoScore;

    results.push({
      facility,
      slot: bestSlot,
      matchScore,
      matchReason:
        `${facility.name} is compatible with ${lot.species}, ` +
        `can process ${lot.weightLbs.toLocaleString()} lbs in ~${estimatedDays} day(s), ` +
        `earliest slot ${bestSlot.date}, cost $${facility.costPerCan}/can.`,
      estimatedCans,
      estimatedDays,
      totalCanningCost,
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

// Legacy exports — kept for backward compat
export function buildCanningJob(surplusId: string, lbs: number, slot: CoPackerSlot): CanningJob {
  const cansTarget = Math.floor(lbs * 1.8);
  return {
    surplusId,
    coPackerId: slot.coPackerId,
    cansTarget,
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
