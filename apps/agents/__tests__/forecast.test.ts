import { describe, it, expect } from 'vitest';
import { evaluateSurplus, mockSurplusFeed } from '../forecast';
import type { SurplusAlert } from '@shared/types';

describe('evaluateSurplus', () => {
  it('recommends a buy when discount savings and volume both clear the threshold', () => {
    const alert: SurplusAlert = mockSurplusFeed[0]; // Albacore Tuna: 22% off $1.85/lb, 4200 lbs
    const result = evaluateSurplus(alert);

    expect(result.recommend).toBe(true);
    expect(result.reason).toMatch(/Strong discount/);
    expect(result.estimatedCanYield).toBe(Math.floor(alert.lbs * 1.8));
  });

  it('rejects a buy when the per-lb savings is too thin even at high volume', () => {
    const alert: SurplusAlert = {
      fisheryId: 'test-001',
      species: 'Test Fish',
      lbs: 5000,
      landingAt: 'Test Harbor, CA',
      marketPricePerLb: 1.0,
      proposedDiscountPct: 10, // savings = $0.10/lb, below the $0.20 threshold
    };

    const result = evaluateSurplus(alert);

    expect(result.recommend).toBe(false);
    expect(result.reason).toMatch(/too low/);
  });

  it('rejects a buy when volume is below the minimum lbs threshold', () => {
    const alert: SurplusAlert = {
      fisheryId: 'test-002',
      species: 'Test Fish',
      lbs: 500, // below the 1000 lb minimum
      landingAt: 'Test Harbor, CA',
      marketPricePerLb: 2.0,
      proposedDiscountPct: 50, // savings = $1.00/lb, well above threshold
    };

    const result = evaluateSurplus(alert);

    expect(result.recommend).toBe(false);
  });
});
