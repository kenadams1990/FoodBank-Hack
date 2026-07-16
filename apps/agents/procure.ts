// procure.ts — Procurement Negotiation Recommender
// Produces DraftProcurementAction — never auto-commits. Agent recommends. You decide.

import type { SurplusLot, Supplier, Quote, DraftProcurementAction } from '../../packages/shared/src/types';

const NONPROFIT_DISCOUNT_FLOOR = 0.05; // minimum additional % to negotiate beyond supplier offer

export function draftProcurementAction(
  lot: SurplusLot,
  supplier: Supplier,
  existingQuotes: Quote[]
): DraftProcurementAction {
  const openQuotes = existingQuotes
    .filter(q => q.lotId === lot.id && q.status === 'OPEN')
    .sort((a, b) => a.pricePerLb - b.pricePerLb);

  const bestQuote = openQuotes[0];
  const basePrice = bestQuote?.pricePerLb ?? lot.marketPricePerLb * (1 - lot.proposedDiscountPct / 100);

  // Counter: push additional nonprofit floor discount
  const counterPricePerLb = Math.round(basePrice * (1 - NONPROFIT_DISCOUNT_FLOOR) * 100) / 100;
  const suggestedMOQLbs = Math.max(lot.minOrderLbs, Math.round(lot.weightLbs * 0.7));
  const estimatedTotalCost = Math.round(counterPricePerLb * suggestedMOQLbs * 100) / 100;
  const savingsVsMarket = Math.round((lot.marketPricePerLb - counterPricePerLb) * suggestedMOQLbs * 100) / 100;

  return {
    lotId: lot.id,
    supplierId: supplier.id,
    counterPricePerLb,
    suggestedMOQLbs,
    justification:
      `TideLift is a non-profit canning program supplying food banks. ` +
      `Requesting $${counterPricePerLb}/lb for ${suggestedMOQLbs.toLocaleString()} lbs of ${lot.species}. ` +
      `This represents a ${lot.proposedDiscountPct + NONPROFIT_DISCOUNT_FLOOR * 100}% total discount vs. ` +
      `market rate ($${lot.marketPricePerLb}/lb). ` +
      `${supplier.taxExemptEligible ? 'Tax-exempt documentation available upon request.' : ''} ` +
      `Volume is committed for immediate canning and distribution to regional food banks.`,
    savingsVsMarket,
    estimatedTotalCost,
  };
}

// Legacy export — kept for backward compat
export type RFQDraft = {
  surplusId: string;
  fisheryId: string;
  proposedPricePerLb: number;
  offerExpiresHrs: number;
  negotiationNotes: string;
};

export function generateRFQ(alert: { fisheryId: string; marketPricePerLb: number; proposedDiscountPct: number; lbs: number; species: string; landingAt: string }): RFQDraft {
  const proposedPricePerLb = alert.marketPricePerLb * (1 - alert.proposedDiscountPct / 100);
  return {
    surplusId: `${alert.fisheryId}-${Date.now()}`,
    fisheryId: alert.fisheryId,
    proposedPricePerLb: Math.round(proposedPricePerLb * 100) / 100,
    offerExpiresHrs: 24,
    negotiationNotes:
      `Bulk buy for non-profit canning program. ` +
      `${alert.lbs.toLocaleString()} lbs ${alert.species}. ` +
      `Requesting ${alert.proposedDiscountPct}% discount off market rate ($${alert.marketPricePerLb}/lb). ` +
      `Buyer is a food bank supply program — tax-exempt status available.`,
  };
}
