/** Mono data table for delivery plans and dockside-sort bins.
 * @startingPoint section="Product" subtitle="Hairline rows · chip statuses" viewport="700x240"
 */
export interface DeliveryPlanTableProps {
  columns: Array<{ label: string; align?: 'left' | 'right' }>;
  /** Row cells: strings/numbers, or { chip: string, tone?: 'ok'|'warn'|'alert'|'neutral'|'accent' } */
  rows: Array<Array<string | number | { chip: string; tone?: string }>>;
  style?: React.CSSProperties;
}
