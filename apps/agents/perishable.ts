// perishable.ts — Perishable Rescue & Redistribution Agent
//
// Surfaces surplus lots that are expiring imminently, matches them to cold-
// capable partner agencies within their access windows, and drafts cold-
// transport assignments. Reuses planEquityDelivery() from route.ts — the
// equity scoring weights are not duplicated or overridden here.
//
// Every output is a DRAFT. Nothing executes automatically.
// "Agent recommends. You decide." (human-in-the-loop product rule.)

import type { SurplusLot, AgencyNeed, DeliveryPlanRow } from '@tidelift/shared';
import type { PerishableRescueDraft, ColdTransportAssignment } from '@tidelift/shared';
import { planEquityDelivery } from './route.js';

// ---------------------------------------------------------------------------
// Constants — documented defaults, not tuned against real ACCFB data.
// ---------------------------------------------------------------------------

/** Default urgency horizon: lots expiring within this many hours are "urgent". */
export const DEFAULT_HOURS_THRESHOLD = 72;

/** Reefer unit labels used in assignment strings — mirrors intake.ts convention. */
const COLD_TRANSPORT_LABELS = [
  'CT-01 (reefer, 2°C)',
  'CT-02 (reefer, 2°C)',
  'CT-03 (reefer, 3°C)',
  'CT-04 (reefer, 2°C)',
  'CT-05 (reefer, 3°C)',
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function hoursUntil(isoDate: string, now: Date): number {
  return (new Date(isoDate).getTime() - now.getTime()) / 3_600_000;
}

/**
 * Returns true if the agency has a cold-storage window still open.
 * If coldStorageAvailableUntil is absent we assume the window is open
 * (conservative: don't drop an agency just because the field is missing).
 */
function agencyWindowOpen(need: AgencyNeed, now: Date): boolean {
  if (!need.coldStorageAvailableUntil) return true;
  return new Date(need.coldStorageAvailableUntil).getTime() > now.getTime();
}

/**
 * Suggest a pickup window string from the agency's first access window
 * and the lot's expiry — whichever is tighter.
 */
function suggestPickupWindow(need: AgencyNeed, expiresAt: string): string {
  const window = need.accessWindows[0] ?? 'unscheduled';
  return `${window} (before ${expiresAt.split('T')[0]})`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Drafts a perishable rescue & redistribution plan:
 *
 * 1. Finds AVAILABLE lots expiring within `hoursUntilExpiry` hours.
 * 2. Finds AgencyNeed entries with perishableCapacity > 0 whose cold-storage
 *    window is still open.
 * 3. Calls planEquityDelivery() with the urgent lbs + capable agencies —
 *    reuses equity scoring (gap 0.5, perishability 0.3, window tightness 0.2)
 *    without duplicating or overriding it.
 * 4. Assigns cold-transport units greedily, most-urgent lot first, capped at
 *    availableColdTransportUnits.
 * 5. Reports unroutableLbs: lbs with no cold-capable agency in window.
 *
 * Returns a PerishableRescueDraft — always a draft, never an execution.
 */
export function draftPerishableRescue(
  lots: SurplusLot[],
  needs: AgencyNeed[],
  availableColdTransportUnits: number = 3,
  hoursUntilExpiry: number = DEFAULT_HOURS_THRESHOLD,
  _now: Date = new Date()
): PerishableRescueDraft {
  const now = _now;

  // ── Step 1: urgent lots ──────────────────────────────────────────────────
  const urgentLots = lots
    .filter((l) => l.status === 'AVAILABLE')
    .map((l) => ({
      lot: l,
      hoursRemaining: hoursUntil(l.expiryDate, now),
    }))
    .filter(({ hoursRemaining }) => hoursRemaining > 0 && hoursRemaining <= hoursUntilExpiry)
    .sort((a, b) => a.hoursRemaining - b.hoursRemaining);

  const urgentLotSummaries = urgentLots.map(({ lot, hoursRemaining }) => ({
    lotId: lot.id,
    species: lot.species,
    lbs: lot.lbs,
    expiresAt: lot.expiryDate,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
  }));

  const totalUrgentLbs = urgentLots.reduce((s, { lot }) => s + lot.lbs, 0);

  // ── Step 2: cold-capable agencies ────────────────────────────────────────
  const capableNeeds = needs.filter(
    (n) => (n.perishableCapacity ?? 0) > 0 && agencyWindowOpen(n, now)
  );

  const totalCapacityLbs = capableNeeds.reduce(
    (s, n) => s + (n.perishableCapacity ?? 0),
    0
  );

  // ── Step 3: equity-scored delivery rows ──────────────────────────────────
  let deliveryRows: DeliveryPlanRow[] = [];
  if (capableNeeds.length > 0 && totalUrgentLbs > 0) {
    deliveryRows = planEquityDelivery(totalUrgentLbs, capableNeeds);
  }

  // ── Step 4: cold-transport assignments ───────────────────────────────────
  const assignments: ColdTransportAssignment[] = [];
  let unitsUsed = 0;

  for (const { lot } of urgentLots) {
    if (unitsUsed >= availableColdTransportUnits) break;

    // Find the delivery row whose agency has remaining capacity
    const matchedRow = deliveryRows.find((row) => {
      const need = capableNeeds.find((n) => n.agencyId === row.agency);
      return need && (need.perishableCapacity ?? 0) >= lot.lbs;
    });

    if (!matchedRow) continue;

    const matchedNeed = capableNeeds.find((n) => n.agencyId === matchedRow.agency)!;
    const unitLabel = COLD_TRANSPORT_LABELS[unitsUsed] ?? `CT-0${unitsUsed + 1} (reefer)`;

    assignments.push({
      lotId: lot.id,
      coldTransportUnit: unitLabel,
      assignedAgencyId: matchedRow.agency,
      pickupWindowSuggestion: suggestPickupWindow(matchedNeed, lot.expiryDate),
    });

    unitsUsed++;
  }

  // ── Step 5: unroutable lbs ───────────────────────────────────────────────
  const routedLotIds = new Set(assignments.map((a) => a.lotId));
  const unroutableLbs = urgentLots
    .filter(({ lot }) => !routedLotIds.has(lot.id))
    .reduce((s, { lot }) => s + lot.lbs, 0);

  // ── Build reason ─────────────────────────────────────────────────────────
  const reason =
    urgentLots.length === 0
      ? 'No lots are expiring within the urgency horizon — no action required.'
      : capableNeeds.length === 0
        ? `${urgentLots.length} lot(s) expiring within ${hoursUntilExpiry}h but no cold-capable agency has an open window. Manual dispatch required.`
        : `${urgentLots.length} lot(s) totalling ${totalUrgentLbs.toLocaleString()} lbs expiring within ${hoursUntilExpiry}h. ` +
          `${capableNeeds.length} cold-capable agenc${capableNeeds.length === 1 ? 'y' : 'ies'} with ${totalCapacityLbs.toLocaleString()} lbs combined cold capacity. ` +
          `${assignments.length} cold-transport unit${assignments.length === 1 ? '' : 's'} assigned. ` +
          (unroutableLbs > 0
            ? `${unroutableLbs.toLocaleString()} lbs unroutable — flag for manual dispatch.`
            : 'All urgent lbs routed.') +
          ' Agent recommends. You decide.';

  return {
    generatedAt: now.toISOString(),
    urgentLots: urgentLotSummaries,
    deliveryRows,
    coldTransportAssignments: assignments,
    unroutableLbs,
    reason,
  };
}
