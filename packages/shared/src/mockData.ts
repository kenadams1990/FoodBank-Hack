// mockData.ts — TideLift demo seed data
// Realistic Pacific Coast scenario: 5 suppliers, 8 lots, 3 facilities, 6 food banks

import type {
  Supplier, SurplusLot, CanningFacility, FoodBank, Quote, AuditEvent,
  FoodBankInventory, DistributionEvent
} from './types';

// ── Suppliers ───────────────────────────────────────────────────────────────────────

export const SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Monterey Bay Fisheries',
    contact: 'Rosa Delgado',
    email: 'rosa@montereybay.fish',
    phone: '831-555-0101',
    location: 'Monterey, CA',
    species: ['salmon', 'halibut', 'sardine'],
    certifications: ['MSC', 'SQF'],
    avgCapacityLbsPerWeek: 12000,
  },
  {
    id: 'sup-002',
    name: 'San Diego Commercial Fishing Co.',
    contact: 'Marco Vega',
    email: 'marco@sdfish.com',
    phone: '619-555-0202',
    location: 'San Diego, CA',
    species: ['sardine', 'tuna'],
    certifications: ['HACCP'],
    avgCapacityLbsPerWeek: 20000,
  },
  {
    id: 'sup-003',
    name: 'Bodega Bay Harvest',
    contact: 'Lena Okoro',
    email: 'lena@bodegaharvest.net',
    phone: '707-555-0303',
    location: 'Bodega Bay, CA',
    species: ['salmon', 'crab'],
    certifications: ['MSC', 'HACCP'],
    avgCapacityLbsPerWeek: 6000,
  },
  {
    id: 'sup-004',
    name: 'Humboldt Seafood Group',
    contact: 'Dan Reyes',
    email: 'dan@humboldtseafood.com',
    phone: '707-555-0404',
    location: 'Eureka, CA',
    species: ['halibut', 'salmon'],
    certifications: ['MSC'],
    avgCapacityLbsPerWeek: 9000,
  },
  {
    id: 'sup-005',
    name: 'Pacific Rim Seafoods',
    contact: 'Amy Chen',
    email: 'amy@pacificrimseafoods.com',
    phone: '360-555-0505',
    location: 'Bellingham, WA',
    species: ['salmon', 'halibut'],
    certifications: ['MSC', 'BRC'],
    avgCapacityLbsPerWeek: 15000,
  },
];

// ── Surplus Lots ──────────────────────────────────────────────────────────────────────────

export const SURPLUS_LOTS: SurplusLot[] = [
  {
    id: 'lot-001',
    supplierId: 'sup-001',
    species: 'salmon',
    lbs: 4800,
    harvestDate: '2026-07-14',
    expiryDate: '2026-07-19',
    pricePerLb: 1.44,
    marketPricePerLb: 1.80,
    proposedDiscountPct: 20,
    landingLocation: 'Monterey, CA',
    status: 'AVAILABLE',
    notes: 'Pink salmon, fresh off boat, excellent color',
  },
  {
    id: 'lot-002',
    supplierId: 'sup-002',
    species: 'sardine',
    lbs: 9200,
    harvestDate: '2026-07-15',
    expiryDate: '2026-07-20',
    pricePerLb: 0.46,
    marketPricePerLb: 0.65,
    proposedDiscountPct: 30,
    landingLocation: 'San Diego, CA',
    status: 'AVAILABLE',
  },
  {
    id: 'lot-003',
    supplierId: 'sup-003',
    species: 'salmon',
    lbs: 2100,
    harvestDate: '2026-07-13',
    expiryDate: '2026-07-17',
    pricePerLb: 1.60,
    marketPricePerLb: 2.00,
    proposedDiscountPct: 20,
    landingLocation: 'Bodega Bay, CA',
    status: 'AVAILABLE',
    notes: 'Urgent — 2 days to expiry',
  },
  {
    id: 'lot-004',
    supplierId: 'sup-004',
    species: 'halibut',
    lbs: 3300,
    harvestDate: '2026-07-14',
    expiryDate: '2026-07-21',
    pricePerLb: 2.10,
    marketPricePerLb: 3.00,
    proposedDiscountPct: 30,
    landingLocation: 'Eureka, CA',
    status: 'AVAILABLE',
  },
  {
    id: 'lot-005',
    supplierId: 'sup-005',
    species: 'salmon',
    lbs: 7500,
    harvestDate: '2026-07-15',
    expiryDate: '2026-07-22',
    pricePerLb: 1.50,
    marketPricePerLb: 1.90,
    proposedDiscountPct: 21,
    landingLocation: 'Bellingham, WA',
    status: 'SCORED',
    score: 78,
  },
  {
    id: 'lot-006',
    supplierId: 'sup-001',
    species: 'sardine',
    lbs: 5600,
    harvestDate: '2026-07-12',
    expiryDate: '2026-07-18',
    pricePerLb: 0.42,
    marketPricePerLb: 0.65,
    proposedDiscountPct: 35,
    landingLocation: 'Monterey, CA',
    status: 'PROCUREMENT_CONFIRMED',
    score: 88,
  },
  {
    id: 'lot-007',
    supplierId: 'sup-002',
    species: 'tuna',
    lbs: 4100,
    harvestDate: '2026-07-10',
    expiryDate: '2026-07-16',
    pricePerLb: 1.30,
    marketPricePerLb: 1.85,
    proposedDiscountPct: 30,
    landingLocation: 'San Diego, CA',
    status: 'IN_PRODUCTION',
    score: 91,
  },
  {
    id: 'lot-008',
    supplierId: 'sup-003',
    species: 'halibut',
    lbs: 1800,
    harvestDate: '2026-07-08',
    expiryDate: '2026-07-15',
    pricePerLb: 2.25,
    marketPricePerLb: 3.00,
    proposedDiscountPct: 25,
    landingLocation: 'Bodega Bay, CA',
    status: 'DELIVERED',
    score: 74,
  },
];

