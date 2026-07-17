// POST /api/intake/run — run the intake pipeline for one vessel catch log and
// persist the drafts (lot → SCORED, PENDING procurement approval). Returns the
// full run so the page can reveal the downstream agent decisions.
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runIntake } from '$lib/server/intakePipeline';

export const POST: RequestHandler = async ({ request, platform }) => {
  const body = (await request.json().catch(() => null)) as { catchLogId?: string } | null;
  if (!body?.catchLogId) throw error(400, 'catchLogId is required');

  try {
    const result = await runIntake(body.catchLogId, platform);
    return json(result);
  } catch (e) {
    throw error(404, e instanceof Error ? e.message : 'Intake run failed');
  }
};
