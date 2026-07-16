import { describe, it, expect } from 'vitest';
import { MOCK_SURPLUS_EVENTS } from '@shared/mockData';

describe('MOCK_SURPLUS_EVENTS (via @shared alias)', () => {
  it('resolves the @shared alias to packages/shared/src', () => {
    expect(Array.isArray(MOCK_SURPLUS_EVENTS)).toBe(true);
    expect(MOCK_SURPLUS_EVENTS.length).toBeGreaterThan(0);
  });

  it('includes the Bodega Bay crab event with the expected shape', () => {
    const crab = MOCK_SURPLUS_EVENTS.find((e) => e.id === 'evt-003');

    expect(crab).toBeDefined();
    expect(crab?.species).toBe('Dungeness Crab (broken pieces)');
    expect(crab?.proposedDiscountPct).toBe(40);
  });
});
