import React from 'react';
/** TideLift mark + wordmark lockup. Mark: three ascending bars + beacon dot. */
export function Logo({ variant = 'lockup', on = 'dark', size = 24, style }) {
  const c = on === 'dark' ? { mark: '#E8654A', text: 'var(--foam)' } : { mark: '#1C2B2C', text: 'var(--slate-ink)' };
  const mark = (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="16" width="4" height="6" fill={c.mark} /><rect x="8" y="12" width="4" height="10" fill={c.mark} />
      <rect x="14" y="8" width="4" height="14" fill={c.mark} /><circle cx="16" cy="4" r="2" fill={c.mark} />
    </svg>
  );
  if (variant === 'mark') return <span style={style}>{mark}</span>;
  if (variant === 'compact') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.5, ...style }}>
      {React.cloneElement(mark, { width: size * 0.75, height: size * 0.75 })}
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: size * 0.55,
        letterSpacing: '0.28em', color: c.text }}>TIDELIFT</span>
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4, ...style }}>
      {mark}
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.95,
        letterSpacing: '-0.01em', color: c.text, lineHeight: 1 }}>TideLift</span>
    </span>
  );
}
