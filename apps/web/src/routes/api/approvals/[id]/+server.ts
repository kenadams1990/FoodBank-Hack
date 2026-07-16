// PATCH /api/approvals/:id — approve or reject (OPERATOR only, idempotent)
import type { RequestHandler } from '@sveltejs/kit';
import { store, addAuditEvent } from '$lib/store';
import { jsonOk, jsonError, requireOperator, PatchApprovalSchema } from '$lib/validation';
import { approveAction, rejectAction } from '../../../../../agents/approvals';

export const GET: RequestHandler = ({ params }) => {
  const approval = store.approvals.find(a => a.id === params.id);
  if (!approval) return jsonError('Approval not found', 404);
  return jsonOk({ approval });
};

export const PATCH: RequestHandler = async ({ request, params }) => {
  requireOperator(request);
  let body: unknown;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON'); }

  const parsed = PatchApprovalSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { action, operatorId, notes } = parsed.data;

  let approval;
  try {
    approval = action === 'approve'
      ? approveAction(params.id!, operatorId, notes)
      : rejectAction(params.id!, operatorId, notes);
  } catch (e: unknown) {
    return jsonError(e instanceof Error ? e.message : 'Unknown error');
  }

  // Propagate status to lot if procurement approval
  if (approval.approvalType === 'PROCUREMENT') {
    const lot = store.lots.find(l => l.id === approval.entityId);
    if (lot) {
      const before = { status: lot.status };
      lot.status = approval.status === 'APPROVED' ? 'PROCUREMENT_CONFIRMED' : 'AVAILABLE';
      addAuditEvent({
        entityType: 'SurplusLot',
        entityId: lot.id,
        action: 'STATUS_CHANGED',
        actor: operatorId,
        beforeState: before,
        afterState: { status: lot.status },
      });
    }
  }

  if (approval.approvalType === 'FACILITY_BOOKING') {
    const lot = store.lots.find(l => l.id === approval.entityId);
    if (lot && approval.status === 'APPROVED') {
      const before = { status: lot.status };
      lot.status = 'IN_PRODUCTION';
      addAuditEvent({
        entityType: 'SurplusLot', entityId: lot.id, action: 'STATUS_CHANGED',
        actor: operatorId, beforeState: before, afterState: { status: 'IN_PRODUCTION' },
      });
    }
  }

  if (approval.approvalType === 'DELIVERY_RELEASE') {
    const lot = store.lots.find(l => l.id === approval.entityId);
    if (lot && approval.status === 'APPROVED') {
      const before = { status: lot.status };
      lot.status = 'SHIPPED';
      addAuditEvent({
        entityType: 'SurplusLot', entityId: lot.id, action: 'STATUS_CHANGED',
        actor: operatorId, beforeState: before, afterState: { status: 'SHIPPED' },
      });
    }
  }

  return jsonOk({ approval });
};
