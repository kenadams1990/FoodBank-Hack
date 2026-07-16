// GET /api/partners — supplier + food bank directory
import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/store';
import { jsonOk } from '$lib/validation';

export const GET: RequestHandler = ({ url }) => {
  const q = url.searchParams.get('q')?.toLowerCase() ?? '';

  const suppliers = store.suppliers.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
  );
  const foodBanks = store.foodBanks.filter(fb =>
    !q || fb.name.toLowerCase().includes(q) || fb.location.toLowerCase().includes(q)
  );

  return jsonOk({ suppliers, foodBanks });
};
