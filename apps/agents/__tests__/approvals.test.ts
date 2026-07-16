// approvals.test.ts — Approval gate unit tests
import { describe, it, expect, beforeEach } from 'vitest';
import { createApprovalRequest, approveAction, rejectAction } from '../approvals';
import { appStore, resetStore } from '../../web/src/lib/store';

beforeEach(() => {
  resetStore();
});

describe('createApprovalRequest', () => {
  it('creates a PENDING approval and adds to store', () => {
    const approval = createApprovalRequest('PROCUREMENT', 'lot-001', 'SurplusLot', { price: 1.44 });
    expect(approval.status).toBe('PENDING');
    expect(approval.approvalType).toBe('PROCUREMENT');
    expect(appStore.approvals.some((a) => a.id === approval.id)).toBe(true);
  });

  it('emits an audit event on creation', () => {
    const before = appStore.auditEvents.length;
    createApprovalRequest('FACILITY_BOOKING', 'lot-002', 'SurplusLot', {});
    expect(appStore.auditEvents.length).toBeGreaterThan(before);
  });
});

describe('approveAction', () => {
  it('approves a pending approval', () => {
    const approval = createApprovalRequest('DELIVERY_RELEASE', 'lot-001', 'SurplusLot', {});
    const result = approveAction(approval.id, 'operator-ken', 'Looks good');
    expect(result.status).toBe('APPROVED');
    expect(result.operatorId).toBe('operator-ken');
    expect(result.resolvedAt).not.toBeNull();
  });

  it('is idempotent — double approve is a no-op', () => {
    const approval = createApprovalRequest('PROCUREMENT', 'lot-003', 'SurplusLot', {});
    approveAction(approval.id, 'operator-ken');
    const result = approveAction(approval.id, 'operator-ken'); // second call
    expect(result.status).toBe('APPROVED');
  });

  it('throws if approval not found', () => {
    expect(() => approveAction('nonexistent-id', 'operator-ken')).toThrow();
  });

  it('throws if trying to approve a rejected approval', () => {
    const approval = createApprovalRequest('PROCUREMENT', 'lot-004', 'SurplusLot', {});
    rejectAction(approval.id, 'operator-ken');
    expect(() => approveAction(approval.id, 'operator-ken')).toThrow();
  });
});

describe('rejectAction', () => {
  it('rejects a pending approval', () => {
    const approval = createApprovalRequest('PROCUREMENT', 'lot-002', 'SurplusLot', {});
    const result = rejectAction(approval.id, 'operator-ken', 'Price too high');
    expect(result.status).toBe('REJECTED');
    expect(result.notes).toBe('Price too high');
  });

  it('is idempotent — double reject is a no-op', () => {
    const approval = createApprovalRequest('PROCUREMENT', 'lot-005', 'SurplusLot', {});
    rejectAction(approval.id, 'operator-ken');
    const result = rejectAction(approval.id, 'operator-ken');
    expect(result.status).toBe('REJECTED');
  });
});
