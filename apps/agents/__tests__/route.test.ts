import { describe, it, expect } from 'vitest';
import { planEquityDelivery, replanAfterDrop, mockAgencyNeeds } from '../route';
import type { AgencyNeed } from '../../../packages/shared/src/types';

const bigGapShelfStable: AgencyNeed = {
  agencyId: 'agency-big-gap',
  neighborhood: 'Test Big Gap',
  proteinGapLbs: 1000,
  accessWindows: ['Mon 9-12', 'Wed 9-12', 'Fri 9-12'],
  dietaryPrefs: [],
};

const smallGapPerishable: AgencyNeed = {
  agencyId: 'agency-perishable',
  neighborhood: 'Test Perishable',
  proteinGapLbs: 400,
  accessWindows: ['Tue 10-2'],
  dietaryPrefs: ['halal'],
  perishableCapacity: 300,
};

describe('planEquityDelivery', () => {
  it('ranks a smaller-gap perishable agency with a tight window above a larger-gap shelf-stable agency', () => {
    const plan = planEquityDelivery(2000, [bigGapShelfStable, smallGapPerishable]);

    expect(plan[0].agency).toBe('agency-perishable');
    expect(plan[0].urgencyScore).toBeGreaterThan(plan[1].urgencyScore);
  });

  it('marks the perishable, high-urgency agency as perishablePriority', () => {
    const plan = planEquityDelivery(2000, [bigGapShelfStable, smallGapPerishable]);
    const perishableRow = plan.find((p) => p.agency === 'agency-perishable')!;

    expect(perishableRow.perishablePriority).toBe(true);
  });

  it('caps total allocation at availableLbs', () => {
    const availableLbs = 1000; // less than combined gap of mockAgencyNeeds
    const plan = planEquityDelivery(availableLbs, mockAgencyNeeds);

    const totalAllocated = plan.reduce((sum, p) => sum + p.allocatedLbs, 0);
    expect(totalAllocated).toBeLessThanOrEqual(availableLbs);
  });

  it('never allocates more lbs to an agency than its protein gap', () => {
    const plan = planEquityDelivery(50000, mockAgencyNeeds);

    for (const row of plan) {
      const need = mockAgencyNeeds.find((n) => n.agencyId === row.agency)!;
      expect(row.allocatedLbs).toBeLessThanOrEqual(need.proteinGapLbs);
    }
  });

  it('uses the first access window as the chosen accessWindow', () => {
    const plan = planEquityDelivery(2000, [bigGapShelfStable, smallGapPerishable]);
    const row = plan.find((p) => p.agency === 'agency-big-gap')!;

    expect(row.accessWindow).toBe('Mon 9-12');
  });

  it('produces a difficulty-aware driverLoadNote, not a stop count', () => {
    const plan = planEquityDelivery(2000, [bigGapShelfStable, smallGapPerishable]);
    const perishableRow = plan.find((p) => p.agency === 'agency-perishable')!;

    expect(perishableRow.driverLoadNote).toMatch(/cold-chain|narrow|single/i);
    expect(perishableRow.driverLoadNote).not.toMatch(/^\d+ stops?$/i);
  });

  it('documents the urgency weighting in the human-readable reason', () => {
    const plan = planEquityDelivery(2000, [bigGapShelfStable, smallGapPerishable]);

    for (const row of plan) {
      expect(row.reason.length).toBeGreaterThan(0);
      expect(row.reason).toMatch(/0\.5/);
      expect(row.reason).toMatch(/0\.3/);
      expect(row.reason).toMatch(/0\.2/);
    }
  });

  it('every row is a draft recommendation carrying a reason (human-in-the-loop)', () => {
    const plan = planEquityDelivery(5000, mockAgencyNeeds);
    expect(plan.length).toBeGreaterThan(0);
    for (const row of plan) {
      expect(typeof row.reason).toBe('string');
      expect(row.reason.length).toBeGreaterThan(0);
    }
  });
});

describe('replanAfterDrop', () => {
  it('excludes the dropped agency from the rebuilt plan', () => {
    const original = planEquityDelivery(2000, [bigGapShelfStable, smallGapPerishable]);
    const topAgency = original[0].agency;

    const replanned = replanAfterDrop(
      [bigGapShelfStable, smallGapPerishable],
      2000,
      topAgency
    );

    expect(replanned.find((p) => p.agency === topAgency)).toBeUndefined();
  });

  it('reallocates freed lbs to the next-most-urgent agency after a drop', () => {
    // Tight budget: only enough for the top agency in the original plan.
    const tightBudget = 400;
    const needs = [bigGapShelfStable, smallGapPerishable];

    const original = planEquityDelivery(tightBudget, needs);
    const topAgency = original[0].agency; // agency-perishable, gap 400 -> consumes whole budget

    const replanned = replanAfterDrop(needs, tightBudget, topAgency);

    // With the top agency dropped, the remaining agency should now receive an allocation.
    expect(replanned.length).toBe(1);
    expect(replanned[0].agency).toBe('agency-big-gap');
    expect(replanned[0].allocatedLbs).toBeGreaterThan(0);
  });
});

describe('mockAgencyNeeds', () => {
  it('has at least 5 realistic Alameda County partner agencies', () => {
    expect(mockAgencyNeeds.length).toBeGreaterThanOrEqual(5);
  });

  it('includes a mix of agencies with and without perishable capacity', () => {
    const withPerishable = mockAgencyNeeds.filter(
      (n) => (n.perishableCapacity ?? 0) > 0
    );
    const withoutPerishable = mockAgencyNeeds.filter(
      (n) => !(n.perishableCapacity && n.perishableCapacity > 0)
    );
    expect(withPerishable.length).toBeGreaterThan(0);
    expect(withoutPerishable.length).toBeGreaterThan(0);
  });
});
