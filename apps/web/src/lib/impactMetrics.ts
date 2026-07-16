// impactMetrics.ts — Impact calculator
// Computes food rescued, cans produced, cost avoided, and meals estimated.

import type { SurplusLot } from '../../../../../packages/shared/src/types';

export type ImpactMetrics = {
  lbsRescued: number;
  cansProduced: number;
  costAvoided: number; // USD vs. market price
  mealsEstimated: number; // 1 can = 1 meal baseline
};

// Conversion constants
const LBS_TO_CANS = 1.8;          // ~1 lb fish → 1.8 cans (14.75 oz)
const CANS_PER_CASE = 24;
const MEALS_PER_CAN = 1;

export function calcImpact(lots: SurplusLot[]): ImpactMetrics {
  const activeLots = lots.filter(
    (l) => !['AVAILABLE', 'EXPIRED'].includes(l.status)
  );

  const lbsRescued = activeLots.reduce((s, l) => s + l.lbs, 0);
  const cansProduced = Math.floor(lbsRescued * LBS_TO_CANS);
  const costAvoided = activeLots.reduce(
    (s, l) => s + l.lbs * (l.marketPricePerLb - l.pricePerLb), 0
  );
  const mealsEstimated = cansProduced * MEALS_PER_CAN;

  return {
    lbsRescued: Math.round(lbsRescued),
    cansProduced,
    costAvoided: Math.round(costAvoided * 100) / 100,
    mealsEstimated,
  };
}

export function formatImpact(m: ImpactMetrics): Record<string, string> {
  return {
    'Food Rescued': `${m.lbsRescued.toLocaleString()} lbs`,
    'Cans Produced': `${m.cansProduced.toLocaleString()} cans (${Math.floor(m.cansProduced / CANS_PER_CASE).toLocaleString()} cases)`,
    'Cost Avoided': `$${m.costAvoided.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'Meals Estimated': `${m.mealsEstimated.toLocaleString()} meals`,
  };
}
