export interface SurplusLot {
  id: string;
  fishType: string;
  lbs: number;
  supplier: string;
  expiryDays: number;
  pricePerLb: number;
}

export const mockSurplusFeed: SurplusLot[] = [
  { id: 'lot-001', fishType: 'Chinook Salmon', lbs: 420, supplier: 'Half Moon Bay Co-op', expiryDays: 4, pricePerLb: 2.10 },
  { id: 'lot-002', fishType: 'Pacific Sardine', lbs: 880, supplier: 'Monterey Landing', expiryDays: 3, pricePerLb: 0.85 },
  { id: 'lot-003', fishType: 'Yellowtail', lbs: 260, supplier: 'San Diego Fishermen', expiryDays: 5, pricePerLb: 3.20 },
  { id: 'lot-004', fishType: 'Albacore Tuna', lbs: 650, supplier: 'Eureka Fish Co.', expiryDays: 6, pricePerLb: 2.75 },
  { id: 'lot-005', fishType: 'Rockfish', lbs: 310, supplier: 'Bodega Bay Fleet', expiryDays: 2, pricePerLb: 1.50 },
];

export function pickBestLot(lots: SurplusLot[]): SurplusLot {
  return [...lots].sort((a, b) => {
    const scoreA = a.lbs * (7 - a.expiryDays) / a.pricePerLb;
    const scoreB = b.lbs * (7 - b.expiryDays) / b.pricePerLb;
    return scoreB - scoreA;
  })[0];
}

export function negotiatePrice(lot: SurplusLot): number {
  return Math.round(lot.pricePerLb * 0.85 * 100) / 100;
}

export interface DeliveryPlanRow {
  supplier: string;
  fish: string;
  lbs: number;
  eta: string;
  status: string;
}

export function buildDeliveryPlan(lot: SurplusLot): DeliveryPlanRow[] {
  const today = new Date();
  const eta1 = new Date(today); eta1.setDate(today.getDate() + 1);
  const eta2 = new Date(today); eta2.setDate(today.getDate() + 2);
  return [
    { supplier: lot.supplier, fish: lot.fishType, lbs: Math.round(lot.lbs * 0.6), eta: eta1.toISOString().slice(0, 10), status: 'Scheduled' },
    { supplier: lot.supplier, fish: lot.fishType, lbs: Math.round(lot.lbs * 0.4), eta: eta2.toISOString().split('T')[0], status: 'Pending' },
  ];
}

export type AgentStatus = 'Idle' | 'Scanning feed' | 'Negotiating' | 'Awaiting approval' | 'Delivery planned';

export const agentStatusCycle: AgentStatus[] = [
  'Idle', 'Scanning feed', 'Negotiating', 'Awaiting approval', 'Delivery planned',
];
