// store.ts — In-memory state store (replaces DB for demo)
// On a real deployment, swap these arrays for Prisma calls.

import {
  SURPLUS_LOTS, SUPPLIERS, CANNING_FACILITIES, FOOD_BANKS,
  QUOTES, AUDIT_EVENTS
} from '../../../../packages/shared/src/mockData';
import type {
  SurplusLot, Supplier, CanningFacility, FoodBank,
  Quote, Approval, Shipment, AuditEvent
} from '../../../../packages/shared/src/types';
import { MOCK_AUDIT_SEED } from './demoScenario';

let lots: SurplusLot[] = structuredClone(SURPLUS_LOTS);
let suppliers: Supplier[] = structuredClone(SUPPLIERS);
let facilities: CanningFacility[] = structuredClone(CANNING_FACILITIES);
let foodBanks: FoodBank[] = structuredClone(FOOD_BANKS);
let quotes: Quote[] = structuredClone(QUOTES);
let approvals: Approval[] = [];
let shipments: Shipment[] = [];
let auditEvents: AuditEvent[] = structuredClone(AUDIT_EVENTS);

let _seq = 1;
function uid(prefix: string) { return `${prefix}-${Date.now()}-${_seq++}`; }
export function nowISO() { return new Date().toISOString(); }

// ── Lots ─────────────────────────────────────────────────────────────────
export const db = {
  lots: {
    findAll: () => lots,
    findById: (id: string) => lots.find(l => l.id === id),
    update: (id: string, patch: Partial<SurplusLot>) => {
      const idx = lots.findIndex(l => l.id === id);
      if (idx === -1) throw new Error(`Lot ${id} not found`);
      const before = { ...lots[idx] };
      lots[idx] = { ...lots[idx], ...patch };
      addAudit('LOT', id, 'UPDATED', 'system', before, lots[idx]);
      return lots[idx];
    },
  },
  suppliers: { findAll: () => suppliers, findById: (id: string) => suppliers.find(s => s.id === id) },
  facilities: { findAll: () => facilities, findById: (id: string) => facilities.find(f => f.id === id) },
  foodBanks: { findAll: () => foodBanks, findById: (id: string) => foodBanks.find(f => f.id === id) },
  quotes: { findAll: () => quotes, findByLotId: (lotId: string) => quotes.filter(q => q.lotId === lotId) },
  approvals: {
    findAll: () => approvals,
    findById: (id: string) => approvals.find(a => a.id === id),
    create: (data: Omit<Approval, 'id' | 'createdAt'>) => {
      const approval: Approval = { ...data, id: uid('apr'), createdAt: nowISO() };
      approvals.push(approval);
      addAudit('APPROVAL', approval.entityId, 'APPROVAL_CREATED', 'agent', null, approval);
      return approval;
    },
    update: (id: string, patch: Partial<Approval>) => {
      const idx = approvals.findIndex(a => a.id === id);
      if (idx === -1) throw new Error(`Approval ${id} not found`);
      const before = { ...approvals[idx] };
      approvals[idx] = { ...approvals[idx], ...patch };
      addAudit('APPROVAL', approvals[idx].entityId, patch.status ?? 'UPDATED', approvals[idx].operatorId, before, approvals[idx]);
      return approvals[idx];
    },
  },
  shipments: {
    findAll: () => shipments,
    findById: (id: string) => shipments.find(s => s.id === id),
    create: (data: Omit<Shipment, 'id'>) => {
      const s: Shipment = { ...data, id: uid('shp') };
      shipments.push(s);
      addAudit('SHIPMENT', s.id, 'CREATED', 'system', null, s);
      return s;
    },
  },
  audit: {
    findAll: (page = 1, perPage = 50) => {
      const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const start = (page - 1) * perPage;
      return { events: sorted.slice(start, start + perPage), total: sorted.length };
    },
  },
  reset: () => {
    lots = structuredClone(SURPLUS_LOTS);
    suppliers = structuredClone(SUPPLIERS);
    facilities = structuredClone(CANNING_FACILITIES);
    foodBanks = structuredClone(FOOD_BANKS);
    quotes = structuredClone(QUOTES);
    approvals = [];
    shipments = [];
    auditEvents = structuredClone(AUDIT_EVENTS);
  },
};

function addAudit(
  entityType: AuditEvent['entityType'],
  entityId: string,
  action: string,
  actor: string,
  before: unknown,
  after: unknown
) {
  auditEvents.push({
    id: uid('ae'),
    entityType,
    entityId,
    action,
    actor,
    beforeState: before,
    afterState: after,
    timestamp: nowISO(),
  });
}
