// intakePipeline.ts — server-only orchestration for the interactive Vessel
// Intake flow. Turns one vessel catch log into a real, PERSISTED run of the
// agent pipeline, human-gated by an operator approval.
//
// Two steps, mirroring the product rule "Agent recommends. You decide.":
//   1. runIntake()     — agents produce drafts; a PENDING procurement approval
//                        is written to the store (shows up in /audit + /api/approvals).
//   2. approveIntake() — the operator's decision resolves the approval, advances
//                        the lot to PROCUREMENT_CONFIRMED, and schedules an ACCFB
//                        shipment. Every mutation is audited by the store.
//
// Unlike the older guided-demo path (which used apps/agents/approvals.ts's
// module-level arrays), this routes everything through getDb(platform) — the
// same KV-backed store the dashboard, /audit and /api/approvals read from, so a
// run is visible across the whole app. That reconciles the two disjoint stores.
//
// HONESTY NOTE: the on-vessel CV counts and dockside thermal readings consumed
// here come from apps/agents/intake.ts, which are SIMULATED (seeded literals /
// pseudo-random), not a live camera or the trained fish-scan model. The UI
// badges these steps "Simulated". The downstream scoring, procurement,
// facility-matching, routing and overflow math is the real agent logic.

import { mockCatchLogs, evaluateCatchLog, sortAtDock } from '$agents/intake';
import { scoreLot } from '$agents/scorer';
import { draftProcurement } from '$agents/procure';
import { matchFacilities } from '$agents/canning';
import { planEquityDelivery } from '$agents/route';
import { draftOverflowDisposition } from '$agents/overflow';
import { SURPLUS_LOTS, CANNING_FACILITIES, FOOD_BANKS, QUOTES } from '$shared/mockData';
import type { AgencyNeed, Approval, SurplusLot } from '$shared/types';
import { getDb } from '$lib/store';

// Catch log → surplus lot. vcl-001/002 map to exact species+lbs+landing matches
// in the seed data; vcl-003 (oyster, 380 lbs) has no lot and is the sub-minimum
// HOLD case — the agent declines dispatch, so there is nothing downstream.
const CATCH_TO_LOT: Record<string, string | null> = {
  'vcl-001': 'lot-003',
  'vcl-002': 'lot-006',
  'vcl-003': null,
};

const ACCFB_ID = 'fb-001'; // Alameda County Community Food Bank

export function listCatchLogs() {
  return mockCatchLogs;
}

/**
 * Build the equity-routing comparison set for a lot destined for ACCFB, sized
 * to the accepted lbs — mirrors guided-demo/+page.server.ts so the algorithm
 * has real alternatives to weigh. Demo-scenario data, not sourced ACCFB figures.
 */
function accfbNeeds(acceptedLbs: number): AgencyNeed[] {
  const accfb = FOOD_BANKS.find((fb) => fb.id === ACCFB_ID)!;
  return [
    {
      agencyId: accfb.id,
      neighborhood: `${accfb.location} — ${accfb.name}`,
      proteinGapLbs: Math.round(acceptedLbs * 0.85),
      accessWindows: accfb.accessWindows,
      dietaryPrefs: accfb.dietaryPrefs,
      perishableCapacity: Math.round(acceptedLbs * 0.6),
    },
    {
      agencyId: 'pantry-frm-002',
      neighborhood: 'Fruitvale',
      proteinGapLbs: 800,
      accessWindows: ['Tue 10-2', 'Thu 10-2'],
      dietaryPrefs: ['no-shellfish'],
      perishableCapacity: 250,
    },
    {
      agencyId: 'pantry-sl-014',
      neighborhood: 'San Leandro',
      proteinGapLbs: 500,
      accessWindows: ['Wed 1-3'],
      dietaryPrefs: ['low-sodium', 'no-pork'],
    },
  ];
}

export type IntakeRunResult = Awaited<ReturnType<typeof runIntake>>;

/**
 * Run the intake pipeline for one catch and persist the drafts.
 * - Always returns the dispatch decision + dockside sort (the intake segment).
 * - If dispatch is recommended AND the catch maps to a lot, also runs the
 *   downstream agents, moves the lot to SCORED, and writes a PENDING
 *   procurement approval to the store (audited). Returns that approval's id so
 *   the UI can offer Approve/Reject.
 */
