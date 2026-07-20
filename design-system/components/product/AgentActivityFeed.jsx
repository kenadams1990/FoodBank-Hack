import React from 'react';
import { Label } from '../core/Label.jsx';
import { Chip } from '../core/Chip.jsx';
/** Agent activity feed panel — timestamped log of drafts, flags, and approvals. */
export function AgentActivityFeed({ entries = [], status = 'Scanning feed', style }) {
  const statusColor = { 'Idle': 'var(--text-tertiary)', 'Scanning feed': '#7FA98C', 'Negotiating': 'var(--warning)', 'Awaiting approval': 'var(--salmon)', 'Delivery planned': '#7FA98C' }[status] || 'var(--mist)';
  return (
    <div style={{ background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
        <Label>Agent activity</Label>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: statusColor, animation: 'tlPulse 3s cubic-bezier(.4,0,.6,1) infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{status}</span>
        </span>
        <style>{'@keyframes tlPulse{0%,100%{opacity:1}50%{opacity:.35}}'}</style>
      </div>
      <div>
        {entries.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: i < entries.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ marginTop: 6, width: 6, height: 6, borderRadius: 99, background: 'rgba(232,101,74,.55)', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>{e.time}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.3 }}>{e.action}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.detail}</div>
              {e.score != null && <Chip tone="accent" style={{ marginTop: 4 }}>score {e.score}/100</Chip>}
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div style={{ padding: '22px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)' }}>
            No activity yet — the agent will log decisions here
          </div>
        )}
      </div>
    </div>
  );
}
