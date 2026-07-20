/** Lucide-style line icon at the documented 1.5px stroke, butt caps, 24×24 grid.
 * @startingPoint section="Core" subtitle="Documented Lucide glyph set at 1.5px" viewport="700x160"
 */
export interface IconProps {
  /** Glyph: arrow-right | arrow-down | check | close | plus | minus | search | user | settings | bell | menu | info | thermometer | clock */
  name: string;
  /** Pixel size (default 20) */
  size?: number;
  /** Stroke color (default currentColor) */
  color?: string;
  style?: React.CSSProperties;
}
