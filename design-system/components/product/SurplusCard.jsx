import React, { useState } from 'react';
import { Chip } from '../core/Chip.jsx';
import { Readout } from '../core/Readout.jsx';
/** Catch-ticket card for a surplus lot — species, vessel, lbs, discount, thermal + urgency chips. */
export function SurplusCard({ species, vessel, lotId, lbs, discountPct, tempC, daysLeft, score, onClick, style }) {
  const [hover, setHover] = useState(false);
  const tempTone = tempC > 4 ? 'alert' : tempC > 3 ? 'warn' : 'ok';
  const urgTone = daysLeft <= 2 ? 'alert' : daysLeft <= 4 ? 'warn' : 'neutral';
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'var(--surface-panel)', border: `1px solid ${hover ? 'rgba(232,101,74,.45)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-sm)', cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color var(--dur-base) var(--ease-out)', ...style }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.2 }}>{species}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{vessel}</div>
          </div>
          {score != null && <Chip tone="accent">{score}/100</Chip>}
        </div>
        {lotId && <Readout style={{ marginTop: 8, display: 'inline-block' }}>{lotId}</Readout>}
      </div>
      <div style={{ padding: '12px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{Number(lbs).toLocaleString()}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)' }}>lbs</span>
          {discountPct != null && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)' }}>{discountPct}% <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>disc</span></span>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tempC != null && <Chip tone={tempTone} icon="thermometer">{Number(tempC).toFixed(1)}°C</Chip>}
          {daysLeft != null && <Chip tone={urgTone} icon="clock">{daysLeft}d left</Chip>}
        </div>
      </div>
    </div>
  );
}
