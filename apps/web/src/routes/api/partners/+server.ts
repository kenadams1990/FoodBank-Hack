// GET /api/partners — supplier + food bank directory
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/store';

export const GET: RequestHandler = ({ url }) => {
  const q = url.searchParams.get('q')?.toLowerCase() ?? '';
  let suppliers = db.suppliers.findAll();
  let foodBanks = db.foodBanks.findAll();

  if (q) {
    suppliers = suppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    );
    foodBanks = foodBanks.filter(fb =>
      fb.name.toLowerCase().includes(q) ||
      fb.region.toLowerCase().includes(q) ||
      fb.location.toLowerCase().includes(q)
    );
  }

  return json({ suppliers, foodBanks });
};
