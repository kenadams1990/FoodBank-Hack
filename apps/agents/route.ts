// route.ts — Equity-Aware Delivery Planner
// Returns ShipmentDraft[] — never auto-assigns. Agent recommends. You decide.

import type { SurplusLot, FoodBank, ShipmentDraft, AgencyNeed } from '../../packages/shared/src/types';

export type DeliveryPlan = {
  agencyId: string;
  neighborhood: string;
  cansAllocated: number;
  deliveryWindow: string;
  routeNotes: string;
};

export const mockAgencyNeeds: AgencyNeed[] = [
  {
    agencyId: 'foodbank-oak-007',
    neighborhood: 'East Oakland',
    proteinGapLbs: 1200,
    accessWindows: ['Mon 9-12', 'Wed 9-12', 'Fri 9-12'],
    dietaryPrefs: ['halal', 'low-sodium'],
  },
  {
    agencyId: 'pantry-frm-002',
    neighborhood: 'Fruitvale',
    proteinGapLbs: 800,
    accessWindows: ['Tue 10-2', 'Thu 10-2'],
    dietaryPrefs: ['no-shellfish'],
  },
];

export function planDelivery(
  lot: SurplusLot,
  estimatedCans: number,
  foodBanks: FoodBank[]
): ShipmentDraft[] {
  const CANS_PER_CASE = 24;
  // Filter out dietary incompatibilities
  const eligible = foodBanks.filter(fb => {
    if (lot.species === 'Dungeness Crab' && fb.dietaryRestrictions.includes('no-shellfish')) return false;
    return true;
  });

  // Sort by priority score descending
  const sorted = [...eligible].sort((a, b) => b.priorityScore - a.priorityScore);

  let remaining = estimatedCans;
  const drafts: ShipmentDraft[] = [];

  for (const fb of sorted) {
    if (remaining <= 0) break;
    const cansNeeded = fb.monthlyDemandCases * CANS_PER_CASE;
    const cansAllocated = Math.min(Math.round(cansNeeded * 0.4), remaining); // cap at 40% of monthly demand per delivery
    if (cansAllocated <= 0) continue;
    remaining -= cansAllocated;
    drafts.push({
      foodBank: fb,
      cansAllocated,
      deliveryWindow: fb.accessWindows[0],
      routeNotes:
        `Priority score ${fb.priorityScore}. ` +
        `Dietary: ${fb.dietaryRestrictions.join(', ') || 'none'}. ` +
        `Receiving: ${fb.accessWindows[0]}. EV truck preferred.`,
      priorityReason:
        `${fb.name} has priority score ${fb.priorityScore}/100 and monthly demand of ` +
        `${fb.monthlyDemandCases} cases. This delivery covers ~${Math.round((cansAllocated / (fb.monthlyDemandCases * CANS_PER_CASE)) * 100)}% of monthly need.`,
    });
  }

  return drafts;
}

// Legacy export — kept for backward compat
export function buildDeliveryPlan(availableCans: number, needs: AgencyNeed[]): DeliveryPlan[] {
  const sorted = [...needs].sort((a, b) => b.proteinGapLbs - a.proteinGapLbs);
  let remaining = availableCans;
  return sorted
    .filter(() => remaining > 0)
    .map((agency) => {
      const cansNeeded = Math.ceil(agency.proteinGapLbs * 1.8);
      const cansAllocated = Math.min(cansNeeded, remaining);
      remaining -= cansAllocated;
      return {
        agencyId: agency.agencyId,
        neighborhood: agency.neighborhood,
        cansAllocated,
        deliveryWindow: agency.accessWindows[0],
        routeNotes: `Dietary: ${agency.dietaryPrefs.join(', ')}. EV truck preferred.`,
      };
    });
}
