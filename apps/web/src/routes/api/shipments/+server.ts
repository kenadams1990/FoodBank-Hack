// GET /api/shipments — logistics board data
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/store';

export const GET: RequestHandler = () => {
  const shipments = db.shipments.findAll();
  const lots = db.lots.findAll();

  // Group lots by kanban column
  const kanban = {
    PENDING_APPROVAL: lots.filter(l => ['AVAILABLE', 'SCORED', 'PROCUREMENT_PENDING'].includes(l.status)),
    PROCUREMENT_CONFIRMED: lots.filter(l => l.status === 'PROCUREMENT_CONFIRMED'),
    IN_PRODUCTION: lots.filter(l => l.status === 'IN_PRODUCTION'),
    SHIPPED: lots.filter(l => l.status === 'SHIPPED'),
    DELIVERED: lots.filter(l => l.status === 'DELIVERED'),
  };

  return json({ shipments, kanban });
};
