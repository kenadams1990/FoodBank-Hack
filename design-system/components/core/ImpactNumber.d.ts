/** Display-size metric with a mono unit — leads every screen with a real number.
 * @startingPoint section="Core" subtitle="38,400 lbs → 32,000 meals" viewport="700x140"
 */
export interface ImpactNumberProps {
  /** Pre-formatted number string, e.g. "38,400" */
  value: string;
  /** Unit label, e.g. "lbs", "meals to ACCFB" */
  unit?: string;
  /** Salmon color — reserve for the one signal metric */
  accent?: boolean;
  /** Number font size in px (default 42) */
  size?: number;
  style?: React.CSSProperties;
}
