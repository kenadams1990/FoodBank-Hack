import React from 'react';
import { Icon } from './Icon.jsx';
/** Status chip — mono, hairline border, muted semantic tints. Mirrors the app's chip-ok/warn/alert/neutral. */
export function Chip({ tone = 'neutral', icon, children, style }) {
  const tones = {
    ok: { color: '#7FA98C', border: 'rgba(63,107,79,.5)', bg: 'rgba(63,107,79,.14)' },
    warn: { color: 'var(--warning)', border: 'rgba(232,163,60,.4)', bg: 'rgba(232,163,60,.10)' },
    alert: { color: '#E4715A', border: 'rgba(196,67,46,.5)', bg: 'rgba(196,67,46,.14)' },
    neutral: { color: 'var(--mist)', border: 'var(--line-strong)', bg: 'rgba(241,247,245,.04)' },
    accent: { color: 'var(--salmon)', border: 'rgba(232,101,74,.4)', bg: 'rgba(232,101,74,.10)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)',
      fontSize: 12, padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: t.color,
      border: `1px solid ${t.border}`, background: t.bg, whiteSpace: 'nowrap', ...style }}>
      {icon ? <Icon name={icon} size={11} /> : null}{children}
    </span>
  );
}
