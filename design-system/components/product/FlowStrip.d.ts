/** Mono cold-chain progress strip with unicode connectors. */
export interface FlowStripProps {
  /** Stage labels (default Vessel → Pickup → Processing → Food Bank) */
  stages?: string[];
  /** Index of the current stage; earlier stages read as done */
  activeIndex?: number;
  style?: React.CSSProperties;
}
