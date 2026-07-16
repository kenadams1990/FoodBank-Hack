// mockSurplusFeed.ts — wired to real SURPLUS_LOTS seed from shared package
// The dashboard and SurplusCard consume this so lot IDs match /lots/[id] routes.
export { SURPLUS_LOTS as mockSurplusFeed } from '$shared/mockData';

export type AgentStatus = 'Idle' | 'Scanning feed' | 'Negotiating' | 'Awaiting approval' | 'Delivery planned';

export const agentStatusCycle: AgentStatus[] = [
  'Idle', 'Scanning feed', 'Negotiating', 'Awaiting approval', 'Delivery planned',
];
