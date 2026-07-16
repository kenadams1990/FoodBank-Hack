import { describe, it, expect } from 'vitest';
import { buildDeliveryPlan, mockAgencyNeeds } from '../route';

describe('buildDeliveryPlan', () => {
  it('prioritizes the agency with the largest protein gap first', () => {
    const plan = buildDeliveryPlan(2000, mockAgencyNeeds);

    // East Oakland has the higher proteinGapLbs (1200 vs 800) and should be allocated first
    expect(plan[0].agencyId).toBe('foodbank-oak-007');
  });

  it('caps total allocation at the available cans, leaving later agencies short', () => {
    const availableCans = 1000; // less than the combined need of both mock agencies
    const plan = buildDeliveryPlan(availableCans, mockAgencyNeeds);

    const totalAllocated = plan.reduce((sum, p) => sum + p.cansAllocated, 0);
    expect(totalAllocated).toBeLessThanOrEqual(availableCans);
  });

  it('includes dietary prefs and the first access window in route notes', () => {
    const plan = buildDeliveryPlan(5000, mockAgencyNeeds);
    const eastOakland = plan.find((p) => p.agencyId === 'foodbank-oak-007')!;

    expect(eastOakland.deliveryWindow).toBe('Mon 9-12');
    expect(eastOakland.routeNotes).toContain('halal');
    expect(eastOakland.routeNotes).toContain('low-sodium');
  });
});
