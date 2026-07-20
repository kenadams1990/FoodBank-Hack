import React, { useState } from 'react';
/** TideLift button. Salmon primary is the screen's single signal; secondary is a hairline ghost. */
export function Button({ variant = 'primary', size = 'md', disabled, children, onClick, style }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 22px' : '9px 16px';
  const fs = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;
  const variants = {
    primary: { background: press ? '#D65A41' : hover ? '#EF7D66' : 'var(--salmon)', color: 'var(--ink)', border: '1px solid transparent' },
    secondary: { background: hover ? 'rgba(241,247,245,.06)' : 'transparent', color: 'var(--foam)', border: '1px solid var(--line-strong)' },
    danger: { background: press ? '#A93A28' : hover ? '#D25540' : 'var(--danger)', color: 'var(--foam)', border: '1px solid transparent' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: fs, padding: pad,
        borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, transition: 'background var(--dur-fast) var(--ease-out)',
        ...variants[variant] || variants.primary, ...style }}>
      {children}
    </button>
  );
}