// ── Canning Facilities ──────────────────────────────────────────────────────────────────────────

export const CANNING_FACILITIES: CanningFacility[] = [
  {
    id: 'fac-001',
    name: 'Bay Area Cannery Co-Pack',
    location: 'Richmond, CA',
    capacityCasesPerDay: 600,
    compatibleSpecies: ['salmon', 'sardine', 'tuna', 'halibut'],
    certifications: ['SQF Level 2', 'HACCP', 'FDA Registered'],
    costPerCan: 0.38,
    availableSlots: [
      { date: '2026-07-18', capacityLbs: 5000 },
      { date: '2026-07-19', capacityLbs: 5000 },
      { date: '2026-07-22', capacityLbs: 4000 },
    ],
  },
  {
    id: 'fac-002',
    name: 'Central Valley Seafood Pack',
    location: 'Fresno, CA',
    capacityCasesPerDay: 400,
    compatibleSpecies: ['sardine', 'tuna', 'salmon'],
    certifications: ['HACCP', 'Kosher'],
    costPerCan: 0.32,
    availableSlots: [
      { date: '2026-07-20', capacityLbs: 3500 },
      { date: '2026-07-21', capacityLbs: 3500 },
    ],
  },
  {
    id: 'fac-003',
    name: 'Pacific Northwest Cannery',
    location: 'Astoria, OR',
    capacityCasesPerDay: 800,
    compatibleSpecies: ['salmon', 'halibut', 'crab'],
    certifications: ['MSC Chain of Custody', 'SQF Level 3', 'HACCP'],
    costPerCan: 0.44,
    availableSlots: [
      { date: '2026-07-17', capacityLbs: 7000 },
      { date: '2026-07-18', capacityLbs: 7000 },
      { date: '2026-07-24', capacityLbs: 6000 },
    ],
  },
];

// ── Food Banks ───────────────────────────────────────────────────────────────────────────────
// Task 2: added currentlyAccepting + maxInboundLbsPerWeek to all 6 entries.
// All set to currentlyAccepting: true for the demo scenario.
// maxInboundLbsPerWeek values are realistic relative to monthlyDemandCases.

