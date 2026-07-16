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
// DEPRECATED — fishery/canning types. Kept only so the not-yet-retargeted
// agents (forecast/procure/canning) still compile until issues #9/#10/#11 land.
// Remove each as its agent is retargeted to the internal-ops contract above.
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
