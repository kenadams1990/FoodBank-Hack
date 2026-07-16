// procure.ts — Procurement Negotiation Recommender
// Produces a DraftProcurementAction. NEVER auto-submits — requires human approval.

import type { SurplusLot, Quote, DraftProcurementAction } from '../../packages/shared/src/types';

/** Legacy RFQ type kept for backward compatibility */
export type RFQDraft = {
  surplusId: string;
  fisheryId: string;
  proposedPricePerLb: number;
  offerExpiresHrs: number;
  negotiationNotes: string;
};

/**
 * Generates a counter-offer draft for a surplus lot.
 * The draft must be approved before any communication is sent.
 */
export function draftProcurement(
  lot: SurplusLot,
  existingQuotes: Quote[]
): DraftProcurementAction {
  const lotQuotes = existingQuotes.filter((q) => q.lotId === lot.id);
  const lowestQuote = lotQuotes.sort((a, b) => a.pricePerLb - b.pricePerLb)[0];

  // Target: 5% below lowest existing quote, or 70% of market if no quotes yet
  const basePrice = lowestQuote
    ? lowestQuote.pricePerLb * 0.95
    : lot.marketPricePerLb * 0.70;
  const counterOfferPricePerLb = Math.round(basePrice * 100) / 100;

  // Suggest MOQ at 60% of lot to give supplier flexibility
  const suggestedMoqLbs = Math.round(lot.lbs * 0.6);

  const savingsPct = Math.round((1 - counterOfferPricePerLb / lot.marketPricePerLb) * 100);

  const justification =
    `Bulk non-profit purchase for TideLift food bank supply program. ` +
    `${lot.lbs.toLocaleString()} lbs ${lot.species} at $${counterOfferPricePerLb}/lb ` +
    `represents ${savingsPct}% off market ($${lot.marketPricePerLb}/lb). ` +
    `Tax-exempt 501(c)(3) status available. ` +
    `Lot expires ${lot.expiryDate} — swift commitment benefits both parties.`;

  return {
    lotId: lot.id,
    supplierId: lot.supplierId,
    counterOfferPricePerLb,
    suggestedMoqLbs,
    justification,
    offerValidHrs: 24,
  };
}

/** Legacy compatibility: generates RFQ from a SurplusAlert */
export function generateRFQ(alert: { fisheryId: string; species: string; lbs: number; marketPricePerLb: number; proposedDiscountPct: number }): RFQDraft {
  const proposedPricePerLb = alert.marketPricePerLb * (1 - alert.proposedDiscountPct / 100);
  return {
    surplusId: `${alert.fisheryId}-${Date.now()}`,
    fisheryId: alert.fisheryId,
    proposedPricePerLb: Math.round(proposedPricePerLb * 100) / 100,
    offerExpiresHrs: 24,
    negotiationNotes:
      `Bulk buy for non-profit canning program. ` +
      `${alert.lbs.toLocaleString()} lbs ${alert.species}. ` +
      `Requesting ${alert.proposedDiscountPct}% discount off market ($${alert.marketPricePerLb}/lb). ` +
      `Buyer is a food bank supply program — tax-exempt status available.`,
  };
}
