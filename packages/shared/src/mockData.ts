// mockData.ts — Full TideLift demo seed data
// 5 suppliers | 8 lots | 3 facilities | 6 food banks | 12 quotes | audit history

import type {
  Supplier, SurplusLot, CanningFacility, FoodBank, Quote, Approval, Shipment, AuditEvent
} from './types';

export const SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001', name: 'Monterey Bay Fisheries', location: 'Monterey, CA',
    contactName: 'Rosa Delgado', contactEmail: 'rosa@montereybay.fish',
    contactPhone: '831-555-0101', species: ['albacore', 'salmon'],
    certifications: ['MSC', 'CA DFW Licensed'], avgMonthlyLbs: 18000,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'sup-002', name: 'San Diego Fish Market', location: 'San Diego, CA',
    contactName: 'Jorge Reyes', contactEmail: 'jorge@sdfish.com',
    contactPhone: '619-555-0202', species: ['sardine', 'halibut'],
    certifications: ['CA DFW Licensed'], avgMonthlyLbs: 24000,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'sup-003', name: 'Bodega Bay Harbor Co-op', location: 'Bodega Bay, CA',
    contactName: 'Elena Marsh', contactEmail: 'elena@bodegaharbor.coop',
    contactPhone: '707-555-0303', species: ['salmon', 'crab'],
    certifications: ['MSC', 'Organic'], avgMonthlyLbs: 9500,
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'sup-004', name: 'Crescent City Docks', location: 'Crescent City, CA',
    contactName: 'Tom Aldridge', contactEmail: 'tom@ccitydocks.com',
    contactPhone: '707-555-0404', species: ['halibut', 'salmon'],
    certifications: ['CA DFW Licensed'], avgMonthlyLbs: 12000,
    createdAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'sup-005', name: 'Eureka Seafood Exchange', location: 'Eureka, CA',
    contactName: 'Mia Thorne', contactEmail: 'mia@eurekaseafood.com',
    contactPhone: '707-555-0505', species: ['sardine', 'albacore'],
    certifications: ['CA DFW Licensed', 'HACCP'], avgMonthlyLbs: 15500,
    createdAt: '2026-03-05T08:00:00Z',
  },
];

export const SURPLUS_LOTS: SurplusLot[] = [
  {
    id: 'lot-001', supplierId: 'sup-001', species: 'albacore',
    lbs: 4200, harvestDate: '2026-07-14', expiryDate: '2026-07-19',
    pricePerLb: 1.44, marketPricePerLb: 1.85, location: 'Monterey, CA',
    status: 'AVAILABLE', createdAt: '2026-07-14T10:00:00Z',
  },
  {
    id: 'lot-002', supplierId: 'sup-002', species: 'sardine',
    lbs: 8900, harvestDate: '2026-07-13', expiryDate: '2026-07-20',
    pricePerLb: 0.46, marketPricePerLb: 0.65, location: 'San Diego, CA',
    status: 'SCORED', score: 82, createdAt: '2026-07-13T14:00:00Z',
  },
  {
    id: 'lot-003', supplierId: 'sup-003', species: 'salmon',
    lbs: 2100, harvestDate: '2026-07-15', expiryDate: '2026-07-21',
    pricePerLb: 2.10, marketPricePerLb: 3.50, location: 'Bodega Bay, CA',
    status: 'PENDING_PROCUREMENT', score: 91, createdAt: '2026-07-15T07:00:00Z',
  },
  {
    id: 'lot-004', supplierId: 'sup-004', species: 'halibut',
    lbs: 3300, harvestDate: '2026-07-12', expiryDate: '2026-07-18',
    pricePerLb: 3.20, marketPricePerLb: 4.80, location: 'Crescent City, CA',
    status: 'PROCUREMENT_CONFIRMED', score: 78, createdAt: '2026-07-12T09:00:00Z',
  },
  {
    id: 'lot-005', supplierId: 'sup-005', species: 'sardine',
    lbs: 11200, harvestDate: '2026-07-10', expiryDate: '2026-07-17',
    pricePerLb: 0.42, marketPricePerLb: 0.65, location: 'Eureka, CA',
    status: 'IN_PRODUCTION', score: 88, createdAt: '2026-07-10T11:00:00Z',
  },
  {
    id: 'lot-006', supplierId: 'sup-001', species: 'salmon',
    lbs: 1800, harvestDate: '2026-07-08', expiryDate: '2026-07-16',
    pricePerLb: 2.30, marketPricePerLb: 3.50, location: 'Monterey, CA',
    status: 'SHIPPED', score: 85, createdAt: '2026-07-08T08:00:00Z',
  },
  {
    id: 'lot-007', supplierId: 'sup-002', species: 'halibut',
    lbs: 950, harvestDate: '2026-07-05', expiryDate: '2026-07-12',
    pricePerLb: 4.10, marketPricePerLb: 4.80, location: 'San Diego, CA',
    status: 'DELIVERED', score: 64, createdAt: '2026-07-05T10:00:00Z',
  },
  {
    id: 'lot-008', supplierId: 'sup-005', species: 'albacore',
    lbs: 600, harvestDate: '2026-07-14', expiryDate: '2026-07-17',
    pricePerLb: 1.60, marketPricePerLb: 1.85, location: 'Eureka, CA',
    status: 'AVAILABLE', score: 38, createdAt: '2026-07-14T16:00:00Z',
  },
];