export const FOOD_BANKS: FoodBank[] = [
  {
    id: 'fb-001',
    name: 'Alameda County Community Food Bank',
    location: 'Oakland, CA',
    region: 'Bay Area',
    monthlyDemandCases: 1200,
    contact: 'Darius Williams',
    email: 'darius@accfb.org',
    dietaryPrefs: ['halal', 'low-sodium'],
    accessWindows: ['Mon 8-11', 'Wed 8-11', 'Fri 8-11'],
    currentlyAccepting: true,
    maxInboundLbsPerWeek: 15000,
  },
  {
    id: 'fb-002',
    name: 'San Diego Food Bank',
    location: 'San Diego, CA',
    region: 'Southern CA',
    monthlyDemandCases: 2100,
    contact: 'Maria Santos',
    email: 'maria@sdfoodbank.org',
    dietaryPrefs: ['low-sodium'],
    accessWindows: ['Tue 9-1', 'Thu 9-1', 'Sat 9-12'],
    currentlyAccepting: true,
    maxInboundLbsPerWeek: 20000,
  },
  {
    id: 'fb-003',
    name: 'SF-Marin Food Bank',
    location: 'San Francisco, CA',
    region: 'Bay Area',
    monthlyDemandCases: 900,
    contact: 'Priya Nair',
    email: 'priya@sfmfoodbank.org',
    dietaryPrefs: ['no-shellfish', 'vegetarian-available'],
    accessWindows: ['Mon 10-2', 'Thu 10-2'],
    currentlyAccepting: true,
    maxInboundLbsPerWeek: 8000,
  },
  {
    id: 'fb-004',
    name: 'Redwood Empire Food Bank',
    location: 'Santa Rosa, CA',
    region: 'North Bay',
    monthlyDemandCases: 650,
    contact: 'Kenji Watanabe',
    email: 'kenji@refb.org',
    dietaryPrefs: [],
    accessWindows: ['Wed 8-12', 'Fri 8-12'],
    currentlyAccepting: true,
    maxInboundLbsPerWeek: 6000,
  },
  {
    id: 'fb-005',
    name: 'Oregon Food Bank',
    location: 'Portland, OR',
    region: 'Pacific Northwest',
    monthlyDemandCases: 1800,
    contact: 'Sandra Bloom',
    email: 'sandra@oregonfoodbank.org',
    dietaryPrefs: ['low-sodium', 'gluten-free-available'],
    accessWindows: ['Mon 7-11', 'Wed 7-11', 'Fri 7-11'],
    currentlyAccepting: true,
    maxInboundLbsPerWeek: 18000,
  },
  {
    id: 'fb-006',
    name: 'Los Angeles Regional Food Bank',
    location: 'Los Angeles, CA',
    region: 'Southern CA',
    monthlyDemandCases: 3400,
    contact: 'Carlos Mendez',
    email: 'carlos@lafoodbank.org',
    dietaryPrefs: ['halal', 'kosher-available', 'low-sodium'],
    accessWindows: ['Mon 6-10', 'Tue 6-10', 'Wed 6-10', 'Thu 6-10', 'Fri 6-10'],
    currentlyAccepting: true,
    maxInboundLbsPerWeek: 30000,
  },
];

// ── Quotes ───────────────────────────────────────────────────────────────────────────────

export const QUOTES: Quote[] = [
  { id: 'q-001', lotId: 'lot-001', supplierId: 'sup-001', pricePerLb: 1.44, moqLbs: 2000, validUntil: '2026-07-17', status: 'OPEN' },
  { id: 'q-002', lotId: 'lot-001', supplierId: 'sup-001', pricePerLb: 1.38, moqLbs: 4000, validUntil: '2026-07-17', status: 'OPEN' },
  { id: 'q-003', lotId: 'lot-002', supplierId: 'sup-002', pricePerLb: 0.46, moqLbs: 5000, validUntil: '2026-07-18', status: 'OPEN' },
  { id: 'q-004', lotId: 'lot-002', supplierId: 'sup-002', pricePerLb: 0.42, moqLbs: 9000, validUntil: '2026-07-18', status: 'OPEN' },
  { id: 'q-005', lotId: 'lot-003', supplierId: 'sup-003', pricePerLb: 1.60, moqLbs: 2100, validUntil: '2026-07-16', status: 'OPEN' },
  { id: 'q-006', lotId: 'lot-004', supplierId: 'sup-004', pricePerLb: 2.10, moqLbs: 1500, validUntil: '2026-07-20', status: 'OPEN' },
  { id: 'q-007', lotId: 'lot-004', supplierId: 'sup-004', pricePerLb: 1.95, moqLbs: 3000, validUntil: '2026-07-19', status: 'OPEN' },
  { id: 'q-008', lotId: 'lot-005', supplierId: 'sup-005', pricePerLb: 1.50, moqLbs: 3000, validUntil: '2026-07-21', status: 'OPEN' },
  { id: 'q-009', lotId: 'lot-005', supplierId: 'sup-005', pricePerLb: 1.42, moqLbs: 7000, validUntil: '2026-07-20', status: 'OPEN' },
  { id: 'q-010', lotId: 'lot-006', supplierId: 'sup-001', pricePerLb: 0.42, moqLbs: 5600, validUntil: '2026-07-17', status: 'ACCEPTED' },
  { id: 'q-011', lotId: 'lot-007', supplierId: 'sup-002', pricePerLb: 1.30, moqLbs: 4100, validUntil: '2026-07-15', status: 'ACCEPTED' },
  { id: 'q-012', lotId: 'lot-008', supplierId: 'sup-003', pricePerLb: 2.25, moqLbs: 1800, validUntil: '2026-07-14', status: 'ACCEPTED' },
];

