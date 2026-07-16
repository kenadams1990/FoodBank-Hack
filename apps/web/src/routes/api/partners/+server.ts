// GET /api/partners — supplier + food bank directory
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore } from '$lib/store';

export const GET: RequestHandler = ({ url }) => {
  const q = url.searchParams.get('q')?.toLowerCase() ?? '';
  const suppliers = appStore.suppliers.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
  );
  const foodBanks = appStore.foodBanks.filter(
    (b) => !q || b.name.toLowerCase().includes(q) || b.region.toLowerCase().includes(q)
  );
  return json({ suppliers, foodBanks });
};
