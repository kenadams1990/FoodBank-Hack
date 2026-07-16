// GET /api/recommendations/:lotId — full agent recommendation bundle
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/store';
import { runPipeline } from '$agents/pipeline';

export const GET: RequestHandler = ({ params }) => {
  const lot = db.lots.findById(params.lotId);
  if (!lot) throw error(404, `Lot ${params.lotId} not found`);

  const quotes = db.quotes.findByLotId(lot.id);
  const facilities = db.facilities.findAll();
  const foodBanks = db.foodBanks.findAll();

  const result = runPipeline(lot, quotes, facilities, foodBanks);
  return json(result);
};
