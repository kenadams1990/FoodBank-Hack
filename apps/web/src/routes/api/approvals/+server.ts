// POST /api/approvals — create a new approval request
import type { RequestHandler } from '@sveltejs/kit';
import { jsonOk, jsonError, requireOperator } from '$lib/validation';
import { CreateApprovalSchema } from '$lib/validation';
import { createApprovalRequest, getApprovals } from '../../../../agents/approvals';

export const GET: RequestHandler = () => {
  return jsonOk({ approvals: getApprovals() });
};

export const POST: RequestHandler = async ({ request }) => {
  requireOperator(request);
  let body: unknown;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON'); }

  const parsed = CreateApprovalSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { approvalType, entityId, entityType, rationale } = parsed.data;
  const approval = createApprovalRequest(approvalType, entityId, entityType, rationale, 'operator');
  return jsonOk({ approval }, 201);
};
