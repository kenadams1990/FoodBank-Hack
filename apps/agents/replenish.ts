// replenish.ts — Replenishment List Agent
//
// Generates a per-food-bank draft replenishment list that works like a smart
// grocery reorder: projects stock runout against upcoming distributions and
// seasonal demand, then recommends the best source for each shortage —
// surplus lot first (rescuing perishables), lateral transfer from a peer food
// bank second, new supplier order as the fallback.
//
// Every output is a DRAFT. Nothing executes automatically.
// "Agent recommends. You decide." (human-in-the-loop product rule.)

import type {
  FoodBank,
  SurplusLot,
  FoodBankInventory,
  DistributionEvent,
  ReplenishmentLineItem,
  ReplenishmentList,
} from '@tidelift/shared';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default planning horizon in weeks. */
export const DEFAULT_WEEKS_AHEAD = 2;

/**
 * Seasonal demand multipliers by species and month (1-indexed).
 * Pacific salmon peaks Jul–Sep; sardine peaks spring; tuna/halibut steady.
 * These are illustrative demo values, not sourced ACCFB figures.
 */
export const SEASONAL_FACTORS: Record<string, number[]> = {
  salmon:  [0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.4, 1.5, 1.4, 1.1, 0.9, 0.8],
  sardine: [0.9, 0.9, 1.2, 1.3, 1.3, 1.1, 0.9, 0.8, 0.8, 0.9, 1.0, 1.0],
  tuna:    [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  halibut: [0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8],
  crab:    [1.2, 1.1, 0.9, 0.8, 0.8, 0.8, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2],
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns the seasonal multiplier for a given item and month (1-indexed). */
function seasonalFactor(item: string, month: number): number {
  const factors = SEASONAL_FACTORS[item.toLowerCase()];
  if (!factors) return 1.0;
  return factors[month - 1] ?? 1.0;
}

/**
 * Projects how many lbs will be consumed from upcoming distribution events
 * within the planning horizon.
 */
function projectedDistributionDemand(
  foodBankId: string,
  item: string,
  events: DistributionEvent[],
  now: Date,
  weeksAhead: number
): number {
  const horizonMs = weeksAhead * 7 * 24 * 3_600_000;
  return events
    .filter(
      (e) =>
        e.foodBankId === foodBankId &&
        new Date(e.date).getTime() >= now.getTime() &&
        new Date(e.date).getTime() <= now.getTime() + horizonMs
    )
    .flatMap((e) => e.itemAllocations)
    .filter((a) => a.item.toLowerCase() === item.toLowerCase())
    .reduce((s, a) => s + a.allocatedLbs, 0);
}

/**
 * Computes how many weeks of stock remain after accounting for upcoming
 * distributions and seasonal demand adjustment.
 */
function weeksOfStockRemaining(
  inv: FoodBankInventory,
  distributionDemandLbs: number,
  month: number
): number {
  const sf = inv.seasonalFactor ?? seasonalFactor(inv.item, month);
  const adjustedWeeklyUsage = inv.avgWeeklyUsageLbs * sf;
  if (adjustedWeeklyUsage <= 0) return 99; // no usage — never runs out
  const postDistributionStock = Math.max(0, inv.onHandLbs - distributionDemandLbs);
  return Math.round((postDistributionStock / adjustedWeeklyUsage) * 10) / 10;
}

/**
 * Finds the best source for a shortage, in priority order:
 * 1. SURPLUS_LOT — AVAILABLE lot matching the species (most urgent expiry first
 *    — rescues perishables simultaneously)
 * 2. LATERAL_TRANSFER — a peer food bank with apparent surplus of the item
 * 3. SUPPLIER_ORDER — fallback: new procurement
 */
function recommendSource(
  item: string,
  neededLbs: number,
  surplusLots: SurplusLot[],
  peerFoodBanks: FoodBank[],
  thisFoodBankId: string,
  now: Date
): Pick<ReplenishmentLineItem, 'sourceType' | 'sourceId' | 'sourceLabel'> {
  // 1. Surplus lot — AVAILABLE, matching species, not yet expired
  const matchingLot = surplusLots
    .filter(
      (l) =>
        l.status === 'AVAILABLE' &&
        l.species.toLowerCase() === item.toLowerCase() &&
        new Date(l.expiryDate).getTime() > now.getTime() &&
        l.lbs >= neededLbs * 0.5 // at least half the need covered
    )
    .sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    )[0];

  if (matchingLot) {
    return {
      sourceType: 'SURPLUS_LOT',
      sourceId: matchingLot.id,
      sourceLabel: `${matchingLot.id} — ${matchingLot.lbs.toLocaleString()} lbs ${matchingLot.species} (expires ${matchingLot.expiryDate})`,
    };
  }

  // 2. Lateral transfer — peer food bank with higher monthly demand (proxy for surplus)
  const peerWithSurplus = peerFoodBanks
    .filter((fb) => fb.id !== thisFoodBankId)
    .sort((a, b) => b.monthlyDemandCases - a.monthlyDemandCases)[0];

  if (peerWithSurplus) {
    return {
      sourceType: 'LATERAL_TRANSFER',
      sourceId: peerWithSurplus.id,
      sourceLabel: `${peerWithSurplus.name} (${peerWithSurplus.location})`,
    };
  }

  // 3. Supplier order fallback
  return {
    sourceType: 'SUPPLIER_ORDER',
    sourceId: `supplier:${item}`,
    sourceLabel: `New supplier order — ${item}`,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Drafts a replenishment list for a single food bank:
 *
 * 1. Projects stock runout per item using on-hand, weekly usage, seasonal
 *    factor, and upcoming distribution draw-downs.
 * 2. Flags items falling below the `weeksAhead` threshold.
 * 3. Scores each shortage (0..1) by urgency.
 * 4. Recommends the best source: surplus lot > lateral transfer > supplier order.
 * 5. Returns a ReplenishmentList draft — always a draft, never an execution.
 *
 * "Agent recommends. You decide."
 */
export function draftReplenishmentList(
  foodBank: FoodBank,
  inventory: FoodBankInventory[],
  distributionEvents: DistributionEvent[],
  surplusLots: SurplusLot[],
  peerFoodBanks: FoodBank[],
  weeksAhead: number = DEFAULT_WEEKS_AHEAD,
  _now: Date = new Date()
): ReplenishmentList {
  const now = _now;
  const month = now.getMonth() + 1; // 1-indexed

  // Filter inventory to this food bank only
  const myInventory = inventory.filter((inv) => inv.foodBankId === foodBank.id);

  const lineItems: ReplenishmentLineItem[] = [];

  for (const inv of myInventory) {
    // Project distribution demand within the horizon
    const distDemand = projectedDistributionDemand(
      foodBank.id,
      inv.item,
      distributionEvents,
      now,
      weeksAhead
    );

    const weeks = weeksOfStockRemaining(inv, distDemand, month);

    // Only flag items running short within the planning horizon
    if (weeks >= weeksAhead) continue;

    // Shortage score: 0..1, higher = more urgent
    const shortageScore = Math.min(1, Math.round(((weeksAhead - weeks) / weeksAhead) * 100) / 100);

    // How many lbs to suggest: cover the gap back to weeksAhead of stock
    const sf = inv.seasonalFactor ?? seasonalFactor(inv.item, month);
    const adjustedWeeklyUsage = inv.avgWeeklyUsageLbs * sf;
    const targetLbs = Math.ceil(adjustedWeeklyUsage * weeksAhead);
    const postDist = Math.max(0, inv.onHandLbs - distDemand);
    const suggestedLbs = Math.max(0, targetLbs - postDist);

    const source = recommendSource(
      inv.item,
      suggestedLbs,
      surplusLots,
      peerFoodBanks,
      foodBank.id,
      now
    );

    const weeksLabel = weeks === 0 ? 'critically out' : `${weeks}w left`;
    const sourceVerb =
      source.sourceType === 'SURPLUS_LOT'
        ? 'Pull from surplus lot'
        : source.sourceType === 'LATERAL_TRANSFER'
          ? 'Request lateral transfer from'
          : 'Place supplier order for';

    lineItems.push({
      item: inv.item,
      onHandLbs: inv.onHandLbs,
      weeksOfStockRemaining: weeks,
      suggestedLbs,
      shortageScore,
      ...source,
      reason:
        `${inv.item} is ${weeksLabel} (${inv.onHandLbs.toLocaleString()} lbs on hand, ` +
        `${adjustedWeeklyUsage.toFixed(0)} lbs/wk seasonal-adjusted). ` +
        `${distDemand > 0 ? `Upcoming distributions draw ${distDemand.toLocaleString()} lbs. ` : ''}` +
        `${sourceVerb} ${source.sourceLabel}. ` +
        `Suggest ordering ${suggestedLbs.toLocaleString()} lbs to restore ${weeksAhead}-week buffer. ` +
        `Agent recommends. You decide.`,
    });
  }

  // Sort by shortageScore descending (most critical first)
  lineItems.sort((a, b) => b.shortageScore - a.shortageScore);

  const criticalCount = lineItems.filter((l) => l.weeksOfStockRemaining === 0).length;
  const totalSuggestedLbs = lineItems.reduce((s, l) => s + l.suggestedLbs, 0);

  const reason =
    lineItems.length === 0
      ? `All inventory at ${foodBank.name} is above the ${weeksAhead}-week threshold. No replenishment needed.`
      : `${lineItems.length} item${lineItems.length > 1 ? 's' : ''} below the ${weeksAhead}-week threshold at ${foodBank.name}. ` +
        `${criticalCount > 0 ? `${criticalCount} critical (0 weeks stock). ` : ''}` +
        `${totalSuggestedLbs.toLocaleString()} lbs total suggested. ` +
        `Agent recommends. You decide.`;

  return {
    generatedAt: now.toISOString(),
    foodBankId: foodBank.id,
    foodBankName: foodBank.name,
    planningHorizonWeeks: weeksAhead,
    lineItems,
    criticalCount,
    totalSuggestedLbs,
    reason,
  };
}
