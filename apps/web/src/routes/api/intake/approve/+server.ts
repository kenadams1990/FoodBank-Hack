// POST /api/intake/approve — resolve an operator's decision on an intake-run
// approval. APPROVE advances the lot to PROCUREMENT_CONFIRMED and schedules an
// ACCFB shipment; REJECT leaves the lot SCORED. Both are audited by the store.
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decideIntake } from '$lib/server/intakePipeline';

export const POST: RequestHandler = async ({ request, platform }) => {
  const body = (await request.json().catch(() => null)) as
    | { approvalId?: string; decision?: 'APPROVE' | 'REJECT'; operatorId?: string; notes?: string }
    | null;
  if (!body?.approvalId) throw error(400, 'approvalId is required');
  const decision = body.decision === 'REJECT' ? 'REJECT' : 'APPROVE';

  try {
    const result = await decideIntake(
      body.approvalId,
      decision,
      body.operatorId?.trim() || 'operator:demo',
      platform,
      body.notes
    );
    return json(result);
  } catch (e) {
    throw error(400, e instanceof Error ? e.message : 'Approval failed');
  }
};
