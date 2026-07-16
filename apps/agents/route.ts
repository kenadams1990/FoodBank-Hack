// route.ts — Equity-Aware Delivery Planner
// Drafts ShipmentDraft[] by demand urgency. Agent recommends. Human releases.

import type { FoodBank, CanningFacility } from '../../packages/shared/src/types';

export type ShipmentDraft = {
  foodBankId: string;
  foodBankName: string;
  region: string;
  cansAllocated: number;
  casesAllocated: number;
  deliveryWindow: string;
  routeNotes: string;
};

/** Allocates cans to food banks by demand, highest demand first */
export function planDelivery(
  totalCans: number,
  foodBanks: FoodBank[],
  facility: CanningFacility
): ShipmentDraft[] {
  const CANS_PER_CASE = 24;
  const sorted = [...foodBanks].sort(
    (a, b) => b.monthlyDemandCases - a.monthlyDemandCases
  );

  let remaining = totalCans;
  const drafts: ShipmentDraft[] = [];

  for (const fb of sorted) {
    if (remaining <= 0) break;
    const wantedCans = fb.monthlyDemandCases * CANS_PER_CASE;
    const allocated = Math.min(wantedCans, remaining);
    remaining -= allocated;

    drafts.push({
      foodBankId: fb.id,
      foodBankName: fb.name,
      region: fb.region,
      cansAllocated: allocated,
      casesAllocated: Math.floor(allocated / CANS_PER_CASE),
      deliveryWindow: fb.accessWindows[0] ?? 'TBD',
      routeNotes: [
        `Dispatch from ${facility.location}.`,
        fb.dietaryPrefs.length ? `Dietary notes: ${fb.dietaryPrefs.join(', ')}.` : '',
        `Confirm receipt within 24hrs of delivery.`,
      ].filter(Boolean).join(' '),
    });
  }

  return drafts;
}

// Legacy exports — kept for backward compat
export type DeliveryPlan = {
  agencyId: string;
  neighborhood: string;
  cansAllocated: number;
  deliveryWindow: string;
  routeNotes: string;
};

import type { AgencyNeed } from '../../packages/shared/src/types';
export const mockAgencyNeeds: AgencyNeed[] = [
  { agencyId: 'foodbank-oak-007', neighborhood: 'East Oakland', proteinGapLbs: 1200, accessWindows: ['Mon 9-12', 'Wed 9-12', 'Fri 9-12'], dietaryPrefs: ['halal', 'low-sodium'] },
  { agencyId: 'pantry-frm-002', neighborhood: 'Fruitvale', proteinGapLbs: 800, accessWindows: ['Tue 10-2', 'Thu 10-2'], dietaryPrefs: ['no-shellfish'] },
];

export function buildDeliveryPlan(availableCans: number, needs: AgencyNeed[]): DeliveryPlan[] {
  const sorted = [...needs].sort((a, b) => b.proteinGapLbs - a.proteinGapLbs);
  let remaining = availableCans;
  return sorted.filter(() => remaining > 0).map((agency) => {
    const cansNeeded = Math.ceil(agency.proteinGapLbs * 1.8);
    const cansAllocated = Math.min(cansNeeded, remaining);
    remaining -= cansAllocated;
    return { agencyId: agency.agencyId, neighborhood: agency.neighborhood, cansAllocated, deliveryWindow: agency.accessWindows[0], routeNotes: `Dietary: ${agency.dietaryPrefs.join(', ')}. EV truck preferred.` };
  });
}
