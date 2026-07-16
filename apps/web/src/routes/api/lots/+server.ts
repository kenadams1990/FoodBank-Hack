// GET /api/lots — list surplus lots with scoring metadata
import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/store';
import { LotFilterSchema, jsonOk, jsonError } from '$lib/validation';
import { rankLots } from '../../../../agents/scorer';

export const GET: RequestHandler = ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const parsed = LotFilterSchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { species, status, minScore, maxScore } = parsed.data;

  // Score all lots against current store state
  const scored = rankLots(store.lots, store.facilities, store.foodBanks);

  // Also include non-AVAILABLE lots with their existing scores
  const others = store.lots
    .filter(l => l.status !== 'AVAILABLE' && l.status !== 'SCORING')
    .map(l => ({ ...l, score: l.score ?? 0, scoreBreakdown: l.scoreBreakdown ?? null }));

  let results = [...scored, ...others];

  if (species) results = results.filter(l => l.species === species);
  if (status) results = results.filter(l => l.status === status);
  if (minScore !== undefined) results = results.filter(l => (l.score ?? 0) >= minScore!);
  if (maxScore !== undefined) results = results.filter(l => (l.score ?? 0) <= maxScore!);

  return jsonOk({ lots: results, total: results.length });
};
