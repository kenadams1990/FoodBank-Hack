// approvals.ts — Approval Gate Engine
// Every agent output must pass through here before any state change.
// createApprovalRequest() → operator calls approveAction() or rejectAction().

import type { Approval, ApprovalType, ApprovalStatus, AuditEvent } from '../../packages/shared/src/types';

let _approvals: Approval[] = [];
let _auditEvents: AuditEvent[] = [];

export function initApprovalStore(existing: Approval[], existingAudit: AuditEvent[]) {
  _approvals = [...existing];
  _auditEvents = [...existingAudit];
}

export function getApprovals(): Approval[] {
  return _approvals;
}

export function getAuditEvents(): AuditEvent[] {
  return _auditEvents;
}

function emitAudit(
  entityType: string,
  entityId: string,
  action: string,
  actor: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>
): void {
  _auditEvents.push({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    entityType,
    entityId,
    action,
    actor,
    beforeState: before,
    afterState: after,
    timestamp: new Date().toISOString(),
  });
}

export function createApprovalRequest(
  approvalType: ApprovalType,
  entityId: string,
  entityType: string,
  rationale: string,
  actor = 'agent:pipeline'
): Approval {
  // Idempotency: don’t create duplicate PENDING approval for same entity+type
  const existing = _approvals.find(
    a => a.entityId === entityId &&
         a.approvalType === approvalType &&
         a.status === 'PENDING'
  );
  if (existing) return existing;

  const approval: Approval = {
    id: `apr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    approvalType,
    entityId,
    entityType,
    status: 'PENDING',
    operatorId: '',
    rationale,
    createdAt: new Date().toISOString(),
  };

  _approvals.push(approval);
  emitAudit('Approval', approval.id, 'APPROVAL_CREATED', actor, undefined, {
    approvalType,
    status: 'PENDING',
    entityId,
  });

  return approval;
}

export function approveAction(
  approvalId: string,
  operatorId: string,
  notes?: string
): Approval {
  const approval = _approvals.find(a => a.id === approvalId);
  if (!approval) throw new Error(`Approval ${approvalId} not found`);

  // Idempotency: already approved is a no-op
  if (approval.status === 'APPROVED') return approval;
  if (approval.status === 'REJECTED') throw new Error(`Approval ${approvalId} was already rejected`);

  const before = { status: approval.status };
  approval.status = 'APPROVED';
  approval.operatorId = operatorId;
  approval.notes = notes;
  approval.resolvedAt = new Date().toISOString();

  emitAudit('Approval', approvalId, 'APPROVAL_RESOLVED', operatorId, before, {
    status: 'APPROVED',
    notes,
  });

  return approval;
}

export function rejectAction(
  approvalId: string,
  operatorId: string,
  notes?: string
): Approval {
  const approval = _approvals.find(a => a.id === approvalId);
  if (!approval) throw new Error(`Approval ${approvalId} not found`);

  if (approval.status === 'REJECTED') return approval;
  if (approval.status === 'APPROVED') throw new Error(`Approval ${approvalId} was already approved`);

  const before = { status: approval.status };
  approval.status = 'REJECTED';
  approval.operatorId = operatorId;
  approval.notes = notes;
  approval.resolvedAt = new Date().toISOString();

  emitAudit('Approval', approvalId, 'APPROVAL_RESOLVED', operatorId, before, {
    status: 'REJECTED',
    notes,
  });

  return approval;
}
