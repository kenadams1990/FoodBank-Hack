// ============================================================================
// TideLift AI — Operations Intelligence Hub: shared types
//
// The hub is 5 agents over the food bank's INTERNAL supply chain. Every agent
// returns a DRAFT/recommendation with a `reason` — never an execution.
// "Agent recommends. You decide." (human-in-the-loop is a product rule.)
// ============================================================================

// ---------------------------------------------------------------------------
// Theme 1 — "See It Coming": forecast inbound supply (forecast.ts)
// ---------------------------------------------------------------------------
export interface InboundRecord {
  item: string;
  lbs: number;
  receivedAt: string; // ISO date
  source?: string;
}

export interface HarvestEntry {
  item: string;
  month: number; // 1..12
  seasonalFactor: number; // multiplier vs baseline, e.g. 1.4 in peak season
}

export interface SupplyForecast {
  item: string;
  predictedLbs: number;
  confidence: number; // 0..1
  gapVsNeedLbs: number; // needTarget - predicted (positive = shortfall)
  recommendedBuyWindow: string | null; // e.g. "2026-07-22..2026-07-26"; null if no gap
  reason: string; // draft rationale
}

// ---------------------------------------------------------------------------
// Theme 1 — procurement: score donors/vendors, draft a buy (procure.ts)
// ---------------------------------------------------------------------------
export interface VendorRecord {
  vendor: string;
  pricePerLb: number;
  committedVsDelivered: number; // 0..1, e.g. 0.82 = delivered 82% of committed
}

export interface VendorOption {
  vendor: string;
  reliabilityScore: number; // 0..1, from delivered-vs-committed history
  pricePerLb: number;
  committedVsDelivered: number;
}

export interface ProcurementDraft {
  item: string;
  gapLbs: number;
  vendorOptions: VendorOption[];
  recommendedVendor: string;
  buyWindow: string;
  reason: string; // explains the reliability-vs-price tradeoff
}

// ---------------------------------------------------------------------------
// Theme 3 — "Production is Manufacturing": the repack line (production.ts)
// ---------------------------------------------------------------------------
export interface KitDemand {
  kitType: string;
  quantity: number;
}

export interface VolunteerSignup {
  name: string;
  shift: string;
  noShowHistory: number; // 0..1 prior no-show rate
}

export interface ProductionPlan {
  date: string;
  kitsToBuild: number;
  recommendedCrew: number;
  lineSetup: string; // e.g. "2 pack stations + 1 QC"
  stagingSteps: string[]; // ordered "stage tonight" list
  volunteerNoShowRisk: number; // 0..1
  reason: string;
}

// ---------------------------------------------------------------------------
// Theme 4 — "Equity With a Truck Attached": equity routing (route.ts)
// ---------------------------------------------------------------------------
export interface DeliveryPlanRow {
  agency: string;
  neighborhood: string;
  accessWindow: string; // when the agency can actually receive
  urgencyScore: number; // higher = more urgent (perishability + need)
  allocatedLbs: number;
  perishablePriority: boolean; // perishables must not sit behind shelf-stable
  driverLoadNote: string; // difficulty-aware, not just stop count
  reason: string;
}

// ---------------------------------------------------------------------------
// Theme 5 — "Need Is the Demand Signal": partner-agency need
// ---------------------------------------------------------------------------
export interface AgencyNeed {
  agencyId: string;
  neighborhood: string;
  proteinGapLbs: number;
  accessWindows: string[];
  dietaryPrefs: string[];
  perishableCapacity?: number;          // lbs of cold storage the agency can accept
  coldStorageAvailableUntil?: string;   // ISO timestamp — window closes when elapsed;
                                        // absent = window assumed open (conservative)
}

// ---------------------------------------------------------------------------
// Theme 6 — "Every Team Member an Analyst": NL brief (analyst.ts)
// ---------------------------------------------------------------------------
export interface ShiftBrief {
  markdown: string;
  generatedBy: 'gemini' | 'fallback'; // demo-safe: falls back if no network/key
}

// ---------------------------------------------------------------------------
// Top-level hub state the dashboard renders (apps/web)
// ---------------------------------------------------------------------------
export interface HubState {
  forecast: SupplyForecast[];
  procurement: ProcurementDraft[];
  production: ProductionPlan;
  delivery: DeliveryPlanRow[];
  brief: ShiftBrief;
}

// ============================================================================
// Surplus fishery catch — one supported inbound supply stream.
// ============================================================================
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

// ============================================================================
// Lot lifecycle — suppliers, surplus lots, facilities, food banks, quotes.
// ============================================================================

export type LotStatus =
  | 'AVAILABLE'
  | 'SCORED'
  | 'PROCUREMENT_PENDING'
  | 'PROCUREMENT_CONFIRMED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'EXPIRED';

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  species: string[];
  certifications: string[];
  avgCapacityLbsPerWeek: number;
}

export interface SurplusLot {
  id: string;
  supplierId: string;
  species: string;
  lbs: number;
  harvestDate: string; // ISO date
  expiryDate: string;  // ISO date
  pricePerLb: number;
  marketPricePerLb: number;
  proposedDiscountPct: number;
  landingLocation: string;
  status: LotStatus;
  score?: number;      // 0..100, set once the scorer agent has run
  notes?: string;
  tempC?: number;      // surface temp reading from dock intake, °C
}

export interface FacilitySlot {
  date: string; // ISO date
  capacityLbs: number;
}

