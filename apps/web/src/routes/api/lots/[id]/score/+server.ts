// POST /api/lots/:id/score — trigger opportunity scoring
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/store';
import { scoreLot } from '$agents/scorer';
import { CANNING_FACILITIES, FOOD_BANKS } from '$shared/mockData';

export const POST: RequestHandler = async ({ params, platform }) => {
  const db = getDb(platform);
  const lot = await db.lots.findById(params.id);
  if (!lot) throw error(404, `Lot ${params.id} not found`);

  const breakdown = scoreLot(lot, CANNING_FACILITIES, FOOD_BANKS);
  await db.lots.update(lot.id, { score: breakdown.total, status: 'SCORED' });

  return json({ lotId: lot.id, score: breakdown });
};
