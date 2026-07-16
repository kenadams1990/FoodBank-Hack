// mockData.ts — Offline demo data (Monterey / San Diego style)
// Wire this into the dashboard so the demo runs without a live fishery API.

export const MOCK_SURPLUS_EVENTS = [
  {
    id: 'evt-001',
    fisheryId: 'monterey-001',
    species: 'Albacore Tuna',
    lbs: 4200,
    landingAt: 'Monterey Bay Fisheries, CA',
    landingDate: '2026-07-18',
    marketPricePerLb: 1.85,
    proposedDiscountPct: 22,
  },
  {
    id: 'evt-002',
    fisheryId: 'san-diego-003',
    species: 'Pacific Sardine',
    lbs: 8900,
    landingAt: 'San Diego Fish Market, CA',
    landingDate: '2026-07-20',
    marketPricePerLb: 0.65,
    proposedDiscountPct: 30,
  },
  {
    id: 'evt-003',
    fisheryId: 'bodega-bay-005',
    species: 'Dungeness Crab (broken pieces)',
    lbs: 1100,
    landingAt: 'Bodega Bay Harbor, CA',
    landingDate: '2026-07-19',
    marketPricePerLb: 3.20,
    proposedDiscountPct: 40,
  },
];
