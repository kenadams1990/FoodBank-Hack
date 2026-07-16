// POST /api/approvals — create approval request
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/store';
import { CreateApprovalSchema } from '$lib/validation';

export const GET: RequestHandler = () => {
  return json({ approvals: db.approvals.findAll() });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const parsed = CreateApprovalSchema.safeParse(body);
  if (!parsed.success) throw error(400, parsed.error.message);

  const approval = db.approvals.create({
    approvalType: parsed.data.approvalType,
    entityId: parsed.data.entityId,
    draftPayload: parsed.data.draftPayload,
    operatorId: parsed.data.operatorId ?? '',
    status: 'PENDING',
    notes: parsed.data.notes,
  });

  return json(approval, { status: 201 });
};
