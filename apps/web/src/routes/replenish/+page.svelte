<script lang="ts">
  import { draftReplenishmentList } from '../../../../../apps/agents/replenish.js';
  import { FOOD_BANKS, SURPLUS_LOTS, FOOD_BANK_INVENTORY, DISTRIBUTION_EVENTS } from '../../../../../packages/shared/src/mockData.js';
  import type { ReplenishmentList } from '../../../../../packages/shared/src/types';

  // Food banks that have inventory data in the mock
  const SUPPORTED_FB_IDS = ['fb-001', 'fb-002', 'fb-003'];
  const selectableFoodBanks = FOOD_BANKS.filter((fb) => SUPPORTED_FB_IDS.includes(fb.id));

  let selectedFbId = 'fb-001';

  $: selectedFoodBank = FOOD_BANKS.find((fb) => fb.id === selectedFbId)!;
  $: peerFoodBanks = FOOD_BANKS.filter((fb) => fb.id !== selectedFbId);

  $: replenishmentList = draftReplenishmentList(
    selectedFoodBank,
    FOOD_BANK_INVENTORY,
    DISTRIBUTION_EVENTS,
    SURPLUS_LOTS,
    peerFoodBanks,
    2
  ) satisfies ReplenishmentList;

  // Approval state — draft only, no backend mutation
  let approved = new Set<string>();
  function toggleApprove(item: string) {
    const next = new Set(approved);
    if (next.has(item)) { next.delete(item); } else { next.add(item); }
    approved = next;
  }
  function approveAll() {
    approved = new Set(replenishmentList.lineItems.map((l) => l.item));
  }
  $: allApproved = replenishmentList.lineItems.length > 0 &&
    replenishmentList.lineItems.every((l) => approved.has(l.item));

  // Source badge colour
  function sourceBadgeClass(type: string): string {
    if (type === 'SURPLUS_LOT')      return 'bg-teal-100 text-teal-700';
    if (type === 'LATERAL_TRANSFER') return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
  }

  // Weeks-remaining colour
  function weeksClass(w: number): string {
    if (w === 0)  return 'text-red-600 font-bold';
    if (w <= 1)   return 'text-red-500 font-semibold';
    if (w <= 2)   return 'text-amber-600 font-medium';
    return 'text-green-600';
  }

  // Reset approvals when food bank changes
  $: { selectedFbId; approved = new Set(); }
</script>

<svelte:head><title>Replenishment — TIDELIFT</title></svelte:head>

