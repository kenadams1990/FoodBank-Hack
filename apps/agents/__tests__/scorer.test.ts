// scorer.test.ts — Unit tests for opportunity scorer
import { describe, it, expect } from 'vitest';
import { scoreLot } from '../scorer';
import type { SurplusLot, CanningFacility, FoodBank } from '../../../packages/shared/src/types';

const mockLot: SurplusLot = {
  id: 'lot-test-001',
  supplierId: 'sup-001',
  species: 'salmon',
  lbs: 5000,
  harvestDate: '2026-07-15',
  expiryDate: '2026-07-17',
  pricePerLb: 1.44,
  marketPricePerLb: 1.80,
  proposedDiscountPct: 20,
  landingLocation: 'Monterey, CA',
  status: 'AVAILABLE',
};

const mockFacility: CanningFacility = {
  id: 'fac-001',
  name: 'Test Cannery',
  location: 'Richmond, CA',
  capacityCasesPerDay: 600,
  compatibleSpecies: ['salmon', 'sardine'],
  certifications: ['SQF', 'HACCP'],
  costPerCan: 0.38,
  availableSlots: [{ date: '2026-07-17', capacityLbs: 5000 }],
};

const mockFoodBank: FoodBank = {
  id: 'fb-001',
  name: 'Oakland Food Bank',
  location: 'Oakland, CA',
  region: 'Bay Area',
  monthlyDemandCases: 1200,
  contact: 'Test Contact',
  email: 'test@fb.org',
  dietaryPrefs: [],
  accessWindows: ['Mon 9-12'],
};

describe('scoreLot', () => {
  it('returns a score between 0 and 100', () => {
    const result = scoreLot(mockLot, [mockFacility], [mockFoodBank], new Date('2026-07-15'));
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it('scores urgency higher when expiry is within 2 days', () => {
    const urgent = { ...mockLot, expiryDate: '2026-07-16' };
    const notUrgent = { ...mockLot, expiryDate: '2026-07-30' };
    const today = new Date('2026-07-15');
    const urgentScore = scoreLot(urgent, [mockFacility], [mockFoodBank], today);
    const normalScore = scoreLot(notUrgent, [mockFacility], [mockFoodBank], today);
    expect(urgentScore.urgency).toBeGreaterThan(normalScore.urgency);
  });

  it('returns 0 demandMatch if no compatible facility', () => {
    const incompatible = { ...mockFacility, compatibleSpecies: ['sardine'] as any };
    const result = scoreLot(mockLot, [incompatible], [mockFoodBank], new Date('2026-07-15'));
    expect(result.demandMatch).toBe(0);
  });

  it('includes rationale string', () => {
    const result = scoreLot(mockLot, [mockFacility], [mockFoodBank], new Date('2026-07-15'));
    expect(result.rationale).toBeTruthy();
    expect(result.rationale.length).toBeGreaterThan(10);
  });
});
