// PATCH /api/approvals/:id — approve or reject (OPERATOR only, idempotent)
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/store';
import { PatchApprovalSchema } from '$lib/validation';

export const GET: RequestHandler = async ({ params, platform }) => {
  const db = getDb(platform);
  const approval = await db.approvals.findById(params.id);
  if (!approval) throw error(404, `Approval ${params.id} not found`);
  return json(approval);
};

export const PATCH: RequestHandler = async ({ params, request, platform }) => {
  const db = getDb(platform);
  const body = await request.json().catch(() => null);
  const parsed = PatchApprovalSchema.safeParse(body);
  if (!parsed.success) throw error(400, parsed.error.message);

  const approval = await db.approvals.findById(params.id);
  if (!approval) throw error(404, `Approval ${params.id} not found`);

  // Idempotency — same status is a no-op
  if (approval.status === parsed.data.status) return json(approval);
  if (approval.status !== 'PENDING') throw error(409, `Approval already ${approval.status}`);

  const updated = await db.approvals.update(params.id, {
    status: parsed.data.status,
    operatorId: parsed.data.operatorId,
    notes: parsed.data.notes,
    resolvedAt: new Date().toISOString(),
  });

  // If approved procurement, advance lot status
  if (parsed.data.status === 'APPROVED' && approval.approvalType === 'PROCUREMENT') {
    await db.lots.update(approval.entityId, { status: 'PROCUREMENT_CONFIRMED' });
  }
  if (parsed.data.status === 'APPROVED' && approval.approvalType === 'FACILITY_BOOKING') {
    await db.lots.update(approval.entityId, { status: 'IN_PRODUCTION' });
  }
  if (parsed.data.status === 'APPROVED' && approval.approvalType === 'DELIVERY_RELEASE') {
    await db.lots.update(approval.entityId, { status: 'SHIPPED' });
  }

  return json(updated);
};
