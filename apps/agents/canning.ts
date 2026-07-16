// canning.ts — Canning Capacity Matcher
// Returns ranked FacilityMatch[]. Agent recommends. Human books.

import type { SurplusLot, CanningFacility } from '../../packages/shared/src/types';

export type FacilityMatch = {
  facility: CanningFacility;
  recommendedSlotDate: string;
  estimatedDays: number;
  estimatedCans: number;
  estimatedCost: number;
  matchScore: number;  // 0–100
  rationale: string;
};

/** Ranks facilities by species compat, capacity, proximity, and cost */
export function matchFacilities(
  lot: SurplusLot,
  facilities: CanningFacility[]
): FacilityMatch[] {
  const LBS_PER_CAN = 0.55; // ~14.75oz net weight
  const CANS_PER_CASE = 24;

  const matches: FacilityMatch[] = [];

  for (const facility of facilities) {
    if (!facility.compatibleSpecies.includes(lot.species)) continue;

    const availableSlot = facility.availableSlots
      .filter(s => new Date(s.date) >= new Date() && s.capacityLbs >= lot.lbs * 0.5)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    if (!availableSlot) continue;

    const estimatedCans = Math.floor((lot.lbs * 0.88) / LBS_PER_CAN); // 88% yield
    const estimatedCases = Math.floor(estimatedCans / CANS_PER_CASE);
    const estimatedDays = Math.ceil(lot.lbs / (facility.capacityCasesPerDay * CANS_PER_CASE * LBS_PER_CAN));
    const estimatedCost = Math.round(estimatedCans * facility.costPerCan * 100) / 100;

    // Score: capacity fit (40) + certification depth (30) + cost efficiency (30)
    const capacityFit = Math.min(availableSlot.capacityLbs / lot.lbs, 1) * 40;
    const certScore = Math.min(facility.certifications.length / 3, 1) * 30;
    const costScore = (1 - Math.min(facility.costPerCan / 0.50, 1)) * 30;
    const matchScore = Math.round(capacityFit + certScore + costScore);

    matches.push({
      facility,
      recommendedSlotDate: availableSlot.date,
      estimatedDays,
      estimatedCans,
      estimatedCost,
      matchScore,
      rationale: `${facility.name} (${facility.location}): ` +
        `${availableSlot.capacityLbs.toLocaleString()} lbs capacity on ${availableSlot.date}. ` +
        `Est. ${estimatedCans.toLocaleString()} cans over ${estimatedDays} day(s). ` +
        `Cost: $${estimatedCost.toLocaleString()} at $${facility.costPerCan}/can. ` +
        `Certs: ${facility.certifications.join(', ')}.`,
    });
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
