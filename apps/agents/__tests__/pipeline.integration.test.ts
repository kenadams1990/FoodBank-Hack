import { describe, it, expect } from 'vitest';
import { runPipeline } from '../pipeline';
import {
  SURPLUS_LOTS,
  QUOTES,
  CANNING_FACILITIES,
  FOOD_BANKS,
} from '../../../packages/shared/src/mockData';

describe('runPipeline — E2E integration', () => {
  it('returns 3 PENDING approval requests for a real seed lot', () => {
    const lot = SURPLUS_LOTS[0];
    const quotes = QUOTES.filter(q => q.lotId === lot.id);

    const result = runPipeline(lot, quotes, CANNING_FACILITIES, FOOD_BANKS);

    expect(result.lotId).toBe(lot.id);
    expect(result.procurement.approvalRequest.status).toBe('PENDING');
    expect(result.canning.approvalRequest.status).toBe('PENDING');
    expect(result.delivery.approvalRequest.status).toBe('PENDING');
  });

  it('score total is within 0–100 range', () => {
    const lot = SURPLUS_LOTS[0];
    const quotes = QUOTES.filter(q => q.lotId === lot.id);
    const result = runPipeline(lot, quotes, CANNING_FACILITIES, FOOD_BANKS);

    expect(result.score.total).toBeGreaterThanOrEqual(0);
    expect(result.score.total).toBeLessThanOrEqual(100);
  });

  it('produces PENDING approvals for all seed lots that have quotes', () => {
    const lotsWithQuotes = SURPLUS_LOTS.filter(
      lot => QUOTES.some(q => q.lotId === lot.id)
    );
    expect(lotsWithQuotes.length).toBeGreaterThan(0);

    for (const lot of lotsWithQuotes) {
      const quotes = QUOTES.filter(q => q.lotId === lot.id);
      const result = runPipeline(lot, quotes, CANNING_FACILITIES, FOOD_BANKS);
      expect(result.procurement.approvalRequest.status).toBe('PENDING');
      expect(result.canning.approvalRequest.status).toBe('PENDING');
      expect(result.delivery.approvalRequest.status).toBe('PENDING');
    }
  });
});
