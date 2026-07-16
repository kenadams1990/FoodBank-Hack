// PATCH /api/approvals/:id — approve or reject (idempotent, OPERATOR role)
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore, emitAudit } from '$lib/store';
import { PatchApprovalSchema } from '$lib/validation';

export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const parsed = PatchApprovalSchema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.flatten() }, { status: 400 });

  const approval = appStore.approvals.find((a) => a.id === params.id);
  if (!approval) return json({ error: 'Approval not found' }, { status: 404 });

  const { action, operatorId, notes } = parsed.data;
  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  // Idempotent: already in target state = no-op
  if (approval.status === newStatus) return json({ approval });
  // Cannot override a terminal state with the opposite
  if (approval.status !== 'PENDING') {
    return json({ error: `Approval is already ${approval.status}` }, { status: 409 });
  }

  const before = { ...approval };
  approval.status = newStatus;
  approval.operatorId = operatorId;
  approval.notes = notes ?? null;
  approval.resolvedAt = new Date().toISOString();

  emitAudit('Approval', approval.id, newStatus, operatorId,
    before as unknown as Record<string, unknown>,
    { status: newStatus, operatorId, notes });

  // Side-effect: advance lot status on PROCUREMENT approval
  if (newStatus === 'APPROVED' && approval.approvalType === 'PROCUREMENT') {
    const lot = appStore.lots.find((l) => l.id === approval.entityId);
    if (lot && (lot.status === 'SCORED' || lot.status === 'PENDING_PROCUREMENT' || lot.status === 'AVAILABLE')) {
      const lotBefore = { status: lot.status };
      lot.status = 'PROCUREMENT_CONFIRMED';
      emitAudit('SurplusLot', lot.id, 'STATUS_CHANGE', 'system', lotBefore, { status: 'PROCUREMENT_CONFIRMED' });
    }
  }

  return json({ approval });
};
