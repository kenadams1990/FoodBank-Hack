// canning.ts — Canning / Co-Pack Agent
// Books co-packer capacity and generates a staging plan.

import type { CanningJob } from '../../packages/shared/src/types';

export type CoPackerSlot = {
  coPackerId: string;
  name: string;
  location: string;
  availableDate: string;
  capacityLbsPerDay: number;
  costPerCan: number;
};

/** Mock co-packer registry — replace with real API / outreach DB */
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

/** Builds a CanningJob from a surplus + co-packer slot */
export function buildCanningJob(
  surplusId: string,
  lbs: number,
  slot: CoPackerSlot
): CanningJob {
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
