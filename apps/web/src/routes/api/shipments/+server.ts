// GET /api/shipments — logistics board data
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore } from '$lib/store';

export const GET: RequestHandler = () => {
  const enriched = appStore.shipments.map((s) => ({
    ...s,
    lot: appStore.lots.find((l) => l.id === s.lotId),
    facility: appStore.facilities.find((f) => f.id === s.facilityId),
    foodBank: appStore.foodBanks.find((b) => b.id === s.foodBankId),
  }));
  return json({ shipments: enriched });
};
