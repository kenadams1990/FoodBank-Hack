import React from 'react';
/** Mono readout chip for verified data: lot codes, lbs, °C, %. Mirrors the app's .readout utility. */
export function Readout({ children, style }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '-0.01em',
      fontVariantNumeric: 'tabular-nums', background: 'rgba(241,247,245,.05)',
      border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '2px 6px',
      color: 'var(--text-secondary)', ...style }}>
      {children}
    </span>
  );
}
