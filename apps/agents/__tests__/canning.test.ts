import { describe, it, expect } from 'vitest';
import { matchFacilities } from '../canning';
import type { SurplusLot, CanningFacility } from '@tidelift/shared';

const lot: SurplusLot = {
  id: 'lot-test-001',
  supplierId: 'sup-test-001',
  species: 'salmon',
  lbs: 4000,
  harvestDate: '2026-07-14',
  expiryDate: '2026-07-19',
  pricePerLb: 1.44,
  marketPricePerLb: 2.0,
  proposedDiscountPct: 20,
  landingLocation: 'Monterey, CA',
  status: 'AVAILABLE',
};

// Far-future slot dates so matchFacilities' "slot >= today" filter never
// makes these tests time-dependent.
const salmonFacility: CanningFacility = {
  id: 'fac-a',
  name: 'Alpha Cannery',
  location: 'Richmond, CA',
  capacityCasesPerDay: 600,
  compatibleSpecies: ['salmon', 'sardine'],
  certifications: ['SQF', 'HACCP', 'FDA Registered'],
  costPerCan: 0.38,
  availableSlots: [{ date: '2099-01-02', capacityLbs: 5000 }],
};

const sardineOnlyFacility: CanningFacility = {
  id: 'fac-b',
  name: 'Beta Cannery',
  location: 'Fresno, CA',
  capacityCasesPerDay: 400,
  compatibleSpecies: ['sardine'],
  certifications: ['HACCP'],
  costPerCan: 0.32,
  availableSlots: [{ date: '2099-01-02', capacityLbs: 5000 }],
};

const undersizedFacility: CanningFacility = {
  id: 'fac-c',
  name: 'Gamma Cannery',
  location: 'Astoria, OR',
  capacityCasesPerDay: 200,
  compatibleSpecies: ['salmon'],
  certifications: ['HACCP'],
  costPerCan: 0.44,
  // capacity below 50% of the lot's lbs -> slot filtered out
  availableSlots: [{ date: '2099-01-02', capacityLbs: 1500 }],
};

describe('matchFacilities', () => {
  it('excludes facilities that cannot handle the species', () => {
    const matches = matchFacilities(lot, [salmonFacility, sardineOnlyFacility]);
    expect(matches.map((m) => m.facility.id)).toEqual(['fac-a']);
  });

  it('excludes facilities without a slot covering at least half the lot', () => {
    const matches = matchFacilities(lot, [salmonFacility, undersizedFacility]);
    expect(matches.map((m) => m.facility.id)).toEqual(['fac-a']);
  });

  it('estimates cans from lbs at 88% yield and ~0.55 lbs/can', () => {
    const [match] = matchFacilities(lot, [salmonFacility]);
    expect(match.estimatedCans).toBe(Math.floor((lot.lbs * 0.88) / 0.55));
    expect(match.estimatedCost).toBeCloseTo(match.estimatedCans * salmonFacility.costPerCan, 2);
  });

  it('ranks matches by matchScore descending', () => {
    const bigFacility: CanningFacility = {
      ...undersizedFacility,
      id: 'fac-d',
      name: 'Delta Cannery',
      availableSlots: [{ date: '2099-01-02', capacityLbs: 10000 }],
      certifications: ['SQF', 'HACCP', 'MSC'],
      costPerCan: 0.3,
    };
    const matches = matchFacilities(lot, [salmonFacility, bigFacility]);
    expect(matches.length).toBe(2);
    expect(matches[0].matchScore).toBeGreaterThanOrEqual(matches[1].matchScore);
  });

  it('includes a human-readable rationale naming the facility', () => {
    const [match] = matchFacilities(lot, [salmonFacility]);
    expect(match.rationale).toContain('Alpha Cannery');
    expect(match.rationale).toContain('cans');
  });
});