export const CANNING_FACILITIES: CanningFacility[] = [
  {
    id: 'fac-001', name: 'Bay Area Cannery Co-Pack', location: 'Richmond, CA',
    capacityCasesPerDay: 420, compatibleSpecies: ['salmon', 'albacore', 'sardine', 'halibut'],
    certifications: ['FDA Registered', 'SQF Level 2'], costPerCan: 0.38,
    availableFrom: '2026-07-18', contactEmail: 'ops@bayareacannery.com',
  },
  {
    id: 'fac-002', name: 'Central Valley Pack House', location: 'Fresno, CA',
    capacityCasesPerDay: 280, compatibleSpecies: ['sardine', 'albacore'],
    certifications: ['FDA Registered'], costPerCan: 0.31,
    availableFrom: '2026-07-20', contactEmail: 'scheduler@cvpackhouse.com',
  },
  {
    id: 'fac-003', name: 'Pacific Northwest Cannery', location: 'Astoria, OR',
    capacityCasesPerDay: 610, compatibleSpecies: ['salmon', 'halibut', 'crab'],
    certifications: ['FDA Registered', 'SQF Level 3', 'MSC CoC'], costPerCan: 0.44,
    availableFrom: '2026-07-19', contactEmail: 'production@pnwcannery.com',
  },
];

export const FOOD_BANKS: FoodBank[] = [
  {
    id: 'fb-001', name: 'Alameda County Community Food Bank',
    location: 'Oakland, CA', region: 'East Bay',
    monthlyDemandCases: 1200, contactName: 'Sandra Kim',
    contactEmail: 'sandra@accfb.org', dietaryRestrictions: ['halal', 'low-sodium'],
    accessWindows: ['Mon 9-12', 'Wed 9-12', 'Fri 9-12'],
  },
  {
    id: 'fb-002', name: 'SF-Marin Food Bank',
    location: 'San Francisco, CA', region: 'SF Bay',
    monthlyDemandCases: 2100, contactName: 'Paul Ortega',
    contactEmail: 'paul@sfmfoodbank.org', dietaryRestrictions: ['no-shellfish'],
    accessWindows: ['Tue 8-11', 'Thu 8-11'],
  },
  {
    id: 'fb-003', name: 'San Diego Food Bank',
    location: 'San Diego, CA', region: 'Southern CA',
    monthlyDemandCases: 1850, contactName: 'Maria Flores',
    contactEmail: 'maria@sandiegofoodbank.org', dietaryRestrictions: [],
    accessWindows: ['Mon 7-10', 'Wed 7-10', 'Fri 7-10'],
  },
  {
    id: 'fb-004', name: 'LA Regional Food Bank',
    location: 'Los Angeles, CA', region: 'Southern CA',
    monthlyDemandCases: 3400, contactName: 'David Chen',
    contactEmail: 'david@lafoodbank.org', dietaryRestrictions: ['kosher'],
    accessWindows: ['Mon 6-9', 'Tue 6-9', 'Wed 6-9', 'Thu 6-9'],
  },
  {
    id: 'fb-005', name: 'Redwood Empire Food Bank',
    location: 'Santa Rosa, CA', region: 'North Bay',
    monthlyDemandCases: 760, contactName: 'Carla Nguyen',
    contactEmail: 'carla@refb.org', dietaryRestrictions: [],
    accessWindows: ['Tue 10-1', 'Thu 10-1'],
  },
  {
    id: 'fb-006', name: 'Central California Food Bank',
    location: 'Fresno, CA', region: 'Central Valley',
    monthlyDemandCases: 1100, contactName: 'James Ruiz',
    contactEmail: 'james@ccfoodbank.org', dietaryRestrictions: ['gluten-free'],
    accessWindows: ['Mon 8-12', 'Wed 8-12'],
  },
];

