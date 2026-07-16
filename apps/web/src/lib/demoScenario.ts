// demoScenario.ts — One canonical end-to-end demo scenario
// lot-001 salmon: scored → procurement approved → facility booked → delivered to Oakland

import type { Approval, AuditEvent } from '../../../../packages/shared/src/types';

export const DEMO_LOT_ID = 'lot-001';

export const MOCK_AUDIT_SEED: AuditEvent[] = [];

export const DEMO_STEPS = [
  {
    id: 1,
    label: 'Surplus Detected',
    description: 'Agent detects lot-001: 4,800 lbs Pink Salmon from Monterey Bay Fisheries at 20% discount.',
    icon: '🐟',
    agentAction: 'forecast:evaluateSurplus',
  },
  {
    id: 2,
    label: 'Opportunity Scored',
    description: 'Scorer rates lot-001 at 72/100 — strong discount, 5-day expiry window, Bay Area facility available.',
    icon: '📊',
    agentAction: 'scorer:scoreLot',
  },
  {
    id: 3,
    label: 'Procurement Draft Ready',
    description: 'Agent drafts counter-offer at $1.38/lb (bulk non-profit rate). Awaiting operator approval.',
    icon: '💰',
    agentAction: 'procure:draftProcurement',
    requiresApproval: true,
    approvalType: 'PROCUREMENT',
  },
  {
    id: 4,
    label: 'Facility Match Ready',
    description: 'Bay Area Cannery Co-Pack matched: 5,000 lbs capacity on July 18 — est. 7,603 cans.',
    icon: '🏭',
    agentAction: 'canning:matchFacilities',
    requiresApproval: true,
    approvalType: 'FACILITY_BOOKING',
  },
  {
    id: 5,
    label: 'Delivery Plan Ready',
    description: 'Route agent assigns: LA Food Bank (3,400 cases), SF-Marin (900 cases), Oregon Food Bank (1,800 cases).',
    icon: '🚚',
    agentAction: 'route:planDelivery',
    requiresApproval: true,
    approvalType: 'DELIVERY_RELEASE',
  },
  {
    id: 6,
    label: 'Impact Calculated',
    description: 'Food rescued: 4,800 lbs. Cans produced: 7,603. Meals: 7,603. Cost avoided: $2,016 vs retail.',
    icon: '📈',
    agentAction: 'metrics:calcImpact',
  },
];
