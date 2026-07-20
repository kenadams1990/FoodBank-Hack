/** Timestamped agent log panel with live status pulse.
 * @startingPoint section="Product" subtitle="Drafts, flags, approvals — logged" viewport="360x320"
 */
export interface AgentActivityFeedProps {
  entries?: Array<{ time: string; action: string; detail: string; score?: number | null }>;
  /** 'Idle' | 'Scanning feed' | 'Negotiating' | 'Awaiting approval' | 'Delivery planned' */
  status?: string;
  style?: React.CSSProperties;
}
