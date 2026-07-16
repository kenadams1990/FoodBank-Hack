// pipeline.ts — TideLift Agent Pipeline Orchestrator
// Runs all agents in sequence. Each step produces a draft + approval request.
// Nothing is committed until a human approves. Agent recommends. You decide.

import type {
  SurplusLot, CanningFacility, FoodBank, Quote, Supplier,
  RecommendationBundle
} from '../../packages/shared/src/types';
import { scoreLot } from './scorer';
import { draftProcurementAction } from './procure';
import { matchFacilities } from './canning';
import { planDelivery } from './route';
import { generateBrief } from './analyst';
import { createApprovalRequest } from './approvals';

export type PipelineResult = {
  bundle: RecommendationBundle;
  procurementApprovalId: string;
  facilityApprovalId: string;
  deliveryApprovalId: string;
};

export function runPipeline(
  lot: SurplusLot,
  supplier: Supplier,
  quotes: Quote[],
  facilities: CanningFacility[],
  foodBanks: FoodBank[]
): PipelineResult {
  // Step 1: Score
  const scored = scoreLot(lot, facilities, foodBanks);

  // Step 2: Draft procurement — creates ApprovalRequest, does NOT commit
  const procurementDraft = draftProcurementAction(lot, supplier, quotes);
  const procurementApproval = createApprovalRequest(
    'PROCUREMENT',
    lot.id,
    'SurplusLot',
    `Score ${scored.score}/100. ` + procurementDraft.justification,
    'agent:pipeline'
  );

  // Step 3: Match facility — creates ApprovalRequest, does NOT book
  const facilityMatches = matchFacilities(lot, facilities);
  const topFacility = facilityMatches[0];
  const facilityApproval = createApprovalRequest(
    'FACILITY_BOOKING',
    topFacility?.facility.id ?? lot.id,
    'CanningFacility',
    topFacility
      ? `Top match: ${topFacility.facility.name} (score ${topFacility.matchScore}/100). ${topFacility.matchReason}`
      : 'No compatible facilities found.',
    'agent:pipeline'
  );

  // Step 4: Plan delivery — creates ApprovalRequest, does NOT assign
  const estimatedCans = topFacility?.estimatedCans ?? Math.floor(lot.weightLbs * 1.8 * 0.88);
  const shipmentDrafts = planDelivery(lot, estimatedCans, foodBanks);
  const deliveryApproval = createApprovalRequest(
    'DELIVERY_RELEASE',
    lot.id,
    'SurplusLot',
    `Delivery plan: ${shipmentDrafts.length} food bank(s), ${estimatedCans.toLocaleString()} cans total. ` +
    shipmentDrafts.map(d => `${d.foodBank.name}: ${d.cansAllocated} cans`).join(', '),
    'agent:pipeline'
  );

  // Step 5: Generate human-readable brief
  const agentBrief = generateBrief({
    alert: {
      fisheryId: supplier.id,
      species: lot.species,
      lbs: lot.weightLbs,
      landingAt: supplier.location,
      marketPricePerLb: lot.marketPricePerLb,
      proposedDiscountPct: lot.proposedDiscountPct,
    },
    canningJob: {
      surplusId: lot.id,
      coPackerId: topFacility?.facility.id ?? 'tbd',
      cansTarget: estimatedCans,
      stagePlan: topFacility ? [
        `Transport ${lot.weightLbs} lbs to ${topFacility.facility.name} by ${topFacility.slot.date}`,
        `Inspect + sort at receiving dock`,
        `Run canning line: ~${topFacility.estimatedDays} day(s)`,
        `Label + palletize for TideLift x partner`,
      ] : [],
      yieldPct: 88,
    },
    deliveredTo: shipmentDrafts.map(d => ({
      neighborhood: d.foodBank.location,
      cansAllocated: d.cansAllocated,
    })),
  });

  const bundle: RecommendationBundle = {
    lot: scored,
    procurementDraft,
    facilityMatches,
    shipmentDrafts,
    agentBrief,
    generatedAt: new Date().toISOString(),
  };

  return {
    bundle,
    procurementApprovalId: procurementApproval.id,
    facilityApprovalId: facilityApproval.id,
    deliveryApprovalId: deliveryApproval.id,
  };
}
