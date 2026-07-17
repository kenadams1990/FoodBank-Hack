// +page.server.ts — Dashboard data, read from the live store (KV-backed, or
// the in-memory fallback in dev). Reflects real state: running an intake and
// approving it advances a lot into the "recovered" tally and drops it out of
// "available surplus", and every agent/operator action shows in the activity
// feed straight from the audit log.

import type { PageServerLoad } from './$types';
import { getDb } from '$lib/store';
import type { AuditEvent, LotStatus } from '$shared/types';

// Statuses that count as "recovered" — a lot that has cleared operator approval
// and is on its way to (or already at) a food bank. Matches impactMetrics.ts.
const RECOVERED_STATUSES: LotStatus[] = [
  'PROCUREMENT_CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED',
];
const AWAITING_STATUSES: LotStatus[] = ['AVAILABLE', 'SCORED'];

// meals = lbs ÷ 1.2 — Feeding America's "1.2 lbs = 1 meal" basis, the same
// constant the guided demo and hero band use.
const LBS_PER_MEAL = 1.2;

const ACTION_LABEL: Record<string, string> = {
  SCORED: 'Scored lot',
  APPROVAL_CREATED: 'Draft awaiting approval',
  APPROVED: 'Operator approved',
  REJECTED: 'Operator rejected',
  CREATED: 'Shipment scheduled',
  UPDATED: 'Lot updated',
  STATUS_CHANGED: 'Status changed',
  PROCUREMENT: 'Procurement approved',
};

function toActivity(e: AuditEvent) {
  const after = e.afterState as { score?: number } | null;
  return {
    time: e.timestamp.slice(11, 16), // HH:MM from ISO
    action: ACTION_LABEL[e.action] ?? e.action,
    detail: `${e.entityType.toLowerCase()} · ${e.entityId}`,
    score: typeof after?.score === 'number' ? after.score : null,
  };
}

export const load: PageServerLoad = async ({ platform }) => {
  const db = getDb(platform);
  const lots = await db.lots.findAll();
  const { events } = await db.audit.findAll(1, 6);

  const recoveredLbs = lots
    .filter((l) => RECOVERED_STATUSES.includes(l.status))
    .reduce((s, l) => s + l.lbs, 0);
  const availableLots = lots.filter((l) => AWAITING_STATUSES.includes(l.status));
  const availableLbs = availableLots.reduce((s, l) => s + l.lbs, 0);

  return {
    availableLots,
    availableLbs,
    recoveredLbs,
    meals: Math.round(recoveredLbs / LBS_PER_MEAL),
    activity: events.map(toActivity),
  };
};
