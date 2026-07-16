import { describe, it, expect } from 'vitest';
import { draftProcurement } from '../procure';
import type { SurplusLot, Quote } from '@tidelift/shared';

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

const quotes: Quote[] = [
  { id: 'q-1', lotId: 'lot-test-001', supplierId: 'sup-test-001', pricePerLb: 1.6, moqLbs: 2000, validUntil: '2026-07-18', status: 'OPEN' },
  { id: 'q-2', lotId: 'lot-test-001', supplierId: 'sup-test-001', pricePerLb: 1.5, moqLbs: 4000, validUntil: '2026-07-18', status: 'OPEN' },
  { id: 'q-3', lotId: 'other-lot', supplierId: 'sup-test-001', pricePerLb: 0.9, moqLbs: 1000, validUntil: '2026-07-18', status: 'OPEN' },
  { id: 'q-4', lotId: 'lot-test-001', supplierId: 'sup-test-001', pricePerLb: 1.0, moqLbs: 4000, validUntil: '2026-07-18', status: 'REJECTED' },
];

describe('draftProcurement', () => {
  it('targets 5% below the best OPEN quote for this lot', () => {
    const draft = draftProcurement(lot, quotes);

    // best open quote for this lot is 1.50; 5% below = 1.425 -> rounds to 1.42
    // (1.425*100 is 142.4999... in float), above the 60%-of-market floor (1.20)
    expect(draft.recommendedPricePerLb).toBeCloseTo(1.42, 2);
    expect(draft.recommendedMoqLbs).toBe(4000);
  });

  it('ignores quotes for other lots and non-OPEN quotes', () => {
    // q-3 (other lot, 0.90) and q-4 (REJECTED, 1.00) must not drive the price
    const draft = draftProcurement(lot, quotes);
    expect(draft.recommendedPricePerLb).toBeGreaterThan(1.0);
  });

  it('floors the target price at 60% of market', () => {
    const lowballQuotes: Quote[] = [
      { id: 'q-low', lotId: 'lot-test-001', supplierId: 'sup-test-001', pricePerLb: 0.5, moqLbs: 4000, validUntil: '2026-07-18', status: 'OPEN' },
    ];
    const draft = draftProcurement(lot, lowballQuotes);
    expect(draft.recommendedPricePerLb).toBe(1.2); // 60% of $2.00 market
  });

  it('falls back to the lot discount when no open quotes exist', () => {
    const draft = draftProcurement(lot, []);
    expect(draft.recommendedPricePerLb).toBeCloseTo(1.6, 2); // 20% off $2.00
    expect(draft.recommendedMoqLbs).toBe(lot.lbs);
  });

  it('computes total cost and savings vs market', () => {
    const draft = draftProcurement(lot, quotes);
    expect(draft.estimatedTotalCost).toBeCloseTo(draft.recommendedPricePerLb * lot.lbs, 2);
    expect(draft.estimatedSavingsVsMarket).toBeCloseTo(
      (lot.marketPricePerLb - draft.recommendedPricePerLb) * lot.lbs,
      2
    );
  });

  it('produces a negotiation script that is a draft pending human approval', () => {
    const draft = draftProcurement(lot, quotes);
    expect(draft.negotiationScript).toContain('4,000 lbs');
    expect(draft.negotiationScript).toContain('salmon');
    expect(draft.negotiationScript).toMatch(/pending operator approval/i);
    expect(draft.offerExpiresHrs).toBe(24);
  });
});
