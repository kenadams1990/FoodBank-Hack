// overflow.test.ts — 8 unit tests for draftOverflowDisposition
//
// Covers:
//  1. No canning match → all lbs overflow
//  2. Canning capacity exceeded → partial overflow
//  3. Full capacity absorbed → empty destinations, zero overflowLbs
//  4. Retail eligible when price >= 85% of market
//  5. Retail NOT eligible when price < 85% of market
//  6. Only accepting food banks included in FOOD_BANK_DIRECT destination
//  7. MINI_PROCESSOR always rank 1
//  8. reason string always present on draft and all destinations

import { describe, it, expect } from 'vitest';
import { draftOverflowDisposition } from '../overflow';
import type { SurplusLot, FoodBank } from '@tidelift/shared';
import type { FacilityMatch } from '../canning';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const baseLot: SurplusLot = {
  id: 'lot-test-01',
  supplierId: 'sup-001',
  species: 'salmon',
  lbs: 2000,
  harvestDate: '2026-07-14',
  expiryDate: '2026-07-19',
  pricePerLb: 1.60,
  marketPricePerLb: 2.00,
  proposedDiscountPct: 20,
  landingLocation: 'Bodega Bay, CA',
  status: 'AVAILABLE',
};

const acceptingFB: FoodBank = {
  id: 'fb-001',
  name: 'Alameda County Community Food Bank',
  location: 'Oakland, CA',
  region: 'Bay Area',
  monthlyDemandCases: 1200,
  contact: 'Darius Williams',
  email: 'darius@accfb.org',
  dietaryPrefs: ['halal', 'low-sodium'],
  accessWindows: ['Mon 8-11', 'Wed 8-11', 'Fri 8-11'],
  currentlyAccepting: true,
  maxInboundLbsPerWeek: 15000,
};

const notAcceptingFB: FoodBank = {
  ...acceptingFB,
  id: 'fb-closed',
  name: 'Closed Food Bank',
  currentlyAccepting: false,
};

/** Builds a minimal FacilityMatch stub with a given slot capacity. */
function makeMatch(capacityLbs: number): FacilityMatch {
  return {
    facility: {
      id: 'fac-001',
      name: 'Bay Area Cannery Co-Pack',
      location: 'Richmond, CA',
      capacityCasesPerDay: 600,
      compatibleSpecies: ['salmon'],
      certifications: ['HACCP'],
      costPerCan: 0.38,
      availableSlots: [{ date: '2026-07-18', capacityLbs }],
    },
    matchScore: 80,
    recommendedSlotDate: '2026-07-18',
    estimatedCans: Math.floor(capacityLbs * 0.9 / 0.4),
    rationale: 'stub match',
  } as FacilityMatch;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('draftOverflowDisposition', () => {
  it('1. no canning match → all lbs overflow', () => {
    const draft = draftOverflowDisposition(baseLot, [], [acceptingFB], 1.60);
    expect(draft.overflowLbs).toBe(baseLot.lbs);
    expect(draft.destinations.length).toBeGreaterThan(0);
  });

  it('2. canning capacity exceeded → partial overflow', () => {
    const match = makeMatch(1200); // only 1200 of 2000 lbs absorbed
    const draft = draftOverflowDisposition(baseLot, [match], [acceptingFB], 1.60);
    expect(draft.overflowLbs).toBe(800);
  });

  it('3. full capacity absorbed → zero overflow, empty destinations', () => {
    const match = makeMatch(3000); // more than enough
    const draft = draftOverflowDisposition(baseLot, [match], [acceptingFB], 1.60);
    expect(draft.overflowLbs).toBe(0);
    expect(draft.destinations).toHaveLength(0);
  });

  it('4. retail eligible when price >= 85% of market', () => {
    // 1.70 / 2.00 = 0.85 → exactly at threshold
    const draft = draftOverflowDisposition(baseLot, [], [acceptingFB], 1.70);
    expect(draft.retailEligible).toBe(true);
    const retailDest = draft.destinations.find((d) => d.type === 'RETAIL');
    expect(retailDest).toBeDefined();
  });

  it('5. retail NOT eligible when price < 85% of market', () => {
    // 1.60 / 2.00 = 0.80 < 0.85
    const draft = draftOverflowDisposition(baseLot, [], [acceptingFB], 1.60);
    expect(draft.retailEligible).toBe(false);
    const retailDest = draft.destinations.find((d) => d.type === 'RETAIL');
    expect(retailDest).toBeUndefined();
  });

  it('6. only accepting food banks appear in FOOD_BANK_DIRECT destination', () => {
    const draft = draftOverflowDisposition(
      baseLot,
      [],
      [notAcceptingFB, acceptingFB],
      1.60
    );
    const fbDest = draft.destinations.find((d) => d.type === 'FOOD_BANK_DIRECT');
    expect(fbDest).toBeDefined();
    // Should point to the accepting bank, not the closed one
    expect(fbDest!.destinationId).toBe(acceptingFB.id);
  });

  it('7. when all food banks are not accepting, FOOD_BANK_DIRECT is absent', () => {
    const draft = draftOverflowDisposition(baseLot, [], [notAcceptingFB], 1.60);
    const fbDest = draft.destinations.find((d) => d.type === 'FOOD_BANK_DIRECT');
    expect(fbDest).toBeUndefined();
  });

  it('8. MINI_PROCESSOR is always rank 1 when there is overflow', () => {
    const draft = draftOverflowDisposition(baseLot, [], [acceptingFB], 1.60);
    const miniProc = draft.destinations.find((d) => d.type === 'MINI_PROCESSOR');
    expect(miniProc).toBeDefined();
    expect(miniProc!.rank).toBe(1);
    // rank 1 should come first in the array
    expect(draft.destinations[0].type).toBe('MINI_PROCESSOR');
  });

  it('9 (bonus). reason string always present on draft and all destinations', () => {
    const draft = draftOverflowDisposition(baseLot, [], [acceptingFB], 1.60);
    expect(typeof draft.reason).toBe('string');
    expect(draft.reason.length).toBeGreaterThan(0);
    for (const dest of draft.destinations) {
      expect(typeof dest.reason).toBe('string');
      expect(dest.reason.length).toBeGreaterThan(0);
    }
  });
});
