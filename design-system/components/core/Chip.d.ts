/** Status chip for QA / thermal / urgency states — mono text on a muted tint.
 * @startingPoint section="Core" subtitle="ok · warn · alert · neutral · accent" viewport="700x120"
 */
export interface ChipProps {
  tone?: 'ok' | 'warn' | 'alert' | 'neutral' | 'accent';
  /** Optional Icon glyph name (e.g. 'thermometer', 'clock') */
  icon?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
