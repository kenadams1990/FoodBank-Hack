/** Action button — salmon primary (one per screen), ghost secondary, muted danger.
 * @startingPoint section="Core" subtitle="Primary · secondary · danger, 3 sizes" viewport="700x160"
 */
export interface ButtonProps {
  /** 'primary' (salmon — one per screen) | 'secondary' (hairline ghost) | 'danger' */
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
