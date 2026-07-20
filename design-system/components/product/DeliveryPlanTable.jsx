import React from 'react';
import { Chip } from '../core/Chip.jsx';
/** Data table for delivery plans / dockside sort — mono cells, hairline rows, chip statuses. */
export function DeliveryPlanTable({ columns = [], rows = [], style }) {
  const th = { textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '8px 12px', borderBottom: '1px solid var(--line-strong)' };
  const td = { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', padding: '9px 12px', borderBottom: '1px solid var(--line)', fontVariantNumeric: 'tabular-nums' };
  const renderCell = (cell) => {
    if (cell && typeof cell === 'object' && cell.chip) return <Chip tone={cell.tone || 'neutral'}>{cell.chip}</Chip>;
    return cell;
  };
  return (
    <div style={{ background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{columns.map((c, i) => <th key={i} style={{ ...th, textAlign: c.align || 'left' }}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => <td key={ci} style={{ ...td, textAlign: columns[ci]?.align || 'left', ...(ri === rows.length - 1 ? { borderBottom: 'none' } : null) }}>{renderCell(cell)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)' }}>No deliveries planned yet.</div>}
    </div>
  );
}
