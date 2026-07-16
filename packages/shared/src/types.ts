// types.ts — TideLift shared domain types
// All agent outputs are DraftActions — never auto-committed.

// ── Core domain ──────────────────────────────────────────────────────────────

export type Species = 'salmon' | 'halibut' | 'sardine' | 'tuna' | 'crab' | 'other';

export type LotStatus =
  | 'AVAILABLE'
  | 'SCORED'
  | 'PROCUREMENT_PENDING'
  | 'PROCUREMENT_CONFIRMED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'EXPIRED';

export type ApprovalType = 'PROCUREMENT' | 'FACILITY_BOOKING' | 'DELIVERY_RELEASE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'OPERATOR' | 'VIEWER';

// ── Entities ─────────────────────────────────────────────────────────────────

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  species: Species[];
  certifications: string[];
  avgCapacityLbsPerWeek: number;
};

export type SurplusLot = {
  id: string;
  supplierId: string;
  species: Species;
  lbs: number;
  harvestDate: string;       // ISO date
  expiryDate: string;        // ISO date — last day viable for canning
  pricePerLb: number;        // asking price
  marketPricePerLb: number;  // reference market rate
  proposedDiscountPct: number;
  landingLocation: string;
  status: LotStatus;
  score?: number;            // 0–100, set by scorer agent
  notes?: string;
};

export type CanningFacility = {
  id: string;
  name: string;
  location: string;
  capacityCasesPerDay: number;
  compatibleSpecies: Species[];
  certifications: string[];
  costPerCan: number;
  availableSlots: { date: string; capacityLbs: number }[];
};

export type FoodBank = {
  id: string;
  name: string;
  location: string;
  region: string;
  monthlyDemandCases: number;
  contact: string;
  email: string;
  dietaryPrefs: string[];
  accessWindows: string[];
};

export type Quote = {
  id: string;
  lotId: string;
  supplierId: string;
  pricePerLb: number;
  moqLbs: number;
  validUntil: string;  // ISO date
  status: 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
};

export type Approval = {
  id: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  entityId: string;      // lotId, shipmentId, etc.
  operatorId: string;
  draftPayload: unknown; // the agent's draft action
  notes?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type Shipment = {
  id: string;
  lotId: string;
  facilityId: string;
  foodBankId: string;
  cansProduced?: number;
  status: 'DRAFT' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED';
  estimatedArrival?: string;
  actualArrival?: string;
};

export type AuditEvent = {
  id: string;
  entityType: 'LOT' | 'APPROVAL' | 'SHIPMENT' | 'QUOTE';
  entityId: string;
  action: string;
  actor: string;
  beforeState?: unknown;
  afterState?: unknown;
  timestamp: string;
};

// ── Legacy types (kept for backward compat) ───────────────────────────────────

export type SurplusAlert = {
  fisheryId: string;
  species: string;
  lbs: number;
  landingAt: string;
  marketPricePerLb: number;
  proposedDiscountPct: number;
};

export type CanningJob = {
  surplusId: string;
  coPackerId: string;
  cansTarget: number;
  stagePlan: string[];
  yieldPct?: number;
};

export type AgencyNeed = {
  agencyId: string;
  neighborhood: string;
  proteinGapLbs: number;
  accessWindows: string[];
  dietaryPrefs: string[];
};
