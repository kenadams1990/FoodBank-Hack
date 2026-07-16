// GET /api/audit — paginated audit log
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { appStore } from '$lib/store';
import { AuditFilterSchema } from '$lib/validation';

export const GET: RequestHandler = ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const filter = AuditFilterSchema.safeParse(params);
  if (!filter.success) return json({ error: filter.error.flatten() }, { status: 400 });

  const { page, pageSize, entityType } = filter.data;
  let events = [...appStore.auditEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  if (entityType) events = events.filter((e) => e.entityType === entityType);

  const total = events.length;
  const start = (page - 1) * pageSize;
  const items = events.slice(start, start + pageSize);

  return json({ events: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
};
