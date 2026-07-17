// intake.ts — Vessel → Pickup → Processing Intake Agent
// The advisor-priority segment: the gap between the fishing vessel and
// canning/processing intake. CV runs twice — on-vessel at harvest (drives
// the purchase/dispatch decision BEFORE the truck rolls) and dockside at
// transfer into barcoded reusable bins. Thermal cam does non-invasive
// surface temp profiling; QA flags anything outside the cold chain.
//
// Every output is a DRAFT with a reason. Agent recommends. You decide.

import type {
  VesselCatchLog,
  PickupDispatch,
  SortedContainer,
  DockIntakeResult,
} from '@tidelift/shared';

// Cold-chain thresholds (surface temp, °C). Fresh seafood should hold ≤ 4°C;
// anything above SAFE_MAX_C gets a QA FLAG and is held for operator review.
export const SAFE_MAX_TEMP_C = 4.0;

// Minimum on-vessel CV confidence to dispatch a truck without a manual
// pre-check. Below this we still recommend pickup but say why confidence is low.
const DISPATCH_CONFIDENCE_FLOOR = 0.7;

// Minimum lbs worth rolling a cold-transport unit for.
const MIN_PICKUP_LBS = 500;

const CONTAINER_CAPACITY_LBS = 400; // reusable easy-clean bulk bin

/**
 * Decides whether to dispatch cold transport for a logged catch — using the
 * on-vessel CV metrics, so the purchase/segregation decision is made before
 * the truck arrives at the dock. Draft only; dispatcher confirms.
 */
export function evaluateCatchLog(log: VesselCatchLog): PickupDispatch {
  const { cvEstimate } = log;
  const lowConfidence = cvEstimate.confidence < DISPATCH_CONFIDENCE_FLOOR;
  const tooSmall = log.estimatedLbs < MIN_PICKUP_LBS;
  const recommend = !tooSmall;

  const reasonParts = [
    `On-vessel computer vision at harvest: ${cvEstimate.count} ${log.species} detected, ` +
      `avg ${cvEstimate.avgWeightLbs} lbs, grade ${cvEstimate.sizeGrade} ` +
      `(confidence ${(cvEstimate.confidence * 100).toFixed(0)}%).`,
    tooSmall
      ? `Below ${MIN_PICKUP_LBS} lbs minimum — hold for consolidation with another vessel.`
      : `${log.estimatedLbs.toLocaleString()} lbs clears the ${MIN_PICKUP_LBS} lbs pickup minimum.`,
    lowConfidence && !tooSmall
      ? `Computer-vision confidence below ${DISPATCH_CONFIDENCE_FLOOR * 100}% — verify count at dockside sort.`
      : '',
    recommend ? `Purchase/segregation plan set before truck arrival — no dock idle time.` : '',
  ].filter(Boolean);

  return {
    catchLogId: log.id,
    recommend,
    coldTransportUnit: recommend ? 'CT-04 (reefer, 2°C)' : 'none',
    arrivalEta: recommend ? log.pickupWindow : 'n/a',
    reason: reasonParts.join(' '),
  };
}

/**
 * Simulates the dockside sort: catch is transferred into barcoded reusable
 * containers, each with a thermal-cam surface temp reading and a QA verdict.
 * Deterministic per catch log (seeded by id) so the demo is repeatable.
 */
export function sortAtDock(log: VesselCatchLog): DockIntakeResult {
  const containerCount = Math.max(1, Math.ceil(log.estimatedLbs / CONTAINER_CAPACITY_LBS));
  const containers: SortedContainer[] = [];

  // Simple deterministic pseudo-random from the log id — repeatable demo.
  let seed = [...log.id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let remaining = log.estimatedLbs;
  for (let i = 0; i < containerCount; i++) {
    const lbs = Math.min(CONTAINER_CAPACITY_LBS, remaining);
    remaining -= lbs;

    // Surface temp: mostly in cold-chain range, occasionally drifting warm.
    const tempC = Math.round((1.5 + next() * 3.5) * 10) / 10; // 1.5–5.0 °C
    const flagged = tempC > SAFE_MAX_TEMP_C;

    containers.push({
      containerId: `BIN-${log.id.toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
      catchLogId: log.id,
      species: log.species,
      sizeGrade: log.cvEstimate.sizeGrade,
      lbs,
      tempC,
      qaStatus: flagged ? 'FLAG' : 'PASS',
      reason: flagged
        ? `Thermal cam read ${tempC}°C > ${SAFE_MAX_TEMP_C}°C cold-chain max — hold bin for operator inspection before processing.`
        : `Thermal cam read ${tempC}°C, within cold chain. Computer-vision species/size match vs on-vessel log. Cleared for processing intake.`,
    });
  }

  const flaggedCount = containers.filter((c) => c.qaStatus === 'FLAG').length;
  const totalLbsAccepted = containers
    .filter((c) => c.qaStatus === 'PASS')
    .reduce((s, c) => s + c.lbs, 0);

  return {
    catchLogId: log.id,
    vesselName: log.vesselName,
    containers,
    totalLbsAccepted,
    flaggedCount,
    summary:
      `${log.vesselName}: ${containers.length} barcoded bins sorted dockside. ` +
      `${totalLbsAccepted.toLocaleString()} lbs cleared for processing, ` +
      `${flaggedCount} bin(s) flagged for operator review. ` +
      `Dockside computer vision verified against on-vessel log. Agent recommends. You decide.`,
  };
}

/** Mock vessel catch logs — replace with real vessel/harbor feed */
export const mockCatchLogs: VesselCatchLog[] = [
  {
    id: 'vcl-001',
    vesselName: 'F/V Morning Star',
    vesselType: 'wild-catch',
    species: 'salmon',
    estimatedLbs: 2100,
    cvEstimate: { count: 310, avgWeightLbs: 6.8, sizeGrade: 'L', confidence: 0.93 },
    location: 'Bodega Bay Harbor, CA',
    loggedAt: '2026-07-16T05:40:00Z',
    pickupWindow: '2026-07-16 09:00-11:00',
  },
  {
    id: 'vcl-002',
    vesselName: 'F/V Pacific Dawn',
    vesselType: 'wild-catch',
    species: 'sardine',
    estimatedLbs: 5600,
    cvEstimate: { count: 24800, avgWeightLbs: 0.22, sizeGrade: 'S', confidence: 0.88 },
    location: 'Monterey Harbor, CA',
    loggedAt: '2026-07-16T04:55:00Z',
    pickupWindow: '2026-07-16 08:00-10:00',
  },
  {
    id: 'vcl-003',
    vesselName: 'Blue Reef Aquafarm',
    vesselType: 'farm',
    species: 'oyster',
    estimatedLbs: 380,
    cvEstimate: { count: 3100, avgWeightLbs: 0.12, sizeGrade: 'M', confidence: 0.64 },
    location: 'Tomales Bay, CA',
    loggedAt: '2026-07-16T06:10:00Z',
    pickupWindow: '2026-07-16 13:00-15:00',
  },
];
