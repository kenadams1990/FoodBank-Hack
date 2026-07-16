// scorer.ts — Deterministic Opportunity Scorer (0–100)
// Agent recommends. You decide.

import type { SurplusLot, ScoreBreakdown, CanningFacility, FoodBank } from '../../packages/shared/src/types';

const MARKET_REFERENCE: Record<string, number> = {
  'Albacore Tuna': 1.80,
  'Pacific Salmon': 2.40,
  'Pacific Halibut': 4.00,
  'Pacific Sardine': 0.65,
  'Dungeness Crab': 3.20,
};

/** Score 0–25: how much below market the proposed price is */
function scorePricing(lot: SurplusLot): number {
  const ref = MARKET_REFERENCE[lot.species] ?? lot.marketPricePerLb;
  const effectivePrice = ref * (1 - lot.proposedDiscountPct / 100);
  const savingsPct = (ref - effectivePrice) / ref;
  // savingsPct 0% → 0pts, 40%+ → 25pts
  return Math.min(25, Math.round((savingsPct / 0.4) * 25));
}

/** Score 0–25: urgency — less time = higher score (perishability window) */
function scoreExpiry(lot: SurplusLot): number {
  const today = new Date();
  const expiry = new Date(lot.expiryDate);
  const daysLeft = Math.max(0, Math.floor((expiry.getTime() - today.getTime()) / 86400000));
  // 1 day → 25pts, 7 days → ~18pts, 14+ days → 0pts
  if (daysLeft <= 0) return 0;
  if (daysLeft >= 14) return 0;
  return Math.round(25 * (1 - daysLeft / 14));
}

/** Score 0–25: lot volume vs. best facility capacity utilization */
function scoreVolume(lot: SurplusLot, facilities: CanningFacility[]): number {
  const compatible = facilities.filter(f =>
    f.compatibleSpecies.includes(lot.species as any) &&
    f.availableSlots.some(s => !s.reserved && s.capacityLbs >= lot.minOrderLbs)
  );
  if (compatible.length === 0) return 0;
  const bestCapacity = Math.max(...compatible.map(f => f.capacityLbsPerDay));
  const utilization = Math.min(1, lot.weightLbs / bestCapacity);
  // Good utilization (50–100% of capacity) scores highest
  return utilization >= 0.5 ? 25 : Math.round(utilization * 2 * 25);
}

/** Score 0–25: how well the lot species matches food bank demand */
function scoreDemand(lot: SurplusLot, foodBanks: FoodBank[]): number {
  const eligible = foodBanks.filter(fb => {
    if (lot.species === 'Dungeness Crab' && fb.dietaryRestrictions.includes('no-shellfish')) return false;
    return true;
  });
  if (eligible.length === 0) return 0;
  const totalDemandCases = eligible.reduce((s, fb) => s + fb.monthlyDemandCases, 0);
  const estimatedCasesFromLot = Math.floor((lot.weightLbs * 1.8) / 24);
  const satisfactionRatio = Math.min(1, estimatedCasesFromLot / totalDemandCases);
  return Math.round(satisfactionRatio * 25);
}

export type ScoredLot = SurplusLot & {
  score: number;
  scoreBreakdown: ScoreBreakdown;
};

export function scoreLot(
  lot: SurplusLot,
  facilities: CanningFacility[],
  foodBanks: FoodBank[]
): ScoredLot {
  const priceScore = scorePricing(lot);
  const expiryScore = scoreExpiry(lot);
  const volumeScore = scoreVolume(lot, facilities);
  const demandScore = scoreDemand(lot, foodBanks);
  const total = priceScore + expiryScore + volumeScore + demandScore;
  return {
    ...lot,
    score: total,
    scoreBreakdown: { priceScore, expiryScore, volumeScore, demandScore, total },
  };
}

export function rankLots(
  lots: SurplusLot[],
  facilities: CanningFacility[],
  foodBanks: FoodBank[]
): ScoredLot[] {
  return lots
    .filter(l => l.status === 'AVAILABLE' || l.status === 'SCORING')
    .map(l => scoreLot(l, facilities, foodBanks))
    .sort((a, b) => b.score - a.score);
}
