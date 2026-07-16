// approvals.test.ts — Approval gate unit tests (idempotency + audit)
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createApprovalRequest, approveAction, rejectAction,
  getApprovals, getAuditLog, resetStore
} from '../approvals';

beforeEach(() => resetStore());

describe('createApprovalRequest', () => {
  it('creates a PENDING approval and emits audit event', () => {
    const apr = createApprovalRequest('PROCUREMENT', 'lot-001', { price: 1.38 });
    expect(apr.status).toBe('PENDING');
    expect(apr.approvalType).toBe('PROCUREMENT');
    expect(getAuditLog().length).toBe(1);
    expect(getAuditLog()[0].action).toBe('APPROVAL_CREATED');
  });
});

describe('approveAction', () => {
  it('approves a pending request', () => {
    const apr = createApprovalRequest('PROCUREMENT', 'lot-001', {});
    const result = approveAction(apr.id, 'operator:ken', 'Looks good');
    expect(result.status).toBe('APPROVED');
    expect(result.operatorId).toBe('operator:ken');
    expect(result.notes).toBe('Looks good');
  });

  it('is idempotent — double-approve returns same state', () => {
    const apr = createApprovalRequest('FACILITY_BOOKING', 'lot-001', {});
    approveAction(apr.id, 'operator:ken');
    const result = approveAction(apr.id, 'operator:ken');
    expect(result.status).toBe('APPROVED');
    const approvedEvents = getAuditLog().filter(e => e.action === 'APPROVED');
    expect(approvedEvents.length).toBe(1); // only one APPROVED event
  });

  it('throws if approval not found', () => {
    expect(() => approveAction('nonexistent', 'operator:ken')).toThrow();
  });
});

describe('rejectAction', () => {
  it('rejects a pending request', () => {
    const apr = createApprovalRequest('DELIVERY_RELEASE', 'lot-001', {});
    const result = rejectAction(apr.id, 'operator:ken', 'Price too high');
    expect(result.status).toBe('REJECTED');
    expect(result.notes).toBe('Price too high');
  });

  it('is idempotent — double-reject is a no-op', () => {
    const apr = createApprovalRequest('DELIVERY_RELEASE', 'lot-001', {});
    rejectAction(apr.id, 'operator:ken');
    const result = rejectAction(apr.id, 'operator:ken');
    expect(result.status).toBe('REJECTED');
  });

  it('throws when trying to reject an already-approved request', () => {
    const apr = createApprovalRequest('PROCUREMENT', 'lot-001', {});
    approveAction(apr.id, 'operator:ken');
    expect(() => rejectAction(apr.id, 'operator:ken')).toThrow();
  });
});
