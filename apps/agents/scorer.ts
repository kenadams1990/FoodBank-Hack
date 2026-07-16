// scorer.ts — Deterministic Opportunity Scorer
// Scores each surplus lot 0–100 across four weighted dimensions.
// Agent recommends. You decide.

import type { SurplusLot, FoodBank, CanningFacility, OpportunityScore } from '../../packages/shared/src/types';

const WEIGHTS = { price: 0.35, expiry: 0.30, volume: 0.20, demand: 0.15 };

/** Returns days until expiry from today */
function daysUntilExpiry(expiryDate: string): number {
  return Math.max(0, Math.round((new Date(expiryDate).getTime() - Date.now()) / 86_400_000));
}

/**
 * Scores a surplus lot 0–100.
 * @param lot     The surplus lot to evaluate
 * @param banks   All food banks (used for demand matching)
 * @param facilities  All canning facilities (used for capacity matching)
 */
export function scoreLot(
  lot: SurplusLot,
  banks: FoodBank[],
  facilities: CanningFacility[]
): OpportunityScore {
  // 1. Price score — how deep is the discount off market?
  const discountPct = (lot.marketPricePerLb - lot.pricePerLb) / lot.marketPricePerLb;
  const priceScore = Math.min(100, Math.round(discountPct * 250)); // 40% discount = 100

  // 2. Expiry score — urgency: <2 days = 100, >10 days = 0
  const days = daysUntilExpiry(lot.expiryDate);
  const expiryScore = days <= 0 ? 0 : Math.max(0, Math.round(100 - (days - 1) * 12));

  // 3. Volume score — lot size vs. average facility capacity
  const avgCapLbs = facilities.length
    ? facilities.reduce((s, f) => s + f.capacityCasesPerDay * 24 * 0.3, 0) / facilities.length
    : 5000;
  const volumeScore = Math.min(100, Math.round((lot.lbs / avgCapLbs) * 100));

  // 4. Demand score — food banks that accept this species
  const matchingBanks = banks.filter(
    (b) => !b.dietaryRestrictions.some((r) => r === `no-${lot.species}`)
  );
  const totalDemand = matchingBanks.reduce((s, b) => s + b.monthlyDemandCases, 0);
  const demandScore = Math.min(100, Math.round((totalDemand / 5000) * 100));

  const score = Math.round(
    priceScore * WEIGHTS.price +
    expiryScore * WEIGHTS.expiry +
    volumeScore * WEIGHTS.volume +
    demandScore * WEIGHTS.demand
  );

  const recommendation =
    score >= 75
      ? `Strong opportunity — act within ${days} day(s). Recommend procurement approval.`
      : score >= 50
      ? `Moderate opportunity. Verify facility availability before committing.`
      : `Low score. Volume or economics may not justify a canning run.`;

  return {
    lotId: lot.id,
    score,
    breakdown: { priceScore, expiryScore, volumeScore, demandScore },
    recommendation,
  };
}