export interface CanningFacility {
  id: string;
  name: string;
  location: string;
  capacityCasesPerDay: number;
  compatibleSpecies: string[];
  certifications: string[];
  costPerCan: number;
  availableSlots: FacilitySlot[];
}

export interface FoodBank {
  id: string;
  name: string;
  location: string;
  region: string;
  monthlyDemandCases: number;
  contact: string;
  email: string;
  dietaryPrefs: string[];
  accessWindows: string[];
}

export type QuoteStatus = 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Quote {
  id: string;
  lotId: string;
  supplierId: string;
  pricePerLb: number;
  moqLbs: number;
  validUntil: string; // ISO date
  status: QuoteStatus;
}

// ============================================================================
// Human-in-the-loop approvals + audit trail.
// ============================================================================

export type ApprovalType = 'PROCUREMENT' | 'FACILITY_BOOKING' | 'DELIVERY_RELEASE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Approval {
  id: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  entityId: string;
  operatorId: string;
  draftPayload: unknown;
  notes?: string;
  createdAt: string;   // ISO timestamp
  resolvedAt?: string; // ISO timestamp
}

export interface Shipment {
  id: string;
  lotId: string;
  foodBankId: string;
  cases: number;
  eta: string; // ISO date
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface AuditEvent {
  id: string;
  entityType: 'LOT' | 'APPROVAL' | 'SHIPMENT';
  entityId: string;
  action: string;
  actor: string;
  beforeState?: unknown;
  afterState?: unknown;
  timestamp: string; // ISO timestamp
}

// ============================================================================
// Vessel → pickup → processing intake
// ============================================================================

export interface CVEstimate {
  count: number;
  avgWeightLbs: number;
  sizeGrade: 'S' | 'M' | 'L' | 'XL';
  confidence: number; // 0..1
}

export interface VesselCatchLog {
  id: string;
  vesselName: string;
  vesselType: 'wild-catch' | 'farm';
  species: string;
  estimatedLbs: number;
  cvEstimate: CVEstimate;
  location: string;
  loggedAt: string;      // ISO timestamp
  pickupWindow: string;
}

export interface PickupDispatch {
  catchLogId: string;
  recommend: boolean;
  coldTransportUnit: string;
  arrivalEta: string;
  reason: string;
}

export interface SortedContainer {
  containerId: string;
  catchLogId: string;
  species: string;
  sizeGrade: 'S' | 'M' | 'L' | 'XL';
  lbs: number;
  tempC: number;
  qaStatus: 'PASS' | 'FLAG';
  reason: string;
}

export interface DockIntakeResult {
  catchLogId: string;
  vesselName: string;
  containers: SortedContainer[];
  totalLbsAccepted: number;
  flaggedCount: number;
  summary: string;
}

// ============================================================================
// Perishable Rescue & Redistribution — output types for perishable.ts
// ============================================================================

export interface UrgentLotSummary {
  lotId: string;
  species: string;
  lbs: number;
  expiresAt: string;
  hoursRemaining: number;
}

export interface ColdTransportAssignment {
  lotId: string;
  coldTransportUnit: string;
  assignedAgencyId: string;
  pickupWindowSuggestion: string;
}

export interface PerishableRescueDraft {
  generatedAt: string;
  urgentLots: UrgentLotSummary[];
  deliveryRows: DeliveryPlanRow[];
  coldTransportAssignments: ColdTransportAssignment[];
  unroutableLbs: number;
  reason: string;
}

// ============================================================================
// Replenishment List Agent — output types for replenish.ts
// ============================================================================

/** Current on-hand inventory for one item at one food bank. */
export interface FoodBankInventory {
  foodBankId: string;
  item: string;              // species or product type, e.g. 'salmon', 'tuna'
  onHandLbs: number;
  avgWeeklyUsageLbs: number;
  lastReceivedDate: string;  // ISO date
  seasonalFactor?: number;   // override for current-month demand multiplier;
                             // absent = looked up from SEASONAL_FACTORS table
}

/** An upcoming distribution event and its per-item draw-down. */
export interface DistributionEvent {
  foodBankId: string;
  date: string; // ISO date
  label: string; // e.g. "July Week 3 Distribution"
  itemAllocations: Array<{
    item: string;
    allocatedLbs: number;
  }>;
}

/** One line item in a replenishment list draft. */
export interface ReplenishmentLineItem {
  item: string;
  onHandLbs: number;
  weeksOfStockRemaining: number;   // projected post-distribution, seasonal-adjusted
  suggestedLbs: number;            // lbs needed to restore weeksAhead buffer
  shortageScore: number;           // 0..1, higher = more urgent
  sourceType: 'SURPLUS_LOT' | 'LATERAL_TRANSFER' | 'SUPPLIER_ORDER';
  sourceId: string;                // lotId | foodBankId | 'supplier:<item>'
  sourceLabel: string;             // human-readable source description
  reason: string;                  // always present — operator confirms
}

/**
 * Draft replenishment list for one food bank.
 * Always a draft — operator must approve before any order is placed.
 * "Agent recommends. You decide."
 */
export interface ReplenishmentList {
  generatedAt: string;
  foodBankId: string;
  foodBankName: string;
  planningHorizonWeeks: number;
  lineItems: ReplenishmentLineItem[]; // sorted by shortageScore desc
  criticalCount: number;              // items at 0 weeks stock
  totalSuggestedLbs: number;
  reason: string;                     // always present
}
