import React from 'react';
import { Button } from '../core/Button.jsx';
/** Approve/Reject decision row — the human-in-the-loop moment. Reason leads; decision is logged. */
export function ApprovalActions({ reason, approveLabel = 'Approve dispatch', rejectLabel = 'Reject', state = 'pending', onApprove, onReject, style }) {
  const mono = { fontFamily: 'var(--font-mono)' };
  if (state === 'approved') return (
    <div style={{ ...mono, fontSize: 13, padding: '12px 16px', background: 'rgba(63,107,79,.14)', border: '1px solid rgba(63,107,79,.5)', borderRadius: 'var(--radius-sm)', color: '#7FA98C', ...style }}>
      ✓ Approved — logged to audit trail.
    </div>
  );
  if (state === 'rejected') return (
    <div style={{ ...mono, fontSize: 13, padding: '12px 16px', background: 'rgba(241,247,245,.04)', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', ...style }}>
      Rejected — logged to audit trail.
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', ...style }}>
      <span style={{ ...mono, fontSize: 11.5, color: 'var(--text-tertiary)', marginRight: 'auto' }}>
        {reason || 'Agent recommends. You decide.'}
      </span>
      <Button variant="secondary" onClick={onReject}>{rejectLabel}</Button>
      <Button variant="primary" onClick={onApprove}>{approveLabel}</Button>
    </div>
  );
}
