// GET /api/lots — list surplus lots with scoring metadata
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore } from '$lib/store';
import { LotFilterSchema } from '$lib/validation';
import { scoreLot } from '../../../../../agents/scorer';

export const GET: RequestHandler = ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filter = LotFilterSchema.safeParse(params);
  if (!filter.success) return json({ error: filter.error.flatten() }, { status: 400 });

  let lots = appStore.lots;
  const { species, status, minScore, maxScore } = filter.data;
  if (species) lots = lots.filter((l) => l.species === species);
  if (status) lots = lots.filter((l) => l.status === status);

  const withScores = lots.map((lot) => {
    const scored = lot.score != null
      ? lot
      : { ...lot, score: scoreLot(lot, appStore.foodBanks, appStore.facilities).score };
    return scored;
  });

  const filtered = withScores.filter((l) => {
    if (minScore != null && (l.score ?? 0) < minScore) return false;
    if (maxScore != null && (l.score ?? 0) > maxScore) return false;
    return true;
  });

  return json({ lots: filtered, total: filtered.length });
};
