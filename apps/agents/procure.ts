// procure.ts — Procurement Negotiation Agent
// Produces DraftProcurementAction — NEVER auto-committed. Human approves.

import type { SurplusLot, Quote } from '../../packages/shared/src/types';
import { generateText, type AIBinding, type Narration } from './ai';

export type DraftProcurementAction = {
  lotId: string;
  supplierId: string;
  recommendedPricePerLb: number;
  recommendedMoqLbs: number;
  offerExpiresHrs: number;
  negotiationScript: string;
  estimatedTotalCost: number;
  estimatedSavingsVsMarket: number;
};

/** Drafts a counter-offer for operator review. Agent recommends. Human sends. */
export function draftProcurement(
  lot: SurplusLot,
  quotes: Quote[]
): DraftProcurementAction {
  const openQuotes = quotes
    .filter(q => q.lotId === lot.id && q.status === 'OPEN')
    .sort((a, b) => a.pricePerLb - b.pricePerLb);

  const bestQuote = openQuotes[0];
  // Target 5% below best quote, floor at 60% of market
  const targetPrice = bestQuote
    ? Math.max(
        Math.round(bestQuote.pricePerLb * 0.95 * 100) / 100,
        Math.round(lot.marketPricePerLb * 0.60 * 100) / 100
      )
    : Math.round(lot.marketPricePerLb * (1 - lot.proposedDiscountPct / 100) * 100) / 100;

  const moq = bestQuote ? bestQuote.moqLbs : lot.lbs;
  const estimatedTotalCost = Math.round(targetPrice * lot.lbs * 100) / 100;
  const estimatedSavingsVsMarket = Math.round((lot.marketPricePerLb - targetPrice) * lot.lbs * 100) / 100;

  const negotiationScript = [
    `Subject: TideLift Bulk Purchase Inquiry — ${lot.lbs.toLocaleString()} lbs ${lot.species}`,
    ``,
    `Dear ${lot.supplierId} team,`,
    ``,
    `We are reaching out on behalf of TideLift, a non-profit seafood rescue program`,
    `that converts surplus catch into shelf-stable canned protein for regional food banks.`,
    ``,
    `We are interested in purchasing ${lot.lbs.toLocaleString()} lbs of ${lot.species}`,
    `(Lot ${lot.id}, harvested ${lot.harvestDate}) at $${targetPrice}/lb.`,
    ``,
    `Basis for pricing: bulk non-profit purchase, tax-exempt status available,`,
    `immediate pickup within 48 hrs, no cold-storage cost to you.`,
    ``,
    `This offer is valid for 24 hours. Minimum order: ${moq.toLocaleString()} lbs.`,
    ``,
    `Please confirm availability and acceptance via reply.`,
    ``,
    `— TideLift Procurement (draft pending operator approval)`,
  ].join('\n');

  return {
    lotId: lot.id,
    supplierId: lot.supplierId,
    recommendedPricePerLb: targetPrice,
    recommendedMoqLbs: moq,
    offerExpiresHrs: 24,
    negotiationScript,
    estimatedTotalCost,
    estimatedSavingsVsMarket,
  };
}

/**
 * Generates a real LLM-written negotiation email for an already-computed
 * procurement draft. Pricing/MOQ math above is untouched — this only
 * replaces the email copy. Falls back to the deterministic
 * `negotiationScript` already on the draft if no AI binding is available
 * or the call fails.
 */
export async function narrateNegotiation(
  lot: SurplusLot,
  draft: DraftProcurementAction,
  ai: AIBinding | undefined
): Promise<Narration> {
  return generateText(
    ai,
    `You are TideLift AI's procurement negotiation agent for a non-profit seafood rescue program that buys surplus catch for food banks. Write a short, professional outreach email to a supplier proposing a bulk purchase at an already-computed price. Use the exact numbers given — do not invent figures. Keep it under 150 words. This is a DRAFT pending human operator approval — do not claim the deal is final.`,
    `Supplier: ${draft.supplierId}\nLot: ${lot.id}, ${lot.species}, ${lot.lbs.toLocaleString()} lbs, harvested ${lot.harvestDate}.\nOffer price: $${draft.recommendedPricePerLb}/lb, minimum order ${draft.recommendedMoqLbs.toLocaleString()} lbs, valid ${draft.offerExpiresHrs} hrs.\nWrite the email now.`,
    draft.negotiationScript,
    { max_tokens: 600, temperature: 0.4 }
  );
}
