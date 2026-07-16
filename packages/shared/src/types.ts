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
  perishableCapacity?: number; // lbs of cold storage the agency can accept
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
// The hub ingests many supply sources (donated produce, purchased food, and
// surplus local Bay Area catch among them). Surplus catch — and its optional
// shelf-stable co-pack path — is one first-class stream the forecast/procure
// agents can handle, not a separate product. Kept and supported.
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
// Used by the scorer/procure/canning/pipeline agents and the dashboard store.
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
  expiryDate: string; // ISO date
  pricePerLb: number;
  marketPricePerLb: number;
  proposedDiscountPct: number;
  landingLocation: string;
  status: LotStatus;
  score?: number; // 0..100, set once the scorer agent has run
  notes?: string;
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
// Human-in-the-loop approvals + audit trail. Every agent draft becomes an
// Approval; nothing changes state until an operator resolves it.
// ============================================================================

export type ApprovalType = 'PROCUREMENT' | 'FACILITY_BOOKING' | 'DELIVERY_RELEASE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Approval {
  id: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  entityId: string; // usually a lot id
  operatorId: string; // empty until resolved
  draftPayload: unknown;
  notes?: string;
  createdAt: string; // ISO timestamp
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
  actor: string; // e.g. 'agent:scorer', 'operator:ken', 'system'
  beforeState?: unknown;
  afterState?: unknown;
  timestamp: string; // ISO timestamp
}

// ============================================================================
// Vessel → pickup → processing intake (current build focus, per onsite
// advisors). CV runs twice: on-vessel at harvest (drives the purchase/
// dispatch decision before the truck rolls) and dockside at transfer into
// barcoded containers. QA/QC runs before AND after processing.
// ============================================================================

export interface CVEstimate {
  count: number; // individual fish/shellfish detected
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
  cvEstimate: CVEstimate; // from on-vessel/at-harvest computer vision
  location: string; // dock / landing location
  loggedAt: string; // ISO timestamp
  pickupWindow: string; // e.g. "2026-07-16 14:00-16:00"
}

export interface PickupDispatch {
  catchLogId: string;
  recommend: boolean;
  coldTransportUnit: string; // e.g. "CT-04 (reefer, 2°C)"
  arrivalEta: string;
  reason: string; // cites the on-vessel CV metrics driving the decision
}

export interface SortedContainer {
  containerId: string; // barcoded reusable bin
  catchLogId: string;
  species: string;
  sizeGrade: 'S' | 'M' | 'L' | 'XL';
  lbs: number;
  tempC: number; // thermal-cam surface reading at sort
  qaStatus: 'PASS' | 'FLAG';
  reason: string; // why it passed or was flagged
}

export interface DockIntakeResult {
  catchLogId: string;
  vesselName: string;
  containers: SortedContainer[];
  totalLbsAccepted: number;
  flaggedCount: number;
  summary: string; // draft summary — operator confirms before processing handoff
}
