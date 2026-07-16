import { describe, it, expect } from 'vitest';
import { generateRFQ } from '../procure';
import type { SurplusAlert } from '@tidelift/shared';

describe('generateRFQ', () => {
  const alert: SurplusAlert = {
    fisheryId: 'monterey-001',
    species: 'Albacore Tuna',
    lbs: 4200,
    landingAt: 'Monterey Bay Fisheries, CA',
    marketPricePerLb: 1.85,
    proposedDiscountPct: 22,
  };

  it('discounts the market price by the proposed percentage, rounded to cents', () => {
    const rfq = generateRFQ(alert);

    expect(rfq.proposedPricePerLb).toBeCloseTo(1.443, 2);
    expect(rfq.fisheryId).toBe(alert.fisheryId);
    expect(rfq.offerExpiresHrs).toBe(24);
  });

  it('includes the lbs, species, and discount in the negotiation notes', () => {
    const rfq = generateRFQ(alert);

    expect(rfq.negotiationNotes).toContain('4,200 lbs Albacore Tuna');
    expect(rfq.negotiationNotes).toContain('22% discount');
    expect(rfq.negotiationNotes).toContain('$1.85/lb');
  });

  it('generates a unique surplusId per call', () => {
    const first = generateRFQ(alert);
    const second = generateRFQ(alert);

    expect(first.surplusId).toContain(alert.fisheryId);
    expect(typeof first.surplusId).toBe('string');
    expect(second.surplusId).toContain(alert.fisheryId);
  });
});
