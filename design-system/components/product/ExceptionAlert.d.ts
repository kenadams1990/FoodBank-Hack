/** Exception panel — warm dark surface + salmon text; states facts and a next action.
 * @startingPoint section="Product" subtitle="Calm error surface" viewport="700x140"
 */
export interface ExceptionAlertProps {
  /** Fact-first headline, e.g. "2 lots expiring within 48h with no approved procurement" */
  title: string;
  /** Detail lines, e.g. "Halibut — 1,200 lbs — expires 2026-07-19" */
  items?: string[];
  style?: React.CSSProperties;
}
