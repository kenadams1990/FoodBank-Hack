// pipeline.ts — Agent Pipeline Orchestrator
// Runs all agents in sequence for a given lot.
// Each step produces a draft + approval request — nothing commits without human sign-off.

import type { SurplusLot, RecommendationBundle } from '../../packages/shared/src/types';
import { FOOD_BANKS, CANNING_FACILITIES, QUOTES } from '../../packages/shared/src/mockData';
import { scoreLot } from './scorer';
import { draftProcurement } from './procure';
import { matchFacilities } from './canning';
import { planDeliveries } from './route';
import { generateBrief } from './analyst';
import { createApprovalRequest } from './approvals';

export function runPipeline(lot: SurplusLot): RecommendationBundle {
  // Step 1: Score
  const score = scoreLot(lot, FOOD_BANKS, CANNING_FACILITIES);

  // Step 2: Draft procurement — creates approval request, does NOT submit
  const procurementDraft = draftProcurement(lot, QUOTES);
  createApprovalRequest('PROCUREMENT', lot.id, 'SurplusLot', {
    ...procurementDraft,
  });

  // Step 3: Match facilities — top match triggers facility booking approval request
  const facilityMatches = matchFacilities(lot, CANNING_FACILITIES);
  if (facilityMatches.length > 0) {
    createApprovalRequest('FACILITY_BOOKING', lot.id, 'SurplusLot', {
      facilityId: facilityMatches[0].facility.id,
      estimatedDays: facilityMatches[0].estimatedDays,
    });
  }

  // Step 4: Draft delivery plan — creates delivery release approval request
  const topFacility = facilityMatches[0]?.facility ?? CANNING_FACILITIES[0];
  const shipmentDrafts = planDeliveries(lot, topFacility, FOOD_BANKS);
  if (shipmentDrafts.length > 0) {
    createApprovalRequest('DELIVERY_RELEASE', lot.id, 'SurplusLot', {
      shipmentDrafts,
    });
  }

  // Step 5: Generate human-readable brief
  const brief = generateBrief({
    alert: {
      fisheryId: lot.supplierId,
      species: lot.species,
      lbs: lot.lbs,
      landingAt: lot.location,
      marketPricePerLb: lot.marketPricePerLb,
      proposedDiscountPct: Math.round((1 - lot.pricePerLb / lot.marketPricePerLb) * 100),
    },
    canningJob: {
      surplusId: lot.id,
      coPackerId: topFacility.id,
      cansTarget: Math.floor(lot.lbs * 1.8),
      stagePlan: [],
      yieldPct: 88,
    },
    deliveredTo: shipmentDrafts.map((s) => ({
      neighborhood: s.foodBankName,
      cansAllocated: s.estimatedCases * 24,
    })),
  });

  return {
    lot,
    score,
    procurementDraft,
    facilityMatches,
    shipmentDrafts,
    brief,
  };
}
