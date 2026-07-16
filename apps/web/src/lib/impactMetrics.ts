// impactMetrics.ts — Impact calculation
// Baseline: 1 can = 400g net weight = 1 meal

import type { SurplusLot } from '../../../../packages/shared/src/types';

export type ImpactMetrics = {
  lbsRescued: number;
  cansProduced: number;
  mealsEstimated: number;
  costAvoided: number;      // vs. buying at full market rate
  retailValueAvoided: number; // vs. retail can price (~$1.80/can)
};

const YIELD = 0.88;           // 88% usable after trim
const LBS_PER_CAN = 0.55;     // ~14.75oz net
const RETAIL_PER_CAN = 1.80;  // average retail price for canned fish

export function calcImpact(lots: SurplusLot[]): ImpactMetrics {
  const processed = lots.filter(l =>
    ['PROCUREMENT_CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(l.status)
  );

  const lbsRescued = processed.reduce((s, l) => s + l.lbs, 0);
  const cansProduced = Math.floor((lbsRescued * YIELD) / LBS_PER_CAN);
  const mealsEstimated = cansProduced;

  const costAvoided = processed.reduce((s, l) =>
    s + (l.marketPricePerLb - l.pricePerLb) * l.lbs, 0
  );

  const retailValueAvoided = Math.round(cansProduced * RETAIL_PER_CAN * 100) / 100;

  return {
    lbsRescued,
    cansProduced,
    mealsEstimated,
    costAvoided: Math.round(costAvoided * 100) / 100,
    retailValueAvoided,
  };
}
