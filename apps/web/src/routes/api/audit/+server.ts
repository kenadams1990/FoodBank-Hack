// GET /api/audit — paginated audit log
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/store';
import { AuditQuerySchema } from '$lib/validation';

export const GET: RequestHandler = async ({ url, platform }) => {
  const db = getDb(platform);
  const params = Object.fromEntries(url.searchParams);
  const parsed = AuditQuerySchema.safeParse(params);
  const { page, perPage } = parsed.success ? parsed.data : { page: 1, perPage: 50 };

  const result = await db.audit.findAll(page, perPage);
  return json({ ...result, page, perPage });
};
