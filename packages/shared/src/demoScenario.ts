// demoScenario.ts — Canonical end-to-end demo scenario
// Lot appears → scored → procurement approved → facility booked → delivery released → shipped

export const DEMO_SCENARIO = {
  title: 'Salmon Surplus — Bodega Bay to East Bay',
  description:
    'A 2,100 lb wild salmon surplus from Bodega Bay Harbor Co-op is scored, negotiated, ' +
    'sent to Bay Area Cannery, and delivered to Alameda County Community Food Bank.',
  lotId: 'lot-003',
  steps: [
    {
      step: 1,
      label: 'Surplus Detected',
      description: 'lot-003: 2,100 lbs wild salmon listed at $2.10/lb (40% off market $3.50/lb).',
      entity: 'SurplusLot',
      entityId: 'lot-003',
    },
    {
      step: 2,
      label: 'Agent Scores',
      description: 'Opportunity scorer returns 91/100 — strong discount, 6-day window, high demand match.',
      entity: 'OpportunityScore',
      entityId: 'lot-003',
    },
    {
      step: 3,
      label: 'Procurement Draft Created',
      description: 'Agent drafts counter-offer: $2.10/lb, MOQ 1,260 lbs. Approval request created — PENDING.',
      entity: 'Approval',
      entityId: 'apr-004',
    },
    {
      step: 4,
      label: 'Operator Approves Procurement',
      description: 'Operator-ken reviews and approves. Lot status → PROCUREMENT_CONFIRMED.',
      entity: 'Approval',
      entityId: 'apr-004',
      requiresHuman: true,
    },
    {
      step: 5,
      label: 'Facility Matched',
      description: 'Bay Area Cannery (Richmond, CA) selected: 92/100 match. Est. 158 cases in 1 day.',
      entity: 'CanningFacility',
      entityId: 'fac-001',
    },
    {
      step: 6,
      label: 'Operator Books Facility',
      description: 'Operator approves facility booking. Production scheduled for 2026-07-18.',
      entity: 'Approval',
      requiresHuman: true,
    },
    {
      step: 7,
      label: 'Delivery Plan Drafted',
      description: 'Agent assigns 96 cases to Alameda County Food Bank, 62 cases to SF-Marin.',
      entity: 'ShipmentDraft',
      entityId: 'lot-003',
    },
    {
      step: 8,
      label: 'Operator Releases Delivery',
      description: 'Operator approves delivery release. Shipments confirmed.',
      entity: 'Approval',
      requiresHuman: true,
    },
    {
      step: 9,
      label: 'Impact Logged',
      description: '2,100 lbs rescued • 3,780 cans • $2,940 cost avoided • 3,780 meals estimated.',
      entity: 'ImpactMetrics',
    },
  ],
};
