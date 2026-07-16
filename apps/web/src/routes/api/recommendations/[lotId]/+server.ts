// GET /api/recommendations/:lotId — full agent recommendation bundle
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore } from '$lib/store';
import { runPipeline } from '../../../../../agents/pipeline';

export const GET: RequestHandler = ({ params }) => {
  const lot = appStore.lots.find((l) => l.id === params.lotId);
  if (!lot) return json({ error: 'Lot not found' }, { status: 404 });

  const bundle = runPipeline(lot);
  return json(bundle);
};
