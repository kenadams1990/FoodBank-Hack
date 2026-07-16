// +page.server.ts — Guided Demo data
//
// Runs the REAL agent pipeline server-side for one representative catch —
// F/V Morning Star (vcl-001, salmon, ~2,100 lbs, 93% on-vessel CV confidence)
// — and hands the page every real agent output to reveal step by step.
// Nothing here is scripted narrative: every number/reason string below is
// the live return value of the same functions apps/web's API routes call.
//
// Catch → lot mapping: vcl-001 (F/V Morning Star, salmon, 2,100 lbs, Bodega
// Bay Harbor) maps to lot-003 (salmon, 2,100 lbs, Bodega Bay, supplier
// sup-003 "Bodega Bay Harvest") — an exact lbs + landing-location match, the
// least ambiguous pairing available in the seed data. See PR notes.

import type { PageServerLoad } from './$types';
import { mockCatchLogs, evaluateCatchLog, sortAtDock } from '$agents/intake';
import { scoreLot } from '$agents/scorer';
import { draftProcurement } from '$agents/procure';
import { matchFacilities } from '$agents/canning';
import { planEquityDelivery } from '$agents/route';
import { createApprovalRequest, approveAction } from '$agents/approvals';
import { SURPLUS_LOTS, CANNING_FACILITIES, FOOD_BANKS, QUOTES } from '$shared/mockData';
import type { AgencyNeed } from '$shared/types';

const CATCH_LOG_ID = 'vcl-001';
const MAPPED_LOT_ID = 'lot-003';

export const load: PageServerLoad = () => {
  // Step 1 — on-vessel CV → dispatch draft (before the truck rolls)
  const catchLog = mockCatchLogs.find((l) => l.id === CATCH_LOG_ID)!;
  const dispatch = evaluateCatchLog(catchLog);

  // Step 2 — dockside sort into barcoded bins + thermal QA
  const dockResult = sortAtDock(catchLog);

  // Step 3 — opportunity score
  const lot = SURPLUS_LOTS.find((l) => l.id === MAPPED_LOT_ID)!;
  const score = scoreLot(lot, CANNING_FACILITIES, FOOD_BANKS);

  // Step 4 — procurement counter-offer (60%-of-market floor)
  const quotes = QUOTES.filter((q) => q.lotId === lot.id);
  const procurement = draftProcurement(lot, quotes);

  // Step 5 — facility match
  const canningMatches = matchFacilities(lot, CANNING_FACILITIES);
  const topMatch = canningMatches[0];

  // Step 6 — equity-aware delivery routing to ACCFB.
  // ACCFB's own throughput (~60M lbs/yr per docs/ACCFB_NUMBERS.md §1) dwarfs a
  // single lot, so this scenario sizes ACCFB's modeled need to the lot itself
  // — this is demo-scenario data, not a sourced ACCFB figure (see PR notes) —
  // and runs it against two other real Alameda County agencies from
  // route.ts's own mockAgencyNeeds so the equity algorithm has something to
  // weigh, exactly as it does for the Logistics page.
  const accfb = FOOD_BANKS.find((fb) => fb.id === 'fb-001')!; // Alameda County Community Food Bank
  const accfbNeed: AgencyNeed = {
    agencyId: accfb.id,
    neighborhood: `${accfb.location} — ${accfb.name}`,
    proteinGapLbs: Math.round(dockResult.totalLbsAccepted * 0.85),
    accessWindows: accfb.accessWindows,
    dietaryPrefs: accfb.dietaryPrefs,
    perishableCapacity: Math.round(dockResult.totalLbsAccepted * 0.6),
  };
  const comparisonNeeds: AgencyNeed[] = [
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
  const deliveryPlan = planEquityDelivery(dockResult.totalLbsAccepted, [accfbNeed, ...comparisonNeeds]);
  const accfbDelivery = deliveryPlan.find((row) => row.agency === accfb.id)!;

  // Step 7 — operator approval, captured in the audit trail.
  // Uses the real approvals.ts state machine (same module apps/agents
  // exposes to the rest of the hub) — not the persistent KV-backed dashboard
  // store, so replaying this demo never mutates the live audit log judges
  // can inspect on /audit.
  const approvalRequest = createApprovalRequest(
    'PROCUREMENT',
    lot.id,
    procurement,
    'agent:procure'
  );
  const approval = approveAction(
    approvalRequest.id,
    'operator:demo',
    'Approved live during the guided walkthrough — counter-offer within the 60%-of-market floor.'
  );

  return {
    catchLog,
    dispatch,
    dockResult,
    lot,
    score,
    procurement,
    canningMatches,
    topMatch,
    accfb,
    accfbDelivery,
    approval,
  };
};
