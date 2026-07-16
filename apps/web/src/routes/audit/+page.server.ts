import type { PageServerLoad } from './$types';
import { getDb } from '$lib/store';

export const load: PageServerLoad = async ({ url, platform }) => {
  const db = getDb(platform);
  const page = Number(url.searchParams.get('page') ?? '1');
  return await db.audit.findAll(page, 50);
};