export const QUOTES: Quote[] = [
  { id: 'q-001', lotId: 'lot-001', supplierId: 'sup-001', pricePerLb: 1.44, moqLbs: 2000, validUntil: '2026-07-17', status: 'PENDING', createdAt: '2026-07-14T11:00:00Z' },
  { id: 'q-002', lotId: 'lot-001', supplierId: 'sup-001', pricePerLb: 1.55, moqLbs: 1000, validUntil: '2026-07-17', status: 'PENDING', createdAt: '2026-07-14T12:00:00Z' },
  { id: 'q-003', lotId: 'lot-002', supplierId: 'sup-002', pricePerLb: 0.46, moqLbs: 5000, validUntil: '2026-07-18', status: 'PENDING', createdAt: '2026-07-13T15:00:00Z' },
  { id: 'q-004', lotId: 'lot-002', supplierId: 'sup-002', pricePerLb: 0.50, moqLbs: 3000, validUntil: '2026-07-18', status: 'PENDING', createdAt: '2026-07-13T16:00:00Z' },
  { id: 'q-005', lotId: 'lot-003', supplierId: 'sup-003', pricePerLb: 2.10, moqLbs: 1500, validUntil: '2026-07-19', status: 'PENDING', createdAt: '2026-07-15T08:00:00Z' },
  { id: 'q-006', lotId: 'lot-003', supplierId: 'sup-003', pricePerLb: 2.25, moqLbs: 1000, validUntil: '2026-07-19', status: 'PENDING', createdAt: '2026-07-15T09:00:00Z' },
  { id: 'q-007', lotId: 'lot-004', supplierId: 'sup-004', pricePerLb: 3.20, moqLbs: 2000, validUntil: '2026-07-17', status: 'ACCEPTED', createdAt: '2026-07-12T10:00:00Z' },
  { id: 'q-008', lotId: 'lot-004', supplierId: 'sup-004', pricePerLb: 3.45, moqLbs: 1500, validUntil: '2026-07-17', status: 'REJECTED', createdAt: '2026-07-12T11:00:00Z' },
  { id: 'q-009', lotId: 'lot-005', supplierId: 'sup-005', pricePerLb: 0.42, moqLbs: 6000, validUntil: '2026-07-16', status: 'ACCEPTED', createdAt: '2026-07-10T12:00:00Z' },
  { id: 'q-010', lotId: 'lot-006', supplierId: 'sup-001', pricePerLb: 2.30, moqLbs: 1000, validUntil: '2026-07-14', status: 'ACCEPTED', createdAt: '2026-07-08T09:00:00Z' },
  { id: 'q-011', lotId: 'lot-007', supplierId: 'sup-002', pricePerLb: 4.10, moqLbs: 500, validUntil: '2026-07-10', status: 'ACCEPTED', createdAt: '2026-07-05T11:00:00Z' },
  { id: 'q-012', lotId: 'lot-008', supplierId: 'sup-005', pricePerLb: 1.60, moqLbs: 400, validUntil: '2026-07-16', status: 'PENDING', createdAt: '2026-07-14T17:00:00Z' },
];

export const APPROVALS: Approval[] = [
  {
    id: 'apr-001', approvalType: 'PROCUREMENT', status: 'APPROVED',
    entityId: 'lot-004', entityType: 'SurplusLot',
    operatorId: 'operator-ken', draftPayload: { counterOfferPricePerLb: 3.20, moqLbs: 2000 },
    notes: 'Strong halibut demand from fb-002. Price acceptable.',
    createdAt: '2026-07-12T13:00:00Z', resolvedAt: '2026-07-12T14:30:00Z',
  },
  {
    id: 'apr-002', approvalType: 'FACILITY_BOOKING', status: 'APPROVED',
    entityId: 'lot-004', entityType: 'SurplusLot',
    operatorId: 'operator-ken', draftPayload: { facilityId: 'fac-001', startDate: '2026-07-16' },
    notes: 'Bay Area Cannery has slot available.',
    createdAt: '2026-07-12T14:35:00Z', resolvedAt: '2026-07-12T15:00:00Z',
  },
  {
    id: 'apr-003', approvalType: 'PROCUREMENT', status: 'APPROVED',
    entityId: 'lot-005', entityType: 'SurplusLot',
    operatorId: 'operator-ken', draftPayload: { counterOfferPricePerLb: 0.42, moqLbs: 6000 },
    notes: 'High-volume sardine at best price seen this month.',
    createdAt: '2026-07-10T13:00:00Z', resolvedAt: '2026-07-10T13:45:00Z',
  },
  {
    id: 'apr-004', approvalType: 'PROCUREMENT', status: 'PENDING',
    entityId: 'lot-003', entityType: 'SurplusLot',
    operatorId: null, draftPayload: { counterOfferPricePerLb: 2.10, moqLbs: 1500 },
    notes: null,
    createdAt: '2026-07-15T10:00:00Z', resolvedAt: null,
  },
];

