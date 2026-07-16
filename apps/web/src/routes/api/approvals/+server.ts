// POST /api/approvals — create approval request
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/store';
import { CreateApprovalSchema } from '$lib/validation';

export const GET: RequestHandler = async ({ platform }) => {
  const db = getDb(platform);
  return json({ approvals: await db.approvals.findAll() });
};

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = getDb(platform);
  const body = await request.json().catch(() => null);
  const parsed = CreateApprovalSchema.safeParse(body);
  if (!parsed.success) throw error(400, parsed.error.message);

  const approval = await db.approvals.create({
    approvalType: parsed.data.approvalType,
    entityId: parsed.data.entityId,
    draftPayload: parsed.data.draftPayload,
    operatorId: parsed.data.operatorId ?? '',
    status: 'PENDING',
    notes: parsed.data.notes,
  });

  return json(approval, { status: 201 });
};