// ── Historical Audit Events ───────────────────────────────────────────────────────────────────

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'ae-001', entityType: 'LOT', entityId: 'lot-006', action: 'SCORED',
    actor: 'agent:scorer', beforeState: { status: 'AVAILABLE' }, afterState: { status: 'SCORED', score: 88 },
    timestamp: '2026-07-12T09:14:00Z',
  },
  {
    id: 'ae-002', entityType: 'APPROVAL', entityId: 'lot-006', action: 'APPROVAL_CREATED',
    actor: 'agent:procure', beforeState: null, afterState: { approvalType: 'PROCUREMENT', status: 'PENDING' },
    timestamp: '2026-07-12T09:15:00Z',
  },
  {
    id: 'ae-003', entityType: 'APPROVAL', entityId: 'lot-006', action: 'APPROVED',
    actor: 'operator:ken', beforeState: { status: 'PENDING' }, afterState: { status: 'APPROVED' },
    timestamp: '2026-07-12T10:02:00Z',
  },
  {
    id: 'ae-004', entityType: 'LOT', entityId: 'lot-006', action: 'STATUS_CHANGED',
    actor: 'operator:ken', beforeState: { status: 'SCORED' }, afterState: { status: 'PROCUREMENT_CONFIRMED' },
    timestamp: '2026-07-12T10:02:00Z',
  },
  {
    id: 'ae-005', entityType: 'LOT', entityId: 'lot-007', action: 'SCORED',
    actor: 'agent:scorer', beforeState: { status: 'AVAILABLE' }, afterState: { status: 'SCORED', score: 91 },
    timestamp: '2026-07-10T14:22:00Z',
  },
  {
    id: 'ae-006', entityType: 'APPROVAL', entityId: 'lot-007', action: 'APPROVED',
    actor: 'operator:ken', beforeState: { status: 'PENDING' }, afterState: { status: 'APPROVED' },
    timestamp: '2026-07-10T15:10:00Z',
  },
  {
    id: 'ae-007', entityType: 'LOT', entityId: 'lot-008', action: 'STATUS_CHANGED',
    actor: 'system', beforeState: { status: 'SHIPPED' }, afterState: { status: 'DELIVERED' },
    timestamp: '2026-07-14T11:00:00Z',
  },
];

// ── Legacy export (keeps old imports working) ───────────────────────────────────────────────

export const MOCK_SURPLUS_EVENTS = [
  { id: 'evt-001', fisheryId: 'monterey-001', species: 'Albacore Tuna', lbs: 4200, landingAt: 'Monterey Bay Fisheries, CA', landingDate: '2026-07-18', marketPricePerLb: 1.85, proposedDiscountPct: 22 },
  { id: 'evt-002', fisheryId: 'san-diego-003', species: 'Pacific Sardine', lbs: 8900, landingAt: 'San Diego Fish Market, CA', landingDate: '2026-07-20', marketPricePerLb: 0.65, proposedDiscountPct: 30 },
  { id: 'evt-003', fisheryId: 'bodega-bay-005', species: 'Dungeness Crab (broken pieces)', lbs: 1100, landingAt: 'Bodega Bay Harbor, CA', landingDate: '2026-07-19', marketPricePerLb: 3.20, proposedDiscountPct: 40 },
];

