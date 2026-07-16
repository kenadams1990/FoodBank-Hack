// forecast.ts — Surplus Forecast Agent
// Consumes fishery landing data and predicts surplus windows + buy signals.

import type { SurplusAlert } from '../../packages/shared/src/types';

/** Mock surplus feed — replace with real fishery API */
export const mockSurplusFeed: SurplusAlert[] = [
  {
    fisheryId: 'monterey-001',
    species: 'Albacore Tuna',
    lbs: 4200,
    landingAt: 'Monterey Bay Fisheries, CA',
    marketPricePerLb: 1.85,
    proposedDiscountPct: 22,
  },
  {
    fisheryId: 'san-diego-003',
    species: 'Pacific Sardine',
    lbs: 8900,
    landingAt: 'San Diego Fish Market, CA',
    marketPricePerLb: 0.65,
    proposedDiscountPct: 30,
  },
];

/**
 * Evaluates a surplus alert and returns a buy recommendation.
 * Agent recommends. Human decides.
 */
export function evaluateSurplus(alert: SurplusAlert): {
  recommend: boolean;
  reason: string;
  estimatedCanYield: number;
} {
  const savingsPerLb = alert.marketPricePerLb * (alert.proposedDiscountPct / 100);
  const recommend = savingsPerLb > 0.2 && alert.lbs >= 1000;
  // ~1 lb fish ≈ 2 cans (14.75 oz each, accounting for water + trim)
  const estimatedCanYield = Math.floor(alert.lbs * 1.8);
  return {
    recommend,
    reason: recommend
      ? `Strong discount (${alert.proposedDiscountPct}%) + volume qualifies for co-pack run.`
      : `Discount or volume too low for canning economics.`,
    estimatedCanYield,
  };
}
