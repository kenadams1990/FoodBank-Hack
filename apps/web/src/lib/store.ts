// store.ts — Persistent state store backed by Cloudflare KV (falls back to
// an in-memory store when no KV binding is present, e.g. local `vite dev`
// or Vitest). On a real deployment, swap this for a proper database.
//
// The 4 mutable collections (lots, approvals, shipments, auditEvents) live
// together in a single KV blob under key `state:v1`. Read-only seed data
// (suppliers, facilities, foodBanks, quotes) is never mutated by any route,
// so it's kept as plain in-process arrays seeded once from `$shared/mockData`.

import {
  SURPLUS_LOTS, SUPPLIERS, CANNING_FACILITIES, FOOD_BANKS,
  QUOTES, AUDIT_EVENTS
} from '$shared/mockData';
import type {
  SurplusLot, Supplier, CanningFacility, FoodBank,
  Quote, Approval, Shipment, AuditEvent
} from '$shared/types';
import { MOCK_AUDIT_SEED } from './demoScenario';

// ── Read-only seed data ─────────────────────────────────────────────────────
const suppliers: Supplier[] = structuredClone(SUPPLIERS);
const facilities: CanningFacility[] = structuredClone(CANNING_FACILITIES);
const foodBanks: FoodBank[] = structuredClone(FOOD_BANKS);
const quotes: Quote[] = structuredClone(QUOTES);

let _seq = 1;
function uid(prefix: string) { return `${prefix}-${Date.now()}-${_seq++}`; }
export function nowISO() { return new Date().toISOString(); }

// ── Mutable state shape ─────────────────────────────────────────────────────
type MutableState = {
  lots: SurplusLot[];
  approvals: Approval[];
  shipments: Shipment[];
  auditEvents: AuditEvent[];
};

function seedState(): MutableState {
  return {
    lots: structuredClone(SURPLUS_LOTS),
    approvals: [],
    shipments: [],
    auditEvents: structuredClone(AUDIT_EVENTS),
  };
}

const KV_KEY = 'state:v1';

// In-memory fallback — used when no TIDELIFT_KV binding is available (local
// `vite dev`, Vitest). Module-level so it persists across requests within a
// single dev process, mirroring the previous in-memory-only behavior.
let memoryState: MutableState = seedState();

// Minimal shape of the KV binding we rely on — avoids a hard dependency on
// @cloudflare/workers-types just for this.
interface KVBinding {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string): Promise<void>;
}

function getKV(platform: App.Platform | undefined): KVBinding | undefined {
  return (platform as { env?: { TIDELIFT_KV?: KVBinding } } | undefined)?.env?.TIDELIFT_KV;
}

async function loadState(kv: KVBinding | undefined): Promise<MutableState> {
  if (!kv) return memoryState;
  const existing = await kv.get(KV_KEY, 'json');
  if (existing) return existing as MutableState;
  const seeded = seedState();
  await kv.put(KV_KEY, JSON.stringify(seeded));
  return seeded;
}

async function saveState(kv: KVBinding | undefined, state: MutableState): Promise<void> {
  if (!kv) {
    memoryState = state;
    return;
  }
  await kv.put(KV_KEY, JSON.stringify(state));
}

function addAudit(
  state: MutableState,
  entityType: AuditEvent['entityType'],
  entityId: string,
  action: string,
  actor: string,
  before: unknown,
  after: unknown
) {
  state.auditEvents.push({
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

/**
 * Build a store bound to this request's platform (KV binding, if present).
 * Not a module-level singleton — Workers isolates don't share globals
 * reliably, so each request gets its own read-modify-write against KV
 * (or the shared in-memory fallback in dev).
 */
export function getDb(platform?: App.Platform) {
  const kv = getKV(platform);

  return {
    lots: {
      findAll: async () => (await loadState(kv)).lots,
      findById: async (id: string) => (await loadState(kv)).lots.find(l => l.id === id),
      update: async (id: string, patch: Partial<SurplusLot>) => {
        const state = await loadState(kv);
        const idx = state.lots.findIndex(l => l.id === id);
        if (idx === -1) throw new Error(`Lot ${id} not found`);
        const before = { ...state.lots[idx] };
        state.lots[idx] = { ...state.lots[idx], ...patch };
        addAudit(state, 'LOT', id, 'UPDATED', 'system', before, state.lots[idx]);
        await saveState(kv, state);
        return state.lots[idx];
      },
    },
    suppliers: { findAll: () => suppliers, findById: (id: string) => suppliers.find(s => s.id === id) },
    facilities: { findAll: () => facilities, findById: (id: string) => facilities.find(f => f.id === id) },
    foodBanks: { findAll: () => foodBanks, findById: (id: string) => foodBanks.find(f => f.id === id) },
    quotes: { findAll: () => quotes, findByLotId: (lotId: string) => quotes.filter(q => q.lotId === lotId) },
    approvals: {
      findAll: async () => (await loadState(kv)).approvals,
      findById: async (id: string) => (await loadState(kv)).approvals.find(a => a.id === id),
      create: async (data: Omit<Approval, 'id' | 'createdAt'>) => {
        const state = await loadState(kv);
        const approval: Approval = { ...data, id: uid('apr'), createdAt: nowISO() };
        state.approvals.push(approval);
        addAudit(state, 'APPROVAL', approval.entityId, 'APPROVAL_CREATED', 'agent', null, approval);
        await saveState(kv, state);
        return approval;
      },
      update: async (id: string, patch: Partial<Approval>) => {
        const state = await loadState(kv);
        const idx = state.approvals.findIndex(a => a.id === id);
        if (idx === -1) throw new Error(`Approval ${id} not found`);
        const before = { ...state.approvals[idx] };
        state.approvals[idx] = { ...state.approvals[idx], ...patch };
        addAudit(state, 'APPROVAL', state.approvals[idx].entityId, patch.status ?? 'UPDATED', state.approvals[idx].operatorId, before, state.approvals[idx]);
        await saveState(kv, state);
        return state.approvals[idx];
      },
    },
    shipments: {
      findAll: async () => (await loadState(kv)).shipments,
      findById: async (id: string) => (await loadState(kv)).shipments.find(s => s.id === id),
      create: async (data: Omit<Shipment, 'id'>) => {
        const state = await loadState(kv);
        const s: Shipment = { ...data, id: uid('shp') };
        state.shipments.push(s);
        addAudit(state, 'SHIPMENT', s.id, 'CREATED', 'system', null, s);
        await saveState(kv, state);
        return s;
      },
    },
    audit: {
      findAll: async (page = 1, perPage = 50) => {
        const state = await loadState(kv);
        const sorted = [...state.auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        const start = (page - 1) * perPage;
        return { events: sorted.slice(start, start + perPage), total: sorted.length };
      },
    },
    reset: async () => {
      await saveState(kv, seedState());
    },
    nowISO,
  };
}
