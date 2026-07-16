// GET /api/intake — vessel catch logs with dispatch recommendation + dockside sort result
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockCatchLogs, evaluateCatchLog, sortAtDock } from '$agents/intake';

export const GET: RequestHandler = () => {
  const intakes = mockCatchLogs.map((log) => ({
    log,
    dispatch: evaluateCatchLog(log),
    dockResult: sortAtDock(log),
  }));

  return json({ intakes });
};
