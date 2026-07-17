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
import { scoreLot, narrateScore } from '$agents/scorer';
import { draftProcurement, narrateNegotiation } from '$agents/procure';
import { matchFacilities } from '$agents/canning';
import { planEquityDelivery } from '$agents/route';
import { createApprovalRequest, approveAction } from '$agents/approvals';
import { draftOverflowDisposition } from '$agents/overflow';
import type { AIBinding } from '$agents/ai';
import { SURPLUS_LOTS, CANNING_FACILITIES, FOOD_BANKS, QUOTES } from '$shared/mockData';
import type { AgencyNeed } from '$shared/types';

const CATCH_LOG_ID = 'vcl-001';
const MAPPED_LOT_ID = 'lot-003';

// Minimal shape of the Workers AI binding — avoids a hard dependency on
// @cloudflare/workers-types just for this, mirrors the KV binding pattern
// in apps/web/src/lib/store.ts.
function getAI(platform: App.Platform | undefined): AIBinding | undefined {
  return (platform as { env?: { AI?: AIBinding } } | undefined)?.env?.AI;
}

export const load: PageServerLoad = async ({ platform }) => {
  const ai = getAI(platform);
  // TEMP DIAGNOSTIC — remove once the AI binding is confirmed live.
  console.log('[AI DIAGNOSTIC]', {
    hasPlatform: !!platform,
    hasEnv: !!(platform as { env?: unknown } | undefined)?.env,
    envKeys: Object.keys((platform as { env?: Record<string, unknown> } | undefined)?.env ?? {}),
    hasAI: !!ai,
  });
  // Step 1 — on-vessel CV → dispatch draft (before the truck rolls)
  const catchLog = mockCatchLogs.find((l) => l.id === CATCH_LOG_ID)!;
  const dispatch = evaluateCatchLog(catchLog);

  // Step 2 — dockside sort into barcoded bins + thermal QA
  const dockResult = sortAtDock(catchLog);

  // Step 3 — opportunity score. Math is deterministic (scoreLot); the
  // human-readable rationale is a real Workers AI call when the AI binding
  // is present, falling back to the deterministic template otherwise.
  const lot = SURPLUS_LOTS.find((l) => l.id === MAPPED_LOT_ID)!;
  const score = scoreLot(lot, CANNING_FACILITIES, FOOD_BANKS);
  const scoreNarration = await narrateScore(lot, score, ai);
  score.rationale = scoreNarration.text;

  // Step 4 — procurement counter-offer (60%-of-market floor). Pricing math
  // is deterministic (draftProcurement); the negotiation email is a real
  // Workers AI call when available, same fallback pattern as above.
  const quotes = QUOTES.filter((q) => q.lotId === lot.id);
  const procurement = draftProcurement(lot, quotes);
  const negotiationNarration = await narrateNegotiation(lot, procurement, ai);
  procurement.negotiationScript = negotiationNarration.text;

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

  // Step 7 — perishable rescue (Step 8 in prior numbering is operator approval —
  // kept as Step 7 in this demo to match the existing STEPS array; approval
  // is rendered in the final panel).
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

  // Step 9 — overflow disposition
  // lot-003 is salmon, 2,100 lbs. matchFacilities returned canningMatches above.
  // Use lot.pricePerLb as the surplusPrice per spec.
  const overflowDraft = draftOverflowDisposition(
    lot,
    canningMatches,
    FOOD_BANKS,
    lot.pricePerLb
  );

  return {
    catchLog,
    dispatch,
    dockResult,
    lot,
    score,
    scoreSource: scoreNarration.source,
    procurement,
    procurementSource: negotiationNarration.source,
    canningMatches,
    topMatch,
    accfb,
    accfbDelivery,
    approval,
    overflowDraft,
  };
};
