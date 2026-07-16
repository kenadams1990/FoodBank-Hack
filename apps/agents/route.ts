// route.ts — Equity-Aware Delivery Planner
// Drafts ShipmentDraft[] sorted by food bank urgency (protein gap).
// Requires DELIVERY_RELEASE approval before confirming.

import type { FoodBank, CanningFacility, SurplusLot, ShipmentDraft, AgencyNeed, DeliveryPlan } from '../../packages/shared/src/types';

// Legacy DeliveryPlan type re-export for existing consumers
export type { DeliveryPlan };

export function planDeliveries(
  lot: SurplusLot,
  facility: CanningFacility,
  banks: FoodBank[]
): ShipmentDraft[] {
  const totalCases = Math.floor(lot.lbs * 1.8 / 24);
  const eligible = banks
    .filter((b) => !b.dietaryRestrictions.some((r) => r === `no-${lot.species}`))
    .sort((a, b) => b.monthlyDemandCases - a.monthlyDemandCases);

  let remaining = totalCases;
  return eligible
    .filter(() => remaining > 0)
    .map((bank) => {
      const share = Math.min(remaining, Math.ceil(bank.monthlyDemandCases * 0.15));
      remaining -= share;
      return {
        lotId: lot.id,
        facilityId: facility.id,
        foodBankId: bank.id,
        foodBankName: bank.name,
        estimatedCases: share,
        deliveryWindow: bank.accessWindows[0],
        routeNotes:
          `Dietary restrictions: ${bank.dietaryRestrictions.join(', ') || 'none'}. ` +
          `Region: ${bank.region}. Contact: ${bank.contactEmail}.`,
      } as ShipmentDraft;
    });
}

/** Legacy equity routing for backward compatibility */
export const mockAgencyNeeds: AgencyNeed[] = [
  { agencyId: 'foodbank-oak-007', neighborhood: 'East Oakland', proteinGapLbs: 1200, accessWindows: ['Mon 9-12', 'Wed 9-12', 'Fri 9-12'], dietaryPrefs: ['halal', 'low-sodium'] },
  { agencyId: 'pantry-frm-002', neighborhood: 'Fruitvale', proteinGapLbs: 800, accessWindows: ['Tue 10-2', 'Thu 10-2'], dietaryPrefs: ['no-shellfish'] },
];

export function buildDeliveryPlan(availableCans: number, needs: AgencyNeed[]): DeliveryPlan[] {
  const sorted = [...needs].sort((a, b) => b.proteinGapLbs - a.proteinGapLbs);
  let remaining = availableCans;
  return sorted.filter(() => remaining > 0).map((agency) => {
    const cansNeeded = Math.ceil(agency.proteinGapLbs * 1.8);
    const cansAllocated = Math.min(cansNeeded, remaining);
    remaining -= cansAllocated;
    return {
      agencyId: agency.agencyId,
      neighborhood: agency.neighborhood,
      cansAllocated,
      deliveryWindow: agency.accessWindows[0],
      routeNotes: `Dietary: ${agency.dietaryPrefs.join(', ')}. EV truck preferred.`,
    };
  });
}
