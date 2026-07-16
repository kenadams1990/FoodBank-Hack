// route.ts — Equity-Aware Routing Agent
// Theme 4: "Equity With a Truck Attached." Route on access windows and product
// urgency, not just miles. Balance driver workload on stop difficulty, not stop
// count. Rebuild the day in minutes when a truck goes down or an agency cancels.
// The win: perishables never sit behind shelf-stable because the algorithm only
// understood distance.
//
// Every row is a DRAFT recommendation, never an execution — "Agent recommends.
// You decide." (human-in-the-loop is a product rule, see reason on every row).

import type { AgencyNeed, DeliveryPlanRow } from '../../packages/shared/src/types';

// ---------------------------------------------------------------------------
// Urgency scoring
//
// urgencyScore blends three normalized (0..1) signals so an agency can win on
// urgency without having the single largest protein gap:
//   0.5  gapFactor          — proteinGapLbs normalized against the largest gap
//                              in this batch (biggest need scores highest)
//   0.3  perishabilityFactor — 1 if the agency has cold-storage capacity (i.e.
//                              can receive perishables, which are time-critical
//                              and spoil if they wait behind shelf-stable
//                              product), else 0
//   0.2  windowTightness     — 1 / number of access windows. An agency with a
//                              single narrow window ("Tue 10-2") is harder to
//                              hit and more urgent to schedule correctly than
//                              one with several wide windows.
//
// Weights are a deliberate, documented default (gap is the dominant signal,
// perishability outweighs window tightness) — not tuned against real ACCFB
// data. If real intake data becomes available, re-derive these weights rather
// than assuming they're load-bearing as-is.
// ---------------------------------------------------------------------------
const WEIGHT_GAP = 0.5;
const WEIGHT_PERISHABILITY = 0.3;
const WEIGHT_WINDOW_TIGHTNESS = 0.2;

// Threshold above which a perishable-capable agency is flagged perishablePriority.
// Documented default: an agency needs both cold capacity AND urgency at/above
// the midpoint of the 0..1 score range to jump the shelf-stable queue.
const PERISHABLE_PRIORITY_THRESHOLD = 0.5;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

type ScoredNeed = {
  need: AgencyNeed;
  gapFactor: number;
  perishabilityFactor: number;
  windowTightness: number;
  urgencyScore: number;
};

function scoreNeeds(needs: AgencyNeed[]): ScoredNeed[] {
  const maxGap = Math.max(...needs.map((n) => n.proteinGapLbs), 1);

  return needs.map((need) => {
    const gapFactor = need.proteinGapLbs / maxGap;
    const perishabilityFactor = (need.perishableCapacity ?? 0) > 0 ? 1 : 0;
    const windowTightness = 1 / Math.max(need.accessWindows.length, 1);
    const urgencyScore = round3(
      WEIGHT_GAP * gapFactor +
        WEIGHT_PERISHABILITY * perishabilityFactor +
        WEIGHT_WINDOW_TIGHTNESS * windowTightness
    );
    return { need, gapFactor, perishabilityFactor, windowTightness, urgencyScore };
  });
}

/** Difficulty-aware driver load note — NOT a stop count. */
function buildDriverLoadNote(need: AgencyNeed): string {
  const factors: string[] = [];

  if (need.accessWindows.length === 1) {
    factors.push('single narrow access window — schedule precisely');
  }
  if (need.dietaryPrefs.length >= 2) {
    factors.push(`multiple dietary constraints (${need.dietaryPrefs.join(', ')})`);
  }
  if ((need.perishableCapacity ?? 0) > 0) {
    factors.push('cold-chain handling required');
  }

  if (factors.length === 0) {
    return 'Standard difficulty: wide window, shelf-stable, no special handling.';
  }
  return `Higher difficulty stop: ${factors.join('; ')}.`;
}

function buildReason(s: ScoredNeed, allocatedLbs: number, perishablePriority: boolean): string {
  const { need, gapFactor, perishabilityFactor, windowTightness, urgencyScore } = s;
  const priorityNote = perishablePriority
    ? ' Prioritized ahead of shelf-stable allocations because perishables can\'t sit.'
    : '';
  return (
    `Urgency ${urgencyScore.toFixed(2)} = 0.5×gap(${gapFactor.toFixed(2)}) + ` +
    `0.3×perishability(${perishabilityFactor}) + 0.2×window-tightness(${windowTightness.toFixed(2)}). ` +
    `Allocated ${allocatedLbs} of ${need.proteinGapLbs} lbs protein gap for ${need.neighborhood}.` +
    priorityNote
  );
}

/**
 * Allocates available lbs of protein to agencies by a blended urgency score
 * (protein gap, perishability, access-window tightness) — not by miles or
 * raw need alone. Greedy: most urgent agency first, capped at availableLbs.
 * Draft only — see `reason` on every row (human-in-the-loop).
 */
export function planEquityDelivery(
  availableLbs: number,
  needs: AgencyNeed[]
): DeliveryPlanRow[] {
  const scored = scoreNeeds(needs).sort((a, b) => b.urgencyScore - a.urgencyScore);

  const rows: DeliveryPlanRow[] = [];
  let remaining = availableLbs;

  for (const s of scored) {
    if (remaining <= 0) break;

    const allocatedLbs = Math.min(s.need.proteinGapLbs, remaining);
    remaining -= allocatedLbs;

    const perishablePriority =
      s.perishabilityFactor > 0 && s.urgencyScore >= PERISHABLE_PRIORITY_THRESHOLD;

    rows.push({
      agency: s.need.agencyId,
      neighborhood: s.need.neighborhood,
      accessWindow: s.need.accessWindows[0] ?? 'unscheduled',
      urgencyScore: s.urgencyScore,
      allocatedLbs,
      perishablePriority,
      driverLoadNote: buildDriverLoadNote(s.need),
      reason: buildReason(s, allocatedLbs, perishablePriority),
    });
  }

  return rows;
}

/**
 * Rebuilds the day's plan in one call when a truck goes down or an agency
 * cancels — excludes the dropped agency and reallocates availableLbs across
 * the rest by the same urgency scoring.
 */
export function replanAfterDrop(
  needs: AgencyNeed[],
  availableLbs: number,
  droppedAgencyId: string
): DeliveryPlanRow[] {
  const remainingNeeds = needs.filter((n) => n.agencyId !== droppedAgencyId);
  return planEquityDelivery(availableLbs, remainingNeeds);
}

/** Mock agency needs — replace with real food bank intake data */
export const mockAgencyNeeds: AgencyNeed[] = [
  {
    agencyId: 'foodbank-oak-007',
    neighborhood: 'East Oakland',
    proteinGapLbs: 1200,
    accessWindows: ['Mon 9-12', 'Wed 9-12', 'Fri 9-12'],
    dietaryPrefs: ['halal', 'low-sodium'],
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
  {
    agencyId: 'foodbank-hay-021',
    neighborhood: 'Hayward',
    proteinGapLbs: 950,
    accessWindows: ['Mon 8-11', 'Thu 8-11'],
    dietaryPrefs: ['halal'],
    perishableCapacity: 400,
  },
  {
    agencyId: 'pantry-nwk-009',
    neighborhood: 'Newark',
    proteinGapLbs: 300,
    accessWindows: ['Fri 10-4'],
    dietaryPrefs: [],
  },
  {
    agencyId: 'foodbank-wo-018',
    neighborhood: 'West Oakland',
    proteinGapLbs: 700,
    accessWindows: ['Tue 9-11'],
    dietaryPrefs: ['culturally-specific', 'no-shellfish', 'low-sodium'],
    perishableCapacity: 150,
  },
];
