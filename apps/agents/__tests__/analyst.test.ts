import { describe, it, expect } from 'vitest';
import { generateBrief } from '../analyst';
import type { SurplusAlert, CanningJob } from '@shared/types';

describe('generateBrief', () => {
  const alert: SurplusAlert = {
    fisheryId: 'monterey-001',
    species: 'Albacore Tuna',
    lbs: 4200,
    landingAt: 'Monterey Bay Fisheries, CA',
    marketPricePerLb: 1.85,
    proposedDiscountPct: 22,
  };

  const canningJob: CanningJob = {
    surplusId: 'monterey-001-123',
    coPackerId: 'cp-bay-001',
    cansTarget: 7560,
    stagePlan: ['step 1', 'step 2'],
    yieldPct: 88,
  };

  const deliveredTo = [
    { neighborhood: 'East Oakland', cansAllocated: 2160 },
    { neighborhood: 'Fruitvale', cansAllocated: 1440 },
  ];

  it('sums cans allocated across all delivery neighborhoods', () => {
    const brief = generateBrief({ alert, canningJob, deliveredTo });

    expect(brief).toContain('Delivered**: 3,600 cans across 2 neighborhood(s)');
  });

  it('lists each neighborhood with its allocation', () => {
    const brief = generateBrief({ alert, canningJob, deliveredTo });

    expect(brief).toContain('East Oakland: 2,160 cans');
    expect(brief).toContain('Fruitvale: 1,440 cans');
  });

  it('always closes with the human-in-the-loop reminder', () => {
    const brief = generateBrief({ alert, canningJob, deliveredTo });

    expect(brief.trim().endsWith('_Agent recommends. You decide._')).toBe(true);
  });
});
