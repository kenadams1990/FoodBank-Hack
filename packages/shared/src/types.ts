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
