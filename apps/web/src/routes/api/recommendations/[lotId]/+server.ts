// GET /api/recommendations/:lotId — full agent recommendation bundle
import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/store';
import { jsonOk, jsonError } from '$lib/validation';
import { runPipeline } from '../../../../agents/pipeline';

export const GET: RequestHandler = ({ params }) => {
  const lot = store.lots.find(l => l.id === params.lotId);
  if (!lot) return jsonError('Lot not found', 404);

  const supplier = store.suppliers.find(s => s.id === lot.supplierId);
  if (!supplier) return jsonError('Supplier not found', 404);

  const result = runPipeline(
    lot,
    supplier,
    store.quotes,
    store.facilities,
    store.foodBanks
  );

  return jsonOk(result);
};
