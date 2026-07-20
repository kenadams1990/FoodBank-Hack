import React from 'react';
/** Big display metric with mono unit label. Numbers lead every screen. */
export function ImpactNumber({ value, unit, accent = false, size = 42, style }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, ...style }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size, lineHeight: 1,
        letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
        color: accent ? 'var(--salmon)' : 'var(--text-primary)' }}>{value}</span>
      {unit ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: Math.max(11, size * 0.28),
        color: 'var(--text-tertiary)' }}>{unit}</span> : null}
    </span>
  );
}
