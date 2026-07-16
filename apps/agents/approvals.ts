// approvals.ts — Human Approval Gate
// Every agent draft must pass through here before state changes.
// createApprovalRequest() — approveAction() — rejectAction()
// All actions are idempotent and emit audit events.

import type { Approval, ApprovalType, AuditEvent } from '../../packages/shared/src/types';
import { appStore } from '../web/src/lib/store';

function nowISO(): string {
  return new Date().toISOString();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createApprovalRequest(
  approvalType: ApprovalType,
  entityId: string,
  entityType: string,
  draftPayload: Record<string, unknown>
): Approval {
  const approval: Approval = {
    id: generateId('apr'),
    approvalType,
    status: 'PENDING',
    entityId,
    entityType,
    operatorId: null,
    draftPayload,
    notes: null,
    createdAt: nowISO(),
    resolvedAt: null,
  };
  appStore.approvals.push(approval);

  const audit: AuditEvent = {
    id: generateId('aud'),
    entityType: 'Approval',
    entityId: approval.id,
    action: 'CREATED',
    actor: 'system',
    beforeState: null,
    afterState: { status: 'PENDING', approvalType, entityId },
    timestamp: nowISO(),
  };
  appStore.auditEvents.push(audit);

  return approval;
}

export function approveAction(
  approvalId: string,
  operatorId: string,
  notes?: string
): Approval {
  const approval = appStore.approvals.find((a) => a.id === approvalId);
  if (!approval) throw new Error(`Approval ${approvalId} not found`);
  // Idempotent — already approved is a no-op
  if (approval.status === 'APPROVED') return approval;
  if (approval.status === 'REJECTED') throw new Error(`Approval ${approvalId} already rejected`);

  const before = { ...approval };
  approval.status = 'APPROVED';
  approval.operatorId = operatorId;
  approval.notes = notes ?? null;
  approval.resolvedAt = nowISO();

  appStore.auditEvents.push({
    id: generateId('aud'),
    entityType: 'Approval',
    entityId: approvalId,
    action: 'APPROVED',
    actor: operatorId,
    beforeState: before as unknown as Record<string, unknown>,
    afterState: { status: 'APPROVED', operatorId, notes },
    timestamp: nowISO(),
  });

  return approval;
}

export function rejectAction(
  approvalId: string,
  operatorId: string,
  notes?: string
): Approval {
  const approval = appStore.approvals.find((a) => a.id === approvalId);
  if (!approval) throw new Error(`Approval ${approvalId} not found`);
  // Idempotent
  if (approval.status === 'REJECTED') return approval;
  if (approval.status === 'APPROVED') throw new Error(`Approval ${approvalId} already approved`);

  const before = { ...approval };
  approval.status = 'REJECTED';
  approval.operatorId = operatorId;
  approval.notes = notes ?? null;
  approval.resolvedAt = nowISO();

  appStore.auditEvents.push({
    id: generateId('aud'),
    entityType: 'Approval',
    entityId: approvalId,
    action: 'REJECTED',
    actor: operatorId,
    beforeState: before as unknown as Record<string, unknown>,
    afterState: { status: 'REJECTED', operatorId, notes },
    timestamp: nowISO(),
  });

  return approval;
}
