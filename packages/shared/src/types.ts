// types.ts — Full TideLift domain model
// All 8 entities: Supplier, SurplusLot, CanningFacility, FoodBank,
// Quote, Approval, Shipment, AuditEvent

// ─── Legacy types (kept for agent compatibility) ────────────────────────────
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

// ─── Core domain entities ────────────────────────────────────────────────────

export type Species = 'salmon' | 'halibut' | 'sardine' | 'albacore' | 'crab' | 'other';

export type LotStatus =
  | 'AVAILABLE'
  | 'SCORED'
  | 'PENDING_PROCUREMENT'
  | 'PROCUREMENT_CONFIRMED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'EXPIRED';

export type ApprovalType = 'PROCUREMENT' | 'FACILITY_BOOKING' | 'DELIVERY_RELEASE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ShipmentStatus = 'DRAFT' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED';

export type Supplier = {
  id: string;
  name: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  species: Species[];
  certifications: string[];
  avgMonthlyLbs: number;
  createdAt: string;
};

export type SurplusLot = {
  id: string;
  supplierId: string;
  species: Species;
  lbs: number;
  harvestDate: string;
  expiryDate: string;
  pricePerLb: number;
  marketPricePerLb: number;
  location: string;
  status: LotStatus;
  score?: number;
  createdAt: string;
};

export type CanningFacility = {
  id: string;
  name: string;
  location: string;
  capacityCasesPerDay: number;
  compatibleSpecies: Species[];
  certifications: string[];
  costPerCan: number;
  availableFrom: string;
  contactEmail: string;
};

export type FoodBank = {
  id: string;
  name: string;
  location: string;
  region: string;
  monthlyDemandCases: number;
  contactName: string;
  contactEmail: string;
  dietaryRestrictions: string[];
  accessWindows: string[];
};

export type Quote = {
  id: string;
  lotId: string;
  supplierId: string;
  pricePerLb: number;
  moqLbs: number;
  validUntil: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
};

export type Approval = {
  id: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  entityId: string;
  entityType: string;
  operatorId: string | null;
  draftPayload: Record<string, unknown>;
  notes: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type Shipment = {
  id: string;
  lotId: string;
  facilityId: string;
  foodBankId: string;
  caseCount: number;
  status: ShipmentStatus;
  estimatedArrival: string | null;
  actualArrival: string | null;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  timestamp: string;
};

// ─── Agent output types ──────────────────────────────────────────────────────

export type OpportunityScore = {
  lotId: string;
  score: number; // 0–100
  breakdown: {
    priceScore: number;
    expiryScore: number;
    volumeScore: number;
    demandScore: number;
  };
  recommendation: string;
};

export type DraftProcurementAction = {
  lotId: string;
  supplierId: string;
  counterOfferPricePerLb: number;
  suggestedMoqLbs: number;
  justification: string;
  offerValidHrs: number;
};

export type FacilityMatch = {
  facility: CanningFacility;
  matchScore: number;
  estimatedDays: number;
  estimatedCases: number;
  rationale: string;
};

export type ShipmentDraft = {
  lotId: string;
  facilityId: string;
  foodBankId: string;
  foodBankName: string;
  estimatedCases: number;
  deliveryWindow: string;
  routeNotes: string;
};

export type RecommendationBundle = {
  lot: SurplusLot;
  score: OpportunityScore;
  procurementDraft: DraftProcurementAction;
  facilityMatches: FacilityMatch[];
  shipmentDrafts: ShipmentDraft[];
  brief: string;
};
