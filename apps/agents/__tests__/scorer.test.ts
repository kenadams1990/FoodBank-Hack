// scorer.test.ts — Unit tests for opportunity scorer
import { describe, it, expect } from 'vitest';
import { scoreLot } from '../scorer';
import type { SurplusLot, FoodBank, CanningFacility } from '../../../packages/shared/src/types';
import { FOOD_BANKS, CANNING_FACILITIES, SURPLUS_LOTS } from '../../../packages/shared/src/mockData';

const HIGH_VALUE_LOT: SurplusLot = {
  id: 'test-001',
  supplierId: 'sup-001',
  species: 'salmon',
  lbs: 3000,
  harvestDate: '2026-07-15',
  expiryDate: new Date(Date.now() + 1.5 * 86_400_000).toISOString().split('T')[0], // 1.5 days
  pricePerLb: 1.20,
  marketPricePerLb: 3.50,
  location: 'Monterey, CA',
  status: 'AVAILABLE',
  createdAt: '2026-07-15T00:00:00Z',
};

const LOW_VALUE_LOT: SurplusLot = {
  id: 'test-002',
  supplierId: 'sup-001',
  species: 'sardine',
  lbs: 100,
  harvestDate: '2026-07-15',
  expiryDate: new Date(Date.now() + 15 * 86_400_000).toISOString().split('T')[0], // 15 days
  pricePerLb: 0.63,
  marketPricePerLb: 0.65,
  location: 'Eureka, CA',
  status: 'AVAILABLE',
  createdAt: '2026-07-15T00:00:00Z',
};

describe('scoreLot', () => {
  it('scores a high-value lot above 70', () => {
    const result = scoreLot(HIGH_VALUE_LOT, FOOD_BANKS, CANNING_FACILITIES);
    expect(result.score).toBeGreaterThan(70);
    expect(result.lotId).toBe('test-001');
  });

  it('scores a low-value lot below 40', () => {
    const result = scoreLot(LOW_VALUE_LOT, FOOD_BANKS, CANNING_FACILITIES);
    expect(result.score).toBeLessThan(40);
  });

  it('returns a breakdown with 4 dimensions', () => {
    const result = scoreLot(HIGH_VALUE_LOT, FOOD_BANKS, CANNING_FACILITIES);
    const keys = Object.keys(result.breakdown);
    expect(keys).toContain('priceScore');
    expect(keys).toContain('expiryScore');
    expect(keys).toContain('volumeScore');
    expect(keys).toContain('demandScore');
  });

  it('scores are always between 0 and 100', () => {
    for (const lot of SURPLUS_LOTS) {
      const result = scoreLot(lot, FOOD_BANKS, CANNING_FACILITIES);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it('recommendation is a non-empty string', () => {
    const result = scoreLot(HIGH_VALUE_LOT, FOOD_BANKS, CANNING_FACILITIES);
    expect(typeof result.recommendation).toBe('string');
    expect(result.recommendation.length).toBeGreaterThan(0);
  });
});
