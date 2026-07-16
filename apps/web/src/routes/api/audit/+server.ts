// GET /api/audit — paginated audit log
import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/store';
import { AuditQuerySchema, jsonOk, jsonError } from '$lib/validation';

export const GET: RequestHandler = ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const parsed = AuditQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError(parsed.error.message);

  const { page, pageSize, entityType, entityId } = parsed.data;

  let events = [...store.auditEvents].reverse(); // newest first
  if (entityType) events = events.filter(e => e.entityType === entityType);
  if (entityId) events = events.filter(e => e.entityId === entityId);

  const total = events.length;
  const start = (page - 1) * pageSize;
  const items = events.slice(start, start + pageSize);

  return jsonOk({ events: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
};
