// analyst.ts — NL Analyst Agent
// Wraps all pipeline data into human-readable briefs for any team member.

import type { SurplusAlert, CanningJob, AgencyNeed } from '@tidelift/shared';

export function generateBrief(params: {
  alert: SurplusAlert;
  canningJob: CanningJob;
  deliveredTo: { neighborhood: string; cansAllocated: number }[];
}): string {
  const { alert, canningJob, deliveredTo } = params;
  const totalCans = deliveredTo.reduce((s, d) => s + d.cansAllocated, 0);
  return [
    `## TideLift Operations Brief`,
    ``,
    `**Surplus**: ${alert.lbs.toLocaleString()} lbs of ${alert.species} from ${alert.landingAt}.`,
    `**Discount secured**: ${alert.proposedDiscountPct}% off market ($${alert.marketPricePerLb}/lb).`,
    `**Canning**: ${canningJob.cansTarget.toLocaleString()} cans targeted at co-packer ${canningJob.coPackerId}.`,
    `**Delivered**: ${totalCans.toLocaleString()} cans across ${deliveredTo.length} neighborhood(s):`,
    ...deliveredTo.map(
      (d) => `  - ${d.neighborhood}: ${d.cansAllocated.toLocaleString()} cans`
    ),
    ``,
    `_Agent recommends. You decide._`,
  ].join('\n');
}
