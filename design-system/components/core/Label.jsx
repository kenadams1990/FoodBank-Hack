import React from 'react';
/** ALL-CAPS mono section label at 0.28em tracking. */
export function Label({ children, color = 'var(--text-tertiary)', style }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 11,
      letterSpacing: '0.28em', textTransform: 'uppercase', color, ...style }}>
      {children}
    </span>
  );
}
