// scorer.ts — Deterministic Opportunity Scorer
// Returns a 0–100 score for each surplus lot. Agent recommends. You decide.

import type { SurplusLot, CanningFacility, FoodBank } from '../../packages/shared/src/types';
import { generateText, type AIBinding, type Narration } from './ai';

export type ScoreBreakdown = {
  priceSavings: number;   // 0–30: discount vs. market
  urgency: number;        // 0–25: days until expiry
  lotSize: number;        // 0–25: lbs vs. minimum viable run
  demandMatch: number;    // 0–20: food bank demand coverage
  total: number;          // 0–100
  rationale: string;
};

export function scoreLot(
  lot: SurplusLot,
  facilities: CanningFacility[],
  foodBanks: FoodBank[],
  today = new Date()
): ScoreBreakdown {
  // 1. Price savings (0–30)
  const discountRatio = lot.proposedDiscountPct / 100;
  const priceSavings = Math.round(Math.min(discountRatio / 0.40, 1) * 30);

  // 2. Urgency — higher score the closer to expiry (0–25)
  const msPerDay = 86_400_000;
  const daysLeft = Math.max(0, (new Date(lot.expiryDate).getTime() - today.getTime()) / msPerDay);
  const urgency = daysLeft <= 1 ? 25
    : daysLeft <= 2 ? 22
    : daysLeft <= 3 ? 18
    : daysLeft <= 5 ? 12
    : daysLeft <= 7 ? 6
    : 2;

  // 3. Lot size vs. minimum viable canning run (0–25)
  const MIN_VIABLE_LBS = 1000;
  const IDEAL_LBS = 5000;
  const lotSize = lot.lbs < MIN_VIABLE_LBS ? 0
    : Math.round(Math.min(lot.lbs / IDEAL_LBS, 1) * 25);

  // 4. Demand match — is there a food bank that wants this species? (0–20)
  const compatibleFacility = facilities.find(f =>
    f.compatibleSpecies.includes(lot.species) &&
    f.availableSlots.length > 0
  );
  const estimatedCans = Math.floor(lot.lbs * 1.8);
  const estimatedCases = Math.floor(estimatedCans / 24);
  const totalDemand = foodBanks.reduce((s, fb) => s + fb.monthlyDemandCases, 0);
  const demandMatch = !compatibleFacility ? 0
    : Math.round(Math.min(estimatedCases / totalDemand, 1) * 20);

  const total = priceSavings + urgency + lotSize + demandMatch;

  const rationale = [
    `${lot.proposedDiscountPct}% discount (${priceSavings}/30 pts).`,
    `${daysLeft.toFixed(1)} days to expiry (${urgency}/25 pts).`,
    `${lot.lbs.toLocaleString()} lbs lot size (${lotSize}/25 pts).`,
    compatibleFacility
      ? `Facility match: ${compatibleFacility.name} (${demandMatch}/20 pts).`
      : `No compatible facility slot available (0/20 pts).`,
  ].join(' ');

  return { priceSavings, urgency, lotSize, demandMatch, total, rationale };
}

/**
 * Generates a real LLM narrative explaining an already-computed score
 * breakdown. The scoring math above is untouched — this only replaces the
 * human-readable explanation. Falls back to the deterministic `rationale`
 * already on the breakdown if no AI binding is available or the call fails.
 */
export async function narrateScore(
  lot: SurplusLot,
  breakdown: ScoreBreakdown,
  ai: AIBinding | undefined
): Promise<Narration> {
  return generateText(
    ai,
    `You are TideLift AI's opportunity-scoring agent for a food bank seafood rescue program. Explain in 1-2 sentences why this surplus lot received its score. Reference the specific point breakdown given. Be concise and confident. Do not invent numbers not present in the input.`,
    `Species: ${lot.species}, ${lot.lbs.toLocaleString()} lbs, ${lot.proposedDiscountPct}% discount.\nScore breakdown: price savings ${breakdown.priceSavings}/30, urgency ${breakdown.urgency}/25, lot size ${breakdown.lotSize}/25, demand match ${breakdown.demandMatch}/20.\nTotal: ${breakdown.total}/100.`,
    breakdown.rationale,
    { max_tokens: 150, temperature: 0.4 }
  );
}
