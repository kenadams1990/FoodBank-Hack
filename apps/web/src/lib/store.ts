// store.ts — In-memory application state (replaces DB for demo)
// Import this into all API routes to read/write shared state.

import {
  SUPPLIERS, SURPLUS_LOTS, CANNING_FACILITIES, FOOD_BANKS,
  QUOTES, APPROVALS, SHIPMENTS, AUDIT_EVENTS
} from '../../../../../packages/shared/src/mockData';
import type {
  Supplier, SurplusLot, CanningFacility, FoodBank,
  Quote, Approval, Shipment, AuditEvent
} from '../../../../../packages/shared/src/types';

function clone<T>(arr: T[]): T[] {
  return JSON.parse(JSON.stringify(arr));
}

export const appStore: {
  suppliers: Supplier[];
  lots: SurplusLot[];
  facilities: CanningFacility[];
  foodBanks: FoodBank[];
  quotes: Quote[];
  approvals: Approval[];
  shipments: Shipment[];
  auditEvents: AuditEvent[];
} = {
  suppliers: clone(SUPPLIERS),
  lots: clone(SURPLUS_LOTS),
  facilities: clone(CANNING_FACILITIES),
  foodBanks: clone(FOOD_BANKS),
  quotes: clone(QUOTES),
  approvals: clone(APPROVALS),
  shipments: clone(SHIPMENTS),
  auditEvents: clone(AUDIT_EVENTS),
};

export function resetStore(): void {
  appStore.suppliers = clone(SUPPLIERS);
  appStore.lots = clone(SURPLUS_LOTS);
  appStore.facilities = clone(CANNING_FACILITIES);
  appStore.foodBanks = clone(FOOD_BANKS);
  appStore.quotes = clone(QUOTES);
  appStore.approvals = clone(APPROVALS);
  appStore.shipments = clone(SHIPMENTS);
  appStore.auditEvents = clone(AUDIT_EVENTS);
}

export function emitAudit(
  entityType: string,
  entityId: string,
  action: string,
  actor: string,
  beforeState: Record<string, unknown> | null,
  afterState: Record<string, unknown> | null
): void {
  appStore.auditEvents.push({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityType, entityId, action, actor,
    beforeState, afterState,
    timestamp: new Date().toISOString(),
  });
}
