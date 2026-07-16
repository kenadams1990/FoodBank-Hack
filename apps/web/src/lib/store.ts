// store.ts — In-memory state store (replaces DB for demo; swap for Prisma/postgres in production)
import {
  SUPPLIERS, SURPLUS_LOTS, CANNING_FACILITIES, FOOD_BANKS,
  QUOTES, APPROVALS, SHIPMENTS, AUDIT_EVENTS
} from '../../../../packages/shared/src/mockData';
import type {
  Supplier, SurplusLot, CanningFacility, FoodBank,
  Quote, Approval, Shipment, AuditEvent
} from '../../../../packages/shared/src/types';
import { initApprovalStore } from '../../../agents/approvals';

function clone<T>(arr: T[]): T[] {
  return JSON.parse(JSON.stringify(arr));
}

export const store = {
  suppliers: clone(SUPPLIERS) as Supplier[],
  lots: clone(SURPLUS_LOTS) as SurplusLot[],
  facilities: clone(CANNING_FACILITIES) as CanningFacility[],
  foodBanks: clone(FOOD_BANKS) as FoodBank[],
  quotes: clone(QUOTES) as Quote[],
  approvals: clone(APPROVALS) as Approval[],
  shipments: clone(SHIPMENTS) as Shipment[],
  auditEvents: clone(AUDIT_EVENTS) as AuditEvent[],
};

// Sync approval engine with store
initApprovalStore(store.approvals, store.auditEvents);

export function resetStore() {
  store.suppliers = clone(SUPPLIERS) as Supplier[];
  store.lots = clone(SURPLUS_LOTS) as SurplusLot[];
  store.facilities = clone(CANNING_FACILITIES) as CanningFacility[];
  store.foodBanks = clone(FOOD_BANKS) as FoodBank[];
  store.quotes = clone(QUOTES) as Quote[];
  store.approvals = clone(APPROVALS) as Approval[];
  store.shipments = clone(SHIPMENTS) as Shipment[];
  store.auditEvents = clone(AUDIT_EVENTS) as AuditEvent[];
  initApprovalStore(store.approvals, store.auditEvents);
}

export function addAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const e: AuditEvent = {
    ...event,
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  store.auditEvents.push(e);
  return e;
}
