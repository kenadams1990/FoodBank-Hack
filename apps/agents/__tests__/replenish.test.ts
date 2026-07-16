// replenish.test.ts — unit tests for draftReplenishmentList()
// Run: pnpm --filter agents test

import { describe, it, expect } from 'vitest';
import { draftReplenishmentList, DEFAULT_WEEKS_AHEAD, SEASONAL_FACTORS } from '../replenish.js';
import type { FoodBank, FoodBankInventory, DistributionEvent, SurplusLot } from '@tidelift/shared';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date('2026-07-16T20:00:00Z'); // July = month 7

const foodBank: FoodBank = {
  id: 'fb-test',
  name: 'Test Food Bank',
  location: 'Oakland, CA',
  region: 'Bay Area',
  monthlyDemandCases: 800,
  contact: 'Test User',
  email: 'test@fb.org',
  dietaryPrefs: [],
  accessWindows: ['Mon 9-12'],
};

const peerFoodBank: FoodBank = {
  ...foodBank,
  id: 'fb-peer',
  name: 'Peer Food Bank',
  monthlyDemandCases: 2000,
};

function makeInventory(overrides: Partial<FoodBankInventory> = {}): FoodBankInventory {
  return {
    foodBankId: 'fb-test',
    item: 'salmon',
    onHandLbs: 100,
    avgWeeklyUsageLbs: 200,
    lastReceivedDate: '2026-07-10',
    ...overrides,
  };
}

function makeLot(overrides: Partial<SurplusLot> & { id: string }): SurplusLot {
  return {
    supplierId: 'sup-001',
    species: 'salmon',
    lbs: 2000,
    harvestDate: '2026-07-14',
    expiryDate: '2026-07-22',
    pricePerLb: 1.44,
    marketPricePerLb: 1.80,
    proposedDiscountPct: 20,
    landingLocation: 'Monterey, CA',
    status: 'AVAILABLE',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('draftReplenishmentList()', () => {
  it('returns empty lineItems when all inventory is above the threshold', () => {
    const inv = makeInventory({ onHandLbs: 2000, avgWeeklyUsageLbs: 100 }); // 20 weeks stock
    const result = draftReplenishmentList(foodBank, [inv], [], [], [peerFoodBank], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems).toHaveLength(0);
    expect(result.criticalCount).toBe(0);
    expect(result.totalSuggestedLbs).toBe(0);
  });

  it('flags items below the weeksAhead threshold', () => {
    const inv = makeInventory({ onHandLbs: 100, avgWeeklyUsageLbs: 200 }); // 0.5 weeks
    const result = draftReplenishmentList(foodBank, [inv], [], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0].item).toBe('salmon');
    expect(result.lineItems[0].weeksOfStockRemaining).toBeLessThan(DEFAULT_WEEKS_AHEAD);
  });

  it('marks items at 0 weeks as critical', () => {
    const inv = makeInventory({ onHandLbs: 0, avgWeeklyUsageLbs: 200 });
    const result = draftReplenishmentList(foodBank, [inv], [], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.criticalCount).toBe(1);
    expect(result.lineItems[0].weeksOfStockRemaining).toBe(0);
    expect(result.lineItems[0].shortageScore).toBe(1);
  });

  it('accounts for upcoming distribution events in stock projection', () => {
    const inv = makeInventory({ onHandLbs: 800, avgWeeklyUsageLbs: 200 }); // 4 weeks normally
    const event: DistributionEvent = {
      foodBankId: 'fb-test',
      date: '2026-07-20',
      label: 'Test Distribution',
      itemAllocations: [{ item: 'salmon', allocatedLbs: 600 }], // draws down 600 lbs
    };
    // After distribution: 200 lbs left — 1 week, below 2-week threshold
    const result = draftReplenishmentList(foodBank, [inv], [event], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0].weeksOfStockRemaining).toBeLessThan(DEFAULT_WEEKS_AHEAD);
  });

  it('applies seasonal factor to demand projection (July = peak for salmon)', () => {
    // July seasonal factor for salmon = 1.4 — demand is higher
    const julyFactor = SEASONAL_FACTORS['salmon'][6]; // index 6 = July
    expect(julyFactor).toBeGreaterThan(1.0);
    // With 600 lbs on hand and 300/wk base usage → ~1.43 weeks base
    // After July seasonal factor (1.4x) → effective usage = 420/wk → ~1.43w → flagged
    const inv = makeInventory({ onHandLbs: 600, avgWeeklyUsageLbs: 300 });
    const result = draftReplenishmentList(foodBank, [inv], [], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems).toHaveLength(1);
  });

  it('recommends SURPLUS_LOT when a matching available lot exists', () => {
    const inv = makeInventory({ onHandLbs: 50, avgWeeklyUsageLbs: 200 });
    const lot = makeLot({ id: 'lot-test', species: 'salmon', status: 'AVAILABLE', lbs: 500 });
    const result = draftReplenishmentList(foodBank, [inv], [], [lot], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems[0].sourceType).toBe('SURPLUS_LOT');
    expect(result.lineItems[0].sourceId).toBe('lot-test');
  });

  it('recommends LATERAL_TRANSFER when no surplus lot matches', () => {
    const inv = makeInventory({ onHandLbs: 50, avgWeeklyUsageLbs: 200 });
    // No available lots for salmon
    const result = draftReplenishmentList(foodBank, [inv], [], [], [peerFoodBank], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems[0].sourceType).toBe('LATERAL_TRANSFER');
    expect(result.lineItems[0].sourceId).toBe('fb-peer');
  });

  it('falls back to SUPPLIER_ORDER when no lot or peer available', () => {
    const inv = makeInventory({ onHandLbs: 50, avgWeeklyUsageLbs: 200 });
    const result = draftReplenishmentList(foodBank, [inv], [], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems[0].sourceType).toBe('SUPPLIER_ORDER');
  });

  it('sorts lineItems by shortageScore descending', () => {
    const critical = makeInventory({ item: 'salmon',  onHandLbs: 0,   avgWeeklyUsageLbs: 200 });
    const moderate = makeInventory({ item: 'sardine', onHandLbs: 200, avgWeeklyUsageLbs: 200 });
    const result = draftReplenishmentList(foodBank, [moderate, critical], [], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(result.lineItems[0].shortageScore).toBeGreaterThanOrEqual(result.lineItems[1]?.shortageScore ?? 0);
  });

  it('reason string is always present and non-empty', () => {
    const empty = draftReplenishmentList(foodBank, [], [], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(empty.reason).toBeTruthy();
    const inv = makeInventory({ onHandLbs: 50, avgWeeklyUsageLbs: 200 });
    const active = draftReplenishmentList(foodBank, [inv], [], [], [], DEFAULT_WEEKS_AHEAD, NOW);
    expect(active.reason).toContain('Agent recommends. You decide.');
  });
});
