import React from 'react';
/** Cold-chain flow strip: Vessel ──●── Pickup ─── Processing ─── Food Bank. Mono, unicode connectors. */
export function FlowStrip({ stages = ['Vessel', 'Pickup', 'Processing', 'Food Bank'], activeIndex = 0, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: 'var(--font-mono)', fontSize: 12, ...style }}>
      {stages.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <span style={{ margin: '0 8px', color: 'var(--text-tertiary)', opacity: .6 }}>{i === activeIndex ? '──●──' : '───'}</span>}
          <span style={{ color: i <= activeIndex ? 'var(--salmon)' : 'var(--text-tertiary)', fontWeight: i <= activeIndex ? 500 : 400 }}>{s}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
