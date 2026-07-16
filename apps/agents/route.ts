// route.ts — Equity-Aware Routing Agent
// Allocates canned inventory to food banks by urgency, access windows, dietary needs.

import type { AgencyNeed } from '../../packages/shared/src/types';

export type DeliveryPlan = {
  agencyId: string;
  neighborhood: string;
  cansAllocated: number;
  deliveryWindow: string;
  routeNotes: string;
};

/** Mock agency needs — replace with real food bank intake data */
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

/** Allocates cans to agencies sorted by protein gap (highest urgency first) */
export function buildDeliveryPlan(
  availableCans: number,
  needs: AgencyNeed[]
): DeliveryPlan[] {
  const sorted = [...needs].sort((a, b) => b.proteinGapLbs - a.proteinGapLbs);
  let remaining = availableCans;
  return sorted
    .filter(() => remaining > 0)
    .map((agency) => {
      const cansNeeded = Math.ceil((agency.proteinGapLbs * 1.8));
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