// ── Food Bank Inventory ──────────────────────────────────────────────────────────────────────────
// Demo-scenario data — not sourced ACCFB figures. Designed to surface
// interesting replenishment signals: salmon critically low at ACCFB (peak
// season), sardine approaching threshold at SF-Marin, halibut fine everywhere.

export const FOOD_BANK_INVENTORY: FoodBankInventory[] = [
  // ── fb-001: Alameda County Community Food Bank ──
  { foodBankId: 'fb-001', item: 'salmon',  onHandLbs: 320,  avgWeeklyUsageLbs: 420, lastReceivedDate: '2026-07-08' },
  { foodBankId: 'fb-001', item: 'sardine', onHandLbs: 1800, avgWeeklyUsageLbs: 600, lastReceivedDate: '2026-07-10' },
  { foodBankId: 'fb-001', item: 'tuna',    onHandLbs: 2400, avgWeeklyUsageLbs: 500, lastReceivedDate: '2026-07-12' },
  { foodBankId: 'fb-001', item: 'halibut', onHandLbs: 900,  avgWeeklyUsageLbs: 200, lastReceivedDate: '2026-07-05' },

  // ── fb-002: San Diego Food Bank ──
  { foodBankId: 'fb-002', item: 'salmon',  onHandLbs: 1200, avgWeeklyUsageLbs: 480, lastReceivedDate: '2026-07-11' },
  { foodBankId: 'fb-002', item: 'sardine', onHandLbs: 3400, avgWeeklyUsageLbs: 900, lastReceivedDate: '2026-07-14' },
  { foodBankId: 'fb-002', item: 'tuna',    onHandLbs: 2800, avgWeeklyUsageLbs: 750, lastReceivedDate: '2026-07-13' },
  { foodBankId: 'fb-002', item: 'halibut', onHandLbs: 500,  avgWeeklyUsageLbs: 150, lastReceivedDate: '2026-07-09' },

  // ── fb-003: SF-Marin Food Bank ──
  { foodBankId: 'fb-003', item: 'salmon',  onHandLbs: 680,  avgWeeklyUsageLbs: 300, lastReceivedDate: '2026-07-10' },
  { foodBankId: 'fb-003', item: 'sardine', onHandLbs: 560,  avgWeeklyUsageLbs: 400, lastReceivedDate: '2026-07-07' },
  { foodBankId: 'fb-003', item: 'tuna',    onHandLbs: 1100, avgWeeklyUsageLbs: 320, lastReceivedDate: '2026-07-12' },
  { foodBankId: 'fb-003', item: 'halibut', onHandLbs: 420,  avgWeeklyUsageLbs: 120, lastReceivedDate: '2026-07-06' },
];

// ── Distribution Events ──────────────────────────────────────────────────────────────────────────
// Upcoming distributions that draw down inventory before the next delivery.

export const DISTRIBUTION_EVENTS: DistributionEvent[] = [
  {
    foodBankId: 'fb-001',
    date: '2026-07-18',
    label: 'ACCFB July Week 3 Distribution',
    itemAllocations: [
      { item: 'salmon',  allocatedLbs: 280 },
      { item: 'sardine', allocatedLbs: 400 },
      { item: 'tuna',    allocatedLbs: 350 },
    ],
  },
  {
    foodBankId: 'fb-001',
    date: '2026-07-25',
    label: 'ACCFB July Week 4 Distribution',
    itemAllocations: [
      { item: 'salmon',  allocatedLbs: 280 },
      { item: 'sardine', allocatedLbs: 400 },
      { item: 'tuna',    allocatedLbs: 350 },
    ],
  },
  {
    foodBankId: 'fb-002',
    date: '2026-07-19',
    label: 'SDFB July Week 3 Distribution',
    itemAllocations: [
      { item: 'salmon',  allocatedLbs: 400 },
      { item: 'sardine', allocatedLbs: 700 },
      { item: 'tuna',    allocatedLbs: 600 },
    ],
  },
  {
    foodBankId: 'fb-003',
    date: '2026-07-21',
    label: 'SF-Marin July Week 3 Distribution',
    itemAllocations: [
      { item: 'sardine', allocatedLbs: 300 },
      { item: 'tuna',    allocatedLbs: 250 },
    ],
  },
];