export async function runIntake(catchLogId: string, platform?: App.Platform) {
  const catchLog = mockCatchLogs.find((l) => l.id === catchLogId);
  if (!catchLog) throw new Error(`Catch log ${catchLogId} not found`);

  const dispatch = evaluateCatchLog(catchLog); // SIMULATED CV in → dispatch draft
  const dockResult = sortAtDock(catchLog); // SIMULATED thermal QA

  const mappedLotId = CATCH_TO_LOT[catchLogId] ?? null;

  // No dispatch or no downstream lot → the honest HOLD path. Nothing persisted.
  if (!dispatch.recommend || !mappedLotId) {
    return {
      catchLog,
      dispatch,
      dockResult,
      persisted: false as const,
      lot: null,
      score: null,
      procurement: null,
      topMatch: null,
      accfbDelivery: null,
      overflowDraft: null,
      approval: null,
    };
  }

  const db = getDb(platform);
  const seedLot = SURPLUS_LOTS.find((l) => l.id === mappedLotId)!;

  // Downstream agent drafts (real math; deterministic template rationale — the
  // Workers AI narration is reserved for the guided-demo hero surface).
  const score = scoreLot(seedLot, CANNING_FACILITIES, FOOD_BANKS);
  const quotes = QUOTES.filter((q) => q.lotId === seedLot.id);
  const procurement = draftProcurement(seedLot, quotes);
  const canningMatches = matchFacilities(seedLot, CANNING_FACILITIES);
  const topMatch = canningMatches[0] ?? null;
  const deliveryPlan = planEquityDelivery(dockResult.totalLbsAccepted, accfbNeeds(dockResult.totalLbsAccepted));
  const accfbDelivery = deliveryPlan.find((row) => row.agency === ACCFB_ID) ?? null;
  const overflowDraft = draftOverflowDisposition(seedLot, canningMatches, FOOD_BANKS, seedLot.pricePerLb);

  // Persist: advance the lot to SCORED (records the score + dock temp), then
  // write a PENDING procurement approval the operator must resolve.
  const avgTempC =
    dockResult.containers.reduce((s, c) => s + c.tempC, 0) / Math.max(1, dockResult.containers.length);
  const lot = await db.lots.update(mappedLotId, {
    status: 'SCORED',
    score: score.total,
    tempC: Math.round(avgTempC * 10) / 10,
  });

  // Idempotent: re-running the same catch reuses an existing open approval for
  // this lot rather than stacking duplicates.
  const existing = (await db.approvals.findAll()).find(
    (a) => a.entityId === mappedLotId && a.approvalType === 'PROCUREMENT' && a.status === 'PENDING'
  );
  const approval =
    existing ??
    (await db.approvals.create({
      approvalType: 'PROCUREMENT',
      entityId: mappedLotId,
      draftPayload: { procurement, dispatch, source: 'intake' },
      operatorId: '',
      status: 'PENDING',
      notes: `Intake run on ${catchLog.vesselName} (${catchLog.id}).`,
    }));

  return {
    catchLog,
    dispatch,
    dockResult,
    persisted: true as const,
    lot,
    score,
    procurement,
    topMatch,
    accfbDelivery,
    overflowDraft,
    approval,
  };
}

/**
 * Resolve an operator's decision on an intake-run approval.
 * On APPROVE: approval → APPROVED, lot → PROCUREMENT_CONFIRMED, and an ACCFB
 * shipment is scheduled. On REJECT: approval → REJECTED, lot stays SCORED.
 * All mutations are audited by the store.
 */
export async function decideIntake(
  approvalId: string,
  decision: 'APPROVE' | 'REJECT',
  operatorId: string,
  platform?: App.Platform,
  notes?: string
) {
  const db = getDb(platform);
  const approval = await db.approvals.findById(approvalId);
  if (!approval) throw new Error(`Approval ${approvalId} not found`);
  if (approval.status !== 'PENDING') return { approval, lot: null, shipment: null };

  if (decision === 'REJECT') {
    const rejected = await db.approvals.update(approvalId, {
      status: 'REJECTED',
      operatorId,
      resolvedAt: db.nowISO(),
      notes: notes ?? 'Rejected by operator.',
    });
    return { approval: rejected, lot: null, shipment: null };
  }

  const resolved = await db.approvals.update(approvalId, {
    status: 'APPROVED',
    operatorId,
    resolvedAt: db.nowISO(),
    notes: notes ?? 'Dispatch approved by operator — counter-offer within the 60%-of-market floor.',
  });

  const lot: SurplusLot = await db.lots.update(approval.entityId, {
    status: 'PROCUREMENT_CONFIRMED',
  });

  // Schedule the ACCFB shipment. Cases ≈ canned yield ÷ 24 cans/case — a rough
  // proxy so the shipment reads sensibly on the Logistics board; not audited pricing.
  const cases = Math.max(1, Math.round((lot.lbs * 0.88) / 0.55 / 24));
  const shipment = await db.shipments.create({
    lotId: lot.id,
    foodBankId: ACCFB_ID,
    cases,
    eta: '2026-07-19',
    status: 'SCHEDULED',
  });

  return { approval: resolved, lot, shipment };
}

export type { Approval };
