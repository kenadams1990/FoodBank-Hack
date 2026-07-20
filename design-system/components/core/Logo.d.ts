/** Brand mark + wordmark lockup — bars + beacon dot, Space Grotesk wordmark.
 * @startingPoint section="Core" subtitle="Lockup · mark · compact TIDELIFT" viewport="700x140"
 */
export interface LogoProps {
  /** 'lockup' (mark + TideLift) | 'mark' (bars only) | 'compact' (mark + TIDELIFT caps-mono) */
  variant?: 'lockup' | 'mark' | 'compact';
  /** Surface it sits on: 'dark' → salmon mark / foam text; 'light' → slate ink */
  on?: 'dark' | 'light';
  /** Mark height in px (default 24) */
  size?: number;
  style?: React.CSSProperties;
}