export const SHIPMENTS: Shipment[] = [
  {
    id: 'shp-001', lotId: 'lot-004', facilityId: 'fac-001', foodBankId: 'fb-002',
    caseCount: 148, status: 'IN_TRANSIT',
    estimatedArrival: '2026-07-20', actualArrival: null,
    createdAt: '2026-07-15T06:00:00Z',
  },
  {
    id: 'shp-002', lotId: 'lot-005', facilityId: 'fac-001', foodBankId: 'fb-001',
    caseCount: 390, status: 'CONFIRMED',
    estimatedArrival: '2026-07-22', actualArrival: null,
    createdAt: '2026-07-13T08:00:00Z',
  },
  {
    id: 'shp-003', lotId: 'lot-006', facilityId: 'fac-003', foodBankId: 'fb-005',
    caseCount: 72, status: 'DELIVERED',
    estimatedArrival: '2026-07-14', actualArrival: '2026-07-14',
    createdAt: '2026-07-10T08:00:00Z',
  },
  {
    id: 'shp-004', lotId: 'lot-007', facilityId: 'fac-001', foodBankId: 'fb-003',
    caseCount: 34, status: 'DELIVERED',
    estimatedArrival: '2026-07-13', actualArrival: '2026-07-13',
    createdAt: '2026-07-07T08:00:00Z',
  },
];

export const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'aud-001', entityType: 'SurplusLot', entityId: 'lot-004', action: 'STATUS_CHANGE', actor: 'system', beforeState: { status: 'SCORED' }, afterState: { status: 'PENDING_PROCUREMENT' }, timestamp: '2026-07-12T12:50:00Z' },
  { id: 'aud-002', entityType: 'Approval', entityId: 'apr-001', action: 'APPROVED', actor: 'operator-ken', beforeState: { status: 'PENDING' }, afterState: { status: 'APPROVED' }, timestamp: '2026-07-12T14:30:00Z' },
  { id: 'aud-003', entityType: 'SurplusLot', entityId: 'lot-004', action: 'STATUS_CHANGE', actor: 'system', beforeState: { status: 'PENDING_PROCUREMENT' }, afterState: { status: 'PROCUREMENT_CONFIRMED' }, timestamp: '2026-07-12T14:31:00Z' },
  { id: 'aud-004', entityType: 'Approval', entityId: 'apr-002', action: 'APPROVED', actor: 'operator-ken', beforeState: { status: 'PENDING' }, afterState: { status: 'APPROVED' }, timestamp: '2026-07-12T15:00:00Z' },
  { id: 'aud-005', entityType: 'Approval', entityId: 'apr-003', action: 'APPROVED', actor: 'operator-ken', beforeState: { status: 'PENDING' }, afterState: { status: 'APPROVED' }, timestamp: '2026-07-10T13:45:00Z' },
  { id: 'aud-006', entityType: 'SurplusLot', entityId: 'lot-005', action: 'STATUS_CHANGE', actor: 'system', beforeState: { status: 'PROCUREMENT_CONFIRMED' }, afterState: { status: 'IN_PRODUCTION' }, timestamp: '2026-07-12T08:00:00Z' },
  { id: 'aud-007', entityType: 'Shipment', entityId: 'shp-003', action: 'DELIVERED', actor: 'system', beforeState: { status: 'IN_TRANSIT' }, afterState: { status: 'DELIVERED', actualArrival: '2026-07-14' }, timestamp: '2026-07-14T14:22:00Z' },
  { id: 'aud-008', entityType: 'Approval', entityId: 'apr-004', action: 'CREATED', actor: 'system', beforeState: null, afterState: { status: 'PENDING', approvalType: 'PROCUREMENT' }, timestamp: '2026-07-15T10:00:00Z' },
];

// Legacy export kept for backward compatibility with existing agent files
export const MOCK_SURPLUS_EVENTS = SURPLUS_LOTS.map(lot => ({
  id: lot.id,
  fisheryId: lot.supplierId,
  species: lot.species,
  lbs: lot.lbs,
  landingAt: lot.location,
  landingDate: lot.harvestDate,
  marketPricePerLb: lot.marketPricePerLb,
  proposedDiscountPct: Math.round((1 - lot.pricePerLb / lot.marketPricePerLb) * 100),
}));
