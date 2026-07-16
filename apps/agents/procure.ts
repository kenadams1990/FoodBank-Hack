// procure.ts — Procurement & Negotiation Agent
// Generates RFQ drafts, scores vendors, proposes discount negotiation.

import type { SurplusAlert, CanningJob } from '@tidelift/shared';

export type RFQDraft = {
  surplusId: string;
  fisheryId: string;
  proposedPricePerLb: number;
  offerExpiresHrs: number;
  negotiationNotes: string;
};

/** Generates a negotiation RFQ draft. Agent recommends — human sends. */
export function generateRFQ(alert: SurplusAlert): RFQDraft {
  const proposedPricePerLb =
    alert.marketPricePerLb * (1 - alert.proposedDiscountPct / 100);
  return {
    surplusId: `${alert.fisheryId}-${Date.now()}`,
    fisheryId: alert.fisheryId,
    proposedPricePerLb: Math.round(proposedPricePerLb * 100) / 100,
    offerExpiresHrs: 24,
    negotiationNotes: `Bulk buy for non-profit canning program. ` +
      `${alert.lbs.toLocaleString()} lbs ${alert.species}. ` +
      `Requesting ${alert.proposedDiscountPct}% discount off market rate ($${alert.marketPricePerLb}/lb). ` +
      `Buyer is a food bank supply program — tax-exempt status available.`,
  };
}
