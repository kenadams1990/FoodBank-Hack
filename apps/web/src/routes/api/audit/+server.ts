// GET /api/audit — paginated audit log
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/store';
import { AuditQuerySchema } from '$lib/validation';

export const GET: RequestHandler = ({ url }) => {
  const params = Object.fromEntries(url.searchParams);
  const parsed = AuditQuerySchema.safeParse(params);
  const { page, perPage } = parsed.success ? parsed.data : { page: 1, perPage: 50 };

  const result = db.audit.findAll(page, perPage);
  return json({ ...result, page, perPage });
};
