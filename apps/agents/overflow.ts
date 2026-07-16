// overflow.ts — Overflow Disposition Agent
//
// When a lot has no canning facility match OR canning capacity is exceeded,
// this agent ranks up to 3 overflow destinations and returns a draft for
// operator review.
//
// Destination priority order:
//   1. MINI_PROCESSOR  — community kitchen / direct-fresh processing (no canning needed)
//   2. FOOD_BANK_DIRECT — direct fresh delivery to an accepting food bank
//   3. RETAIL          — supermarket channel (only if surplusPrice >= market * 0.85)
//
// Pricing rule: if price drops substantially below market → nonprofits first;
// if at/near market → retail eligible.
//   retailEligible = surplusPrice >= lot.marketPricePerLb * 0.85
//
// Every output is a DRAFT. Nothing executes automatically.
// "Agent recommends. You decide." (human-in-the-loop product rule.)

import type {
  SurplusLot,
  FoodBank,
  OverflowDispositionDraft,
  OverflowDestination,
} from '@tidelift/shared';
import type { FacilityMatch } from './canning';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** lbs that overflowed past canning capacity (or all lbs if no match at all). */
function computeOverflowLbs(
  lot: SurplusLot,
  canningMatches: FacilityMatch[]
): number {
  if (canningMatches.length === 0) return lot.lbs;
  // Sum capacity across all matched slots that could absorb this lot.
  // Use the top match's slot capacity as the ceiling for the demo scenario.
  const topCapacity = canningMatches[0]?.facility.availableSlots[0]?.capacityLbs ?? 0;
  return Math.max(0, lot.lbs - topCapacity);
}

/** Returns food banks that are currently accepting fresh deliveries. */
function acceptingFoodBanks(foodBanks: FoodBank[]): FoodBank[] {
  return foodBanks.filter((fb) => fb.currentlyAccepting !== false);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Drafts an overflow disposition for a lot that couldn't be fully absorbed by
 * a canning facility. Ranks up to 3 destinations and returns a
 * OverflowDispositionDraft — always a draft, never executed automatically.
 *
 * @param lot            The surplus lot with overflow.
 * @param canningMatches Facility matches already computed by matchFacilities().
 *                       Pass [] if there are no matches at all.
 * @param foodBanks      Full food bank list from mockData (filtered internally).
 * @param surplusPrice   The negotiated or proposed price per lb (lot.pricePerLb).
 */
export function draftOverflowDisposition(
  lot: SurplusLot,
  canningMatches: FacilityMatch[],
  foodBanks: FoodBank[],
  surplusPrice: number
): OverflowDispositionDraft {
  const overflowLbs = computeOverflowLbs(lot, canningMatches);
  const retailEligible = surplusPrice >= lot.marketPricePerLb * 0.85;

  const destinations: OverflowDestination[] = [];

  if (overflowLbs <= 0) {
    // All lbs absorbed by canning — no overflow destinations needed.
    return {
      lotId: lot.id,
      overflowLbs: 0,
      destinations: [],
      retailEligible,
      reason:
        `All ${lot.lbs.toLocaleString()} lbs of ${lot.id} absorbed by canning facility. ` +
        `No overflow disposition required. Agent recommends. You decide.`,
    };
  }

  // ── Rank 1: MINI_PROCESSOR (community kitchen / direct fresh) ──────────────
  // Always the first preference — no canning needed, fastest path for
  // perishables, community kitchens absorb variable volumes.
  const miniProcessorId = `mini-proc-${lot.landingLocation.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}` ;
  destinations.push({
    rank: 1,
    type: 'MINI_PROCESSOR',
    destinationId: miniProcessorId,
    destinationLabel: `Community Kitchen / Mini-Processor near ${lot.landingLocation}`,
    lbs: overflowLbs,
    reason:
      `${overflowLbs.toLocaleString()} lbs ${lot.species} routed to community kitchen near ` +
      `${lot.landingLocation}. No canning required — direct fresh processing. ` +
      `Shortest path for a perishable lot expiring ${lot.expiryDate}. ` +
      `Agent recommends. You decide.`,
  });

  // ── Rank 2: FOOD_BANK_DIRECT ────────────────────────────────────────────────
  // Deliver fresh to the highest-demand accepting food bank.
  const accepting = acceptingFoodBanks(foodBanks);
  const targetFoodBank = accepting
    .filter((fb) => !fb.dietaryPrefs.includes('no-shellfish') || lot.species !== 'crab')
    .sort((a, b) => b.monthlyDemandCases - a.monthlyDemandCases)[0];

  if (targetFoodBank) {
    destinations.push({
      rank: 2,
      type: 'FOOD_BANK_DIRECT',
      destinationId: targetFoodBank.id,
      destinationLabel: `${targetFoodBank.name} (${targetFoodBank.location})`,
      lbs: overflowLbs,
      reason:
        `Direct fresh delivery of ${overflowLbs.toLocaleString()} lbs to ` +
        `${targetFoodBank.name} — highest-demand accepting food bank ` +
        `(${targetFoodBank.monthlyDemandCases.toLocaleString()} cases/mo). ` +
        `Deliver within access window: ${targetFoodBank.accessWindows[0] ?? 'TBD'}. ` +
        `Agent recommends. You decide.`,
    });
  }

  // ── Rank 3: RETAIL ──────────────────────────────────────────────────────────
  // Only eligible if surplusPrice is at/near market (>= 85% of market).
  // Nonprofits take priority when the price drops substantially below market.
  if (retailEligible) {
    destinations.push({
      rank: 3,
      type: 'RETAIL',
      destinationId: `retail-${lot.landingLocation.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`,
      destinationLabel: `Retail / Supermarket Channel near ${lot.landingLocation}`,
      lbs: overflowLbs,
      reason:
        `Retail channel eligible: surplus price $${surplusPrice.toFixed(2)}/lb is ≥ 85% of ` +
        `market ($${lot.marketPricePerLb.toFixed(2)}/lb). ` +
        `${overflowLbs.toLocaleString()} lbs ${lot.species} can move via supermarket/retail ` +
        `near ${lot.landingLocation}. ` +
        `Agent recommends. You decide.`,
    });
  }

  // ── Overall draft reason ────────────────────────────────────────────────────
  const noCanningNote =
    canningMatches.length === 0
      ? `No compatible canning facility found for ${lot.species}.`
      : `Canning capacity exceeded — ${overflowLbs.toLocaleString()} lbs beyond top facility slot.`;

  const reason =
    `${noCanningNote} ` +
    `${overflowLbs.toLocaleString()} lbs of ${lot.id} (${lot.species}, expires ${lot.expiryDate}) ` +
    `ranked across ${destinations.length} overflow destination${destinations.length !== 1 ? 's' : ''}. ` +
    `Retail ${retailEligible ? 'eligible' : 'ineligible'} ` +
    `(price $${surplusPrice.toFixed(2)}/lb vs market $${lot.marketPricePerLb.toFixed(2)}/lb, ` +
    `85% floor $${(lot.marketPricePerLb * 0.85).toFixed(2)}/lb). ` +
    `Agent recommends. You decide.`;

  return {
    lotId: lot.id,
    overflowLbs,
    destinations,
    retailEligible,
    reason,
  };
}
