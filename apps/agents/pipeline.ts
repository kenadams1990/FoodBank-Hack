// pipeline.ts — TideLift Agent Pipeline Orchestrator
// Runs all agents in sequence. Each step produces a draft.
// No state changes until a human approves via approvals.ts.

import type { SurplusLot, CanningFacility, FoodBank, Quote, Approval } from '../../packages/shared/src/types';
import { scoreLot, type ScoreBreakdown } from './scorer';
import { draftProcurement, type DraftProcurementAction } from './procure';
import { matchFacilities, type FacilityMatch } from './canning';
import { planDelivery, type ShipmentDraft } from './route';
import { createApprovalRequest } from './approvals';

export type PipelineResult = {
  lotId: string;
  score: ScoreBreakdown;
  procurement: {
    draft: DraftProcurementAction;
    approvalRequest: Approval;
  };
  canning: {
    topMatch: FacilityMatch;
    allMatches: FacilityMatch[];
    approvalRequest: Approval;
  };
  delivery: {
    drafts: ShipmentDraft[];
    approvalRequest: Approval;
  };
};

export function runPipeline(
  lot: SurplusLot,
  quotes: Quote[],
  facilities: CanningFacility[],
  foodBanks: FoodBank[]
): PipelineResult {
  // Step 1: Score
  const score = scoreLot(lot, facilities, foodBanks);

  // Step 2: Draft procurement — requires operator approval before sending
  const procurementDraft = draftProcurement(lot, quotes);
  const procurementApproval = createApprovalRequest(
    'PROCUREMENT',
    lot.id,
    procurementDraft,
    'agent:procure'
  );

  // Step 3: Match canning facility — requires operator approval before booking
  const facilityMatches = matchFacilities(lot, facilities);
  const topMatch = facilityMatches[0];
  const canningApproval = createApprovalRequest(
    'FACILITY_BOOKING',
    lot.id,
    { topMatch, allMatches: facilityMatches },
    'agent:canning'
  );

  // Step 4: Plan delivery — requires operator approval before releasing
  const estimatedCans = topMatch?.estimatedCans ?? Math.floor(lot.lbs * 1.8 * 0.88);
  const deliveryDrafts = topMatch
    ? planDelivery(estimatedCans, foodBanks, topMatch.facility)
    : [];
  const deliveryApproval = createApprovalRequest(
    'DELIVERY_RELEASE',
    lot.id,
    deliveryDrafts,
    'agent:route'
  );

  return {
    lotId: lot.id,
    score,
    procurement: { draft: procurementDraft, approvalRequest: procurementApproval },
    canning: { topMatch, allMatches: facilityMatches, approvalRequest: canningApproval },
    delivery: { drafts: deliveryDrafts, approvalRequest: deliveryApproval },
  };
}
