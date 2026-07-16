import type { PageServerLoad } from './$types';
import { db } from '$lib/store';

export const load: PageServerLoad = ({ url }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  return db.audit.findAll(page, 50);
};
