// approvals.ts — Approval Gate
// Every agent draft must pass through an ApprovalRequest before state changes.
// Agent recommends. Operator approves. System records.

import type { Approval, ApprovalType, AuditEvent } from '../../packages/shared/src/types';

let _approvals: Approval[] = [];
let _auditLog: AuditEvent[] = [];
let _seq = 1;

function uid(prefix: string) { return `${prefix}-${Date.now()}-${_seq++}`; }
function now() { return new Date().toISOString(); }

/** Create a pending approval request for an agent draft action */
export function createApprovalRequest(
  approvalType: ApprovalType,
  entityId: string,
  draftPayload: unknown,
  actor = 'agent'
): Approval {
  const approval: Approval = {
    id: uid('apr'),
    approvalType,
    status: 'PENDING',
    entityId,
    operatorId: '',
    draftPayload,
    createdAt: now(),
  };
  _approvals.push(approval);

  _auditLog.push({
    id: uid('ae'),
    entityType: 'APPROVAL',
    entityId,
    action: 'APPROVAL_CREATED',
    actor,
    afterState: approval,
    timestamp: now(),
  });

  return approval;
}

/** Approve a pending request. Idempotent — double-approve is a no-op. */
export function approveAction(
  approvalId: string,
  operatorId: string,
  notes?: string
): Approval {
  const approval = _approvals.find(a => a.id === approvalId);
  if (!approval) throw new Error(`Approval ${approvalId} not found`);
  if (approval.status === 'APPROVED') return approval; // idempotent
  if (approval.status !== 'PENDING') throw new Error(`Cannot approve: status is ${approval.status}`);

  const before = { ...approval };
  approval.status = 'APPROVED';
  approval.operatorId = operatorId;
  approval.notes = notes;
  approval.resolvedAt = now();

  _auditLog.push({
    id: uid('ae'),
    entityType: 'APPROVAL',
    entityId: approval.entityId,
    action: 'APPROVED',
    actor: operatorId,
    beforeState: before,
    afterState: { ...approval },
    timestamp: now(),
  });

  return approval;
}

/** Reject a pending request. Idempotent. */
export function rejectAction(
  approvalId: string,
  operatorId: string,
  notes?: string
): Approval {
  const approval = _approvals.find(a => a.id === approvalId);
  if (!approval) throw new Error(`Approval ${approvalId} not found`);
  if (approval.status === 'REJECTED') return approval; // idempotent
  if (approval.status !== 'PENDING') throw new Error(`Cannot reject: status is ${approval.status}`);

  const before = { ...approval };
  approval.status = 'REJECTED';
  approval.operatorId = operatorId;
  approval.notes = notes;
  approval.resolvedAt = now();

  _auditLog.push({
    id: uid('ae'),
    entityType: 'APPROVAL',
    entityId: approval.entityId,
    action: 'REJECTED',
    actor: operatorId,
    beforeState: before,
    afterState: { ...approval },
    timestamp: now(),
  });

  return approval;
}

export function getApprovals() { return [..._approvals]; }
export function getAuditLog() { return [..._auditLog]; }
export function resetStore(seed?: { approvals?: Approval[]; auditLog?: AuditEvent[] }) {
  _approvals = seed?.approvals ?? [];
  _auditLog = seed?.auditLog ?? [];
}
