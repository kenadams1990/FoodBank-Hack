import { describe, it, expect } from 'vitest';
import { buildCanningJob, mockCoPacker } from '../canning';

describe('buildCanningJob', () => {
  const slot = mockCoPacker[0];

  it('computes cansTarget from lbs using the 1.8 cans-per-lb yield factor', () => {
    const job = buildCanningJob('surplus-001', 4200, slot);

    expect(job.cansTarget).toBe(Math.floor(4200 * 1.8));
    expect(job.coPackerId).toBe(slot.coPackerId);
    expect(job.yieldPct).toBe(88);
  });

  it('builds a five-step staging plan referencing the co-packer and lbs', () => {
    const job = buildCanningJob('surplus-001', 4200, slot);

    expect(job.stagePlan).toHaveLength(5);
    expect(job.stagePlan[0]).toContain(`${4200} lbs`);
    expect(job.stagePlan[0]).toContain(slot.name);
    expect(job.stagePlan[4]).toMatch(/route agent/i);
  });

  it('rounds up the canning line duration to whole days', () => {
    const job = buildCanningJob('surplus-002', 12000, slot); // slot capacity is 5000 lbs/day

    expect(job.stagePlan[2]).toContain(`${Math.ceil(12000 / slot.capacityLbsPerDay)} day(s)`);
  });
});