<!-- Page header -->
<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
  <div>
    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 mb-1">Smart Reorder</p>
    <h1 class="font-display font-bold text-2xl text-ink">Replenishment List</h1>
    <p class="font-mono text-xs text-ink/40 mt-1 max-w-xl">
      Stock projections against upcoming distributions + seasonal demand. Agent recommends quantities and sources — you approve.
    </p>
  </div>

  <!-- Food bank selector -->
  <div class="flex flex-col gap-1">
    <label for="fb-select" class="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/40">Food Bank</label>
    <select
      id="fb-select"
      bind:value={selectedFbId}
      class="font-sans text-sm border border-line rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
    >
      {#each selectableFoodBanks as fb}
        <option value={fb.id}>{fb.name}</option>
      {/each}
    </select>
  </div>
</div>

<!-- Summary header card -->
<div class="bg-white border border-line rounded-xl p-5 mb-6">
  <div class="flex flex-wrap items-center gap-4">
    <div class="flex-1 min-w-0">
      <p class="font-display font-semibold text-base text-ink">{replenishmentList.foodBankName}</p>
      <p class="font-mono text-[11px] text-ink/40 mt-0.5">
        Generated {new Date(replenishmentList.generatedAt).toLocaleString()} ·
        {replenishmentList.planningHorizonWeeks}-week horizon
      </p>
    </div>

    <div class="flex items-center gap-3">
      {#if replenishmentList.criticalCount > 0}
        <div class="text-center">
          <p class="font-display font-extrabold text-2xl text-alert tabular-nums">{replenishmentList.criticalCount}</p>
          <p class="font-mono text-[10px] text-alert/70 uppercase tracking-wider">Critical</p>
        </div>
      {/if}
      {#if replenishmentList.lineItems.length > 0}
        <div class="text-center">
          <p class="font-display font-extrabold text-2xl text-ink tabular-nums">{replenishmentList.lineItems.length}</p>
          <p class="font-mono text-[10px] text-ink/40 uppercase tracking-wider">Items flagged</p>
        </div>
        <div class="text-center">
          <p class="font-display font-extrabold text-2xl text-brand tabular-nums">{replenishmentList.totalSuggestedLbs.toLocaleString()}</p>
          <p class="font-mono text-[10px] text-brand/60 uppercase tracking-wider">Lbs suggested</p>
        </div>
      {:else}
        <span class="chip-ok">All stock above threshold</span>
      {/if}
    </div>
  </div>
</div>

{#if replenishmentList.lineItems.length > 0}
  <!-- Approve all bar -->
  <div class="flex items-center justify-between mb-3">
    <p class="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/40">
      {approved.size} of {replenishmentList.lineItems.length} items approved
    </p>
    <button
      on:click={approveAll}
      disabled={allApproved}
      class="px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition
        {allApproved
          ? 'bg-ok/20 text-ok cursor-default'
          : 'bg-brand text-white hover:bg-brand/80'}"
    >
      {allApproved ? '✓ All Approved (draft)' : 'Approve All (draft)'}
    </button>
  </div>

  <!-- Line items table -->
  <div class="bg-white border border-line rounded-xl overflow-hidden">
    <table class="w-full">
      <thead>
        <tr class="border-b border-line">
          <th class="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/30 text-left px-5 py-3">Item</th>
          <th class="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/30 text-right px-4 py-3">On Hand</th>
          <th class="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/30 text-right px-4 py-3">Weeks Left</th>
          <th class="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/30 text-right px-4 py-3">Suggest (lbs)</th>
          <th class="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/30 text-left px-4 py-3">Source</th>
          <th class="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/30 text-left px-4 py-3 hidden md:table-cell">Source Detail</th>
          <th class="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/30 text-center px-4 py-3">Approve</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        {#each replenishmentList.lineItems as line}
          <tr class="{approved.has(line.item) ? 'bg-ok/5' : 'hover:bg-surface/60'} transition">

            <!-- Item -->
            <td class="px-5 py-3">
              <p class="font-display font-semibold text-sm text-ink capitalize">{line.item}</p>
              <div class="mt-1">
                <!-- Shortage score bar -->
                <div class="h-1 w-16 bg-line rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all
                      {line.shortageScore >= 1 ? 'bg-alert' : line.shortageScore >= 0.5 ? 'bg-warn' : 'bg-brand'}"
                    style="width: {(line.shortageScore * 100).toFixed(0)}%"
                  ></div>
                </div>
              </div>
            </td>

            <!-- On hand -->
            <td class="px-4 py-3 text-right">
              <span class="font-mono text-sm text-ink/70">{line.onHandLbs.toLocaleString()} lbs</span>
            </td>

            <!-- Weeks left -->
            <td class="px-4 py-3 text-right">
              <span class="font-mono text-sm {weeksClass(line.weeksOfStockRemaining)}">
                {line.weeksOfStockRemaining === 0 ? '0 — critical' : `${line.weeksOfStockRemaining}w`}
              </span>
            </td>

            <!-- Suggested lbs -->
            <td class="px-4 py-3 text-right">
              <span class="font-display font-bold text-sm text-brand tabular-nums">
                {line.suggestedLbs.toLocaleString()}
              </span>
            </td>

            <!-- Source type badge -->
            <td class="px-4 py-3">
              <span class="text-[10px] font-mono font-semibold px-2 py-1 rounded-full {sourceBadgeClass(line.sourceType)}">
                {line.sourceType.replace('_', ' ')}
              </span>
            </td>

            <!-- Source detail (hidden on mobile) -->
            <td class="px-4 py-3 hidden md:table-cell">
              <p class="font-sans text-xs text-ink/60 max-w-xs truncate" title={line.sourceLabel}>
                {line.sourceLabel}
              </p>
            </td>

            <!-- Approve button -->
            <td class="px-4 py-3 text-center">
              <button
                on:click={() => toggleApprove(line.item)}
                class="px-3 py-1 rounded-lg text-xs font-semibold font-sans transition
                  {approved.has(line.item)
                    ? 'bg-ok/20 text-ok'
                    : 'bg-line text-ink/50 hover:bg-brand hover:text-white'}"
              >
                {approved.has(line.item) ? '✓ Approved' : 'Approve'}
              </button>
            </td>
          </tr>

          <!-- Expandable reason row -->
          <tr class="{approved.has(line.item) ? 'bg-ok/5' : ''}">
            <td colspan="7" class="px-5 pb-3 pt-0">
              <p class="font-mono text-[10px] text-ink/35 leading-relaxed">{line.reason}</p>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- HITL footer -->
  <div class="mt-4 px-1">
    <p class="font-mono text-[11px] text-ink/30 italic">{replenishmentList.reason}</p>
  </div>

{:else}
  <!-- Empty state -->
  <div class="bg-white border border-line rounded-xl p-12 text-center">
    <svg class="mx-auto mb-4 text-ok/40" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="1.5"/>
      <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <p class="font-display font-semibold text-ink/40">{replenishmentList.reason}</p>
    <p class="font-mono text-[11px] text-ink/25 mt-2">All items at {selectedFoodBank.name} are above the 2-week threshold.</p>
  </div>
{/if}
