// GET /api/lots — list surplus lots with optional filters
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/store';
import { LotFilterSchema } from '$lib/validation';

export const GET: RequestHandler = async ({ url, platform }) => {
  const db = getDb(platform);
  const params = Object.fromEntries(url.searchParams);
  const filter = LotFilterSchema.safeParse(params);

  let lots = await db.lots.findAll();

  if (filter.success) {
    const { species, status, minScore, maxScore } = filter.data;
    if (species) lots = lots.filter(l => l.species === species);
    if (status) lots = lots.filter(l => l.status === status);
    if (minScore !== undefined) lots = lots.filter(l => (l.score ?? 0) >= minScore!);
    if (maxScore !== undefined) lots = lots.filter(l => (l.score ?? 0) <= maxScore!);
  }

  return json({ lots, total: lots.length });
};
