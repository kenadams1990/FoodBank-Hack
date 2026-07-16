// GET /api/shipments — logistics board data
import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/store';
import { jsonOk } from '$lib/validation';

export const GET: RequestHandler = () => {
  const enriched = store.shipments.map(shp => ({
    ...shp,
    lot: store.lots.find(l => l.id === shp.lotId),
    facility: store.facilities.find(f => f.id === shp.facilityId),
    foodBank: store.foodBanks.find(fb => fb.id === shp.foodBankId),
  }));
  return jsonOk({ shipments: enriched });
};
