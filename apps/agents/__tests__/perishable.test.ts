// perishable.test.ts — unit tests for draftPerishableRescue()
// Run: pnpm --filter agents test

import { describe, it, expect } from 'vitest';
import { draftPerishableRescue, DEFAULT_HOURS_THRESHOLD } from '../perishable.js';
import type { SurplusLot, AgencyNeed } from '@tidelift/shared';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const NOW = new Date('2026-07-16T20:00:00Z');

function makeLot(overrides: Partial<SurplusLot> & { id: string }): SurplusLot {
  return {
    supplierId: 'sup-001',
    species: 'salmon',
    lbs: 1000,
    harvestDate: '2026-07-14',
    expiryDate: '2026-07-18T20:00:00Z', // 48 h from NOW
    pricePerLb: 1.44,
    marketPricePerLb: 1.80,
    proposedDiscountPct: 20,
    landingLocation: 'Monterey, CA',
    status: 'AVAILABLE',
    ...overrides,
  };
}

function makeNeed(overrides: Partial<AgencyNeed> & { agencyId: string }): AgencyNeed {
  return {
    neighborhood: 'East Oakland',
    proteinGapLbs: 800,
    accessWindows: ['Mon 9-12', 'Wed 9-12'],
    dietaryPrefs: [],
    perishableCapacity: 500,
    ...overrides,
  };
}

const coldNeedA = makeNeed({ agencyId: 'agency-a', perishableCapacity: 600 });
const coldNeedB = makeNeed({ agencyId: 'agency-b', perishableCapacity: 400, neighborhood: 'Fruitvale', proteinGapLbs: 1200 });
const noColdNeed = makeNeed({ agencyId: 'agency-c', perishableCapacity: 0 });

const urgentLot = makeLot({ id: 'lot-urgent', lbs: 500 }); // 48 h — within 72 h threshold
const farLot = makeLot({ id: 'lot-far', lbs: 800, expiryDate: '2026-07-24T20:00:00Z' }); // 192 h — outside threshold
const notAvailableLot = makeLot({ id: 'lot-na', status: 'SCORED' }); // wrong status
const expiredLot = makeLot({ id: 'lot-exp', expiryDate: '2026-07-15T20:00:00Z' }); // already expired

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('draftPerishableRescue()', () => {
  it('returns empty urgentLots when no lots fall within the threshold', () => {
    const draft = draftPerishableRescue([farLot], [coldNeedA], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(draft.urgentLots).toHaveLength(0);
    expect(draft.coldTransportAssignments).toHaveLength(0);
    expect(draft.unroutableLbs).toBe(0);
  });

  it('includes only AVAILABLE lots — ignores SCORED, IN_PRODUCTION, etc.', () => {
    const draft = draftPerishableRescue(
      [urgentLot, notAvailableLot],
      [coldNeedA],
      3,
      DEFAULT_HOURS_THRESHOLD,
      NOW
    );
    expect(draft.urgentLots).toHaveLength(1);
    expect(draft.urgentLots[0].lotId).toBe('lot-urgent');
  });

  it('excludes lots that have already expired', () => {
    const draft = draftPerishableRescue([expiredLot, urgentLot], [coldNeedA], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(draft.urgentLots.every((l) => l.hoursRemaining > 0)).toBe(true);
  });

  it('sorts urgentLots by hoursRemaining ascending (most urgent first)', () => {
    const veryUrgent = makeLot({ id: 'lot-v', expiryDate: '2026-07-17T08:00:00Z', lbs: 300 }); // ~12 h
    const lessUrgent = makeLot({ id: 'lot-l', expiryDate: '2026-07-18T20:00:00Z', lbs: 400 }); // ~48 h
    const draft = draftPerishableRescue([lessUrgent, veryUrgent], [coldNeedA], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(draft.urgentLots[0].lotId).toBe('lot-v');
    expect(draft.urgentLots[1].lotId).toBe('lot-l');
  });

  it('only routes to agencies with perishableCapacity > 0', () => {
    const draft = draftPerishableRescue([urgentLot], [noColdNeed], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(draft.coldTransportAssignments).toHaveLength(0);
    expect(draft.unroutableLbs).toBe(urgentLot.lbs);
  });

  it('deliveryRows come from planEquityDelivery (agency IDs present + urgencyScore set)', () => {
    const draft = draftPerishableRescue([urgentLot], [coldNeedA, coldNeedB], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(draft.deliveryRows.length).toBeGreaterThan(0);
    draft.deliveryRows.forEach((row) => {
      expect(row.urgencyScore).toBeGreaterThanOrEqual(0);
      expect(row.urgencyScore).toBeLessThanOrEqual(1);
      expect(row.reason).toBeTruthy();
    });
  });

  it('caps cold-transport assignments at availableColdTransportUnits', () => {
    const lots = [
      makeLot({ id: 'lot-1', lbs: 200, expiryDate: '2026-07-17T08:00:00Z' }),
      makeLot({ id: 'lot-2', lbs: 200, expiryDate: '2026-07-17T10:00:00Z' }),
      makeLot({ id: 'lot-3', lbs: 200, expiryDate: '2026-07-17T12:00:00Z' }),
    ];
    // Only 1 transport unit available
    const draft = draftPerishableRescue(lots, [coldNeedA, coldNeedB], 1, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(draft.coldTransportAssignments.length).toBeLessThanOrEqual(1);
  });

  it('calculates unroutableLbs correctly when agencies are at capacity', () => {
    // Agency can only handle 100 lbs but lot is 500 lbs
    const tinyCapNeed = makeNeed({ agencyId: 'agency-tiny', perishableCapacity: 100 });
    const bigLot = makeLot({ id: 'lot-big', lbs: 500 });
    const draft = draftPerishableRescue([bigLot], [tinyCapNeed], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    // lot-big won't be assigned because capacity (100) < lot lbs (500)
    expect(draft.unroutableLbs).toBe(500);
  });

  it('reason string is always present and non-empty on the returned draft', () => {
    // No lots
    const empty = draftPerishableRescue([], [], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(empty.reason).toBeTruthy();
    // With lots and agencies
    const active = draftPerishableRescue([urgentLot], [coldNeedA], 3, DEFAULT_HOURS_THRESHOLD, NOW);
    expect(active.reason).toBeTruthy();
    expect(active.reason).toContain('Agent recommends. You decide.');
  });
});
