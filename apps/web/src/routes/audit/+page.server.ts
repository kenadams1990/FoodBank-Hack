import type { PageServerLoad } from './$types';
import { getDb } from '$lib/store';

export const load: PageServerLoad = async ({ url, platform }) => {
  const db = getDb(platform);
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageResult = await db.audit.findAll(page, 50);

  // Derive the "operator decisions" stat from real data rather than a fixed
  // number — an operator decision is any audit event whose actor is an
  // operator (operator:*). Pull the full set (well under the page size here)
  // so the count reflects the whole log, not just the current page.
  const all = await db.audit.findAll(1, 100_000);
  const operatorDecisions = all.events.filter((e) => e.actor?.startsWith('operator:')).length;

  return { ...pageResult, operatorDecisions };
};
