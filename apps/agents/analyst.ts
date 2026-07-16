// analyst.ts — NL Analyst Agent
// Wraps all pipeline data into human-readable briefs for any team member.

import type { SurplusAlert, CanningJob } from '../../packages/shared/src/types';

export function generateBrief(params: {
  alert: SurplusAlert;
  canningJob: CanningJob;
  deliveredTo: { neighborhood: string; cansAllocated: number }[];
}): string {
  const { alert, canningJob, deliveredTo } = params;
  const totalCans = deliveredTo.reduce((s, d) => s + d.cansAllocated, 0);
  const totalCost = Math.round(alert.marketPricePerLb * (1 - alert.proposedDiscountPct / 100) * alert.lbs * 100) / 100;
  const marketCost = Math.round(alert.marketPricePerLb * alert.lbs * 100) / 100;
  const savings = Math.round((marketCost - totalCost) * 100) / 100;
  return [
    `## TideLift Operations Brief`,
    ``,
    `**Surplus**: ${alert.lbs.toLocaleString()} lbs of ${alert.species} from ${alert.landingAt}.`,
    `**Discount secured**: ${alert.proposedDiscountPct}% off market ($${alert.marketPricePerLb}/lb → $${(alert.marketPricePerLb * (1 - alert.proposedDiscountPct / 100)).toFixed(2)}/lb).`,
    `**Cost avoided vs. market**: $${savings.toLocaleString()}.`,
    `**Canning**: ${canningJob.cansTarget.toLocaleString()} cans targeted at co-packer ${canningJob.coPackerId}.`,
    `**Delivered**: ${totalCans.toLocaleString()} cans across ${deliveredTo.length} partner(s):`,
    ...deliveredTo.map(d => `  - ${d.neighborhood}: ${d.cansAllocated.toLocaleString()} cans`),
    `**Meals estimated**: ${(totalCans * 1).toLocaleString()} (1 meal/can, 400g baseline).`,
    ``,
    `_Agent recommends. You decide._`,
  ].join('\n');
}
