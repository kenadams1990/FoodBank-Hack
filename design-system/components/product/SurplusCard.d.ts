/** Catch-ticket card for one surplus lot on the dashboard feed.
 * @startingPoint section="Product" subtitle="Species, lbs, thermal + urgency chips" viewport="360x210"
 */
export interface SurplusCardProps {
  species: string;
  /** Vessel name, e.g. "F/V Morning Star" */
  vessel: string;
  lotId?: string;
  lbs: number;
  discountPct?: number;
  /** Surface temp °C — >4 alerts, >3 warns */
  tempC?: number;
  daysLeft?: number;
  /** Opportunity score /100 */
  score?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}
