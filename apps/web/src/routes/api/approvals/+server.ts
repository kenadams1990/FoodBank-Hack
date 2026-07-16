// POST /api/approvals — create an approval request
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore, emitAudit } from '$lib/store';
import { CreateApprovalSchema } from '$lib/validation';

export const GET: RequestHandler = () => {
  return json({ approvals: appStore.approvals });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const parsed = CreateApprovalSchema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.flatten() }, { status: 400 });

  const { approvalType, entityId, entityType, draftPayload } = parsed.data;
  const approval = {
    id: `apr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    approvalType,
    status: 'PENDING' as const,
    entityId,
    entityType,
    operatorId: null,
    draftPayload,
    notes: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  appStore.approvals.push(approval);
  emitAudit('Approval', approval.id, 'CREATED', 'system', null, { status: 'PENDING', approvalType, entityId });

  return json({ approval }, { status: 201 });
};
