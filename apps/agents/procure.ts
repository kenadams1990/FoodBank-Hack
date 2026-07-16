// procure.ts — Procurement Negotiation Agent
// Produces DraftProcurementAction — NEVER auto-committed. Human approves.

import type { SurplusLot, Quote } from '../../packages/shared/src/types';

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
