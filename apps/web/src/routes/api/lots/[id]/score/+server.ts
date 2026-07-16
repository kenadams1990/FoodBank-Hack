// POST /api/lots/:id/score — trigger opportunity scoring for a lot
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore, emitAudit } from '$lib/store';
import { scoreLot } from '../../../../../../agents/scorer';

export const POST: RequestHandler = ({ params }) => {
  const lot = appStore.lots.find((l) => l.id === params.id);
  if (!lot) return json({ error: 'Lot not found' }, { status: 404 });

  const score = scoreLot(lot, appStore.foodBanks, appStore.facilities);
  const before = { score: lot.score, status: lot.status };
  lot.score = score.score;
  if (lot.status === 'AVAILABLE') lot.status = 'SCORED';

  emitAudit('SurplusLot', lot.id, 'SCORED', 'system', before, { score: score.score, status: lot.status });

  return json({ lot, score });
};
