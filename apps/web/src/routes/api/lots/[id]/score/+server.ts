// POST /api/lots/:id/score — trigger opportunity scoring for a lot
import type { RequestHandler } from '@sveltejs/kit';
import { store, addAuditEvent } from '$lib/store';
import { jsonOk, jsonError } from '$lib/validation';
import { scoreLot } from '../../../../../agents/scorer';

export const POST: RequestHandler = ({ params }) => {
  const lot = store.lots.find(l => l.id === params.id);
  if (!lot) return jsonError('Lot not found', 404);

  const before = { status: lot.status, score: lot.score };
  const scored = scoreLot(lot, store.facilities, store.foodBanks);

  lot.score = scored.score;
  lot.scoreBreakdown = scored.scoreBreakdown;
  if (lot.status === 'AVAILABLE') lot.status = 'SCORING';

  addAuditEvent({
    entityType: 'SurplusLot',
    entityId: lot.id,
    action: 'SCORED',
    actor: 'agent:scorer',
    beforeState: before,
    afterState: { score: lot.score, scoreBreakdown: lot.scoreBreakdown, status: lot.status },
  });

  return jsonOk({ lot, scoreBreakdown: scored.scoreBreakdown });
};
