// Re-export the shared Operations Intelligence Hub types for the dashboard.
// Proves apps/web resolves the @tidelift/shared workspace package, and gives
// components one place to import hub types from as the dashboard gets wired
// to the real agents (replacing lib/mockSurplusFeed.ts).
export type {
  HubState,
  SupplyForecast,
  ProcurementDraft,
  ProductionPlan,
  DeliveryPlanRow,
  AgencyNeed,
  ShiftBrief,
} from '@tidelift/shared';
