import React from 'react';
/** Exception alert panel — warm dark surface, salmon text. Facts + next action, never alarm. */
export function ExceptionAlert({ title, items = [], style }) {
  return (
    <div style={{ background: 'var(--surface-error)', border: '1px solid rgba(232,101,74,.35)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', ...style }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: 'var(--salmon)' }}>{title}</div>
      {items.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((it, i) => (
            <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#E4A796', lineHeight: 1.5 }}>{it}</div>
          ))}
        </div>
      )}
    </div>
  );
}
