// types.ts — TideLift shared domain types
// All agent outputs are drafts until an ApprovalRequest is APPROVED.

export type Species = 'Albacore Tuna' | 'Pacific Salmon' | 'Pacific Halibut' | 'Pacific Sardine' | 'Dungeness Crab';

export type ApprovalType = 'PROCUREMENT' | 'FACILITY_BOOKING' | 'DELIVERY_RELEASE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LotStatus = 'AVAILABLE' | 'SCORING' | 'PENDING_PROCUREMENT' | 'PROCUREMENT_CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'EXPIRED';
export type ShipmentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED';

// ── Increment-1 legacy types (kept for backward compat) ──────────────────────
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

// ── Production domain types ───────────────────────────────────────────────────

export type Supplier = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  port: string;
  species: Species[];
  certifications: string[];
  avgMonthlyLbs: number;
  taxExemptEligible: boolean;
};

export type SurplusLot = {
  id: string;
  supplierId: string;
  species: Species;
  weightLbs: number;
  harvestDate: string;        // ISO date
  expiryDate: string;         // ISO date — outer window for canning
  marketPricePerLb: number;
  proposedDiscountPct: number;
  minOrderLbs: number;
  status: LotStatus;
  score?: number;             // 0–100, set by scorer agent
  scoreBreakdown?: ScoreBreakdown;
  notes?: string;
};

export type ScoreBreakdown = {
  priceScore: number;      // 0–25
  expiryScore: number;     // 0–25
  volumeScore: number;     // 0–25
  demandScore: number;     // 0–25
  total: number;           // 0–100
};

export type CanningFacility = {
  id: string;
  name: string;
  location: string;
  state: string;
  capacityLbsPerDay: number;
  costPerCan: number;
  compatibleSpecies: Species[];
  certifications: string[];
  availableSlots: FacilitySlot[];
};

export type FacilitySlot = {
  date: string;        // ISO date
  capacityLbs: number;
  reserved: boolean;
};

export type FoodBank = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  location: string;
  region: string;
  monthlyDemandCases: number;   // cases of 24 cans
  dietaryRestrictions: string[];
  accessWindows: string[];
  priorityScore: number;        // 0–100, set by intake data
};

export type Quote = {
  id: string;
  lotId: string;
  supplierId: string;
  pricePerLb: number;
  minOrderLbs: number;
  validUntil: string;   // ISO date
  notes: string;
  status: 'OPEN' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED';
};

export type Approval = {
  id: string;
  approvalType: ApprovalType;
  entityId: string;       // lotId, facilityId, or shipmentId
  entityType: string;
  status: ApprovalStatus;
  operatorId: string;
  rationale: string;      // agent-generated recommendation text
  notes?: string;         // operator notes on approve/reject
  createdAt: string;
  resolvedAt?: string;
};

export type Shipment = {
  id: string;
  lotId: string;
  facilityId: string;
  foodBankId: string;
  cansProduced: number;
  weightLbs: number;
  status: ShipmentStatus;
  estimatedPickup: string;
  estimatedArrival: string;
  actualArrival?: string;
};

export type AuditEvent = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  timestamp: string;
};

// ── Agent output types ────────────────────────────────────────────────────────

export type DraftProcurementAction = {
  lotId: string;
  supplierId: string;
  counterPricePerLb: number;
  suggestedMOQLbs: number;
  justification: string;
  savingsVsMarket: number;
  estimatedTotalCost: number;
};

export type FacilityMatch = {
  facility: CanningFacility;
  slot: FacilitySlot;
  matchScore: number;    // 0–100
  matchReason: string;
  estimatedCans: number;
  estimatedDays: number;
  totalCanningCost: number;
};

export type ShipmentDraft = {
  foodBank: FoodBank;
  cansAllocated: number;
  deliveryWindow: string;
  routeNotes: string;
  priorityReason: string;
};

export type RecommendationBundle = {
  lot: SurplusLot;
  procurementDraft: DraftProcurementAction;
  facilityMatches: FacilityMatch[];
  shipmentDrafts: ShipmentDraft[];
  agentBrief: string;
  generatedAt: string;
};

export type ImpactMetrics = {
  lbsRescued: number;
  cansProduced: number;
  costAvoided: number;
  mealsEstimated: number;
  lotsProcessed: number;
};
