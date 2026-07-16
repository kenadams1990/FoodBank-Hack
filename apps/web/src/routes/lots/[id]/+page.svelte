<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import RecommendationPanel from '$lib/components/RecommendationPanel.svelte';
  import type { SurplusLot, RecommendationBundle } from '../../../../../packages/shared/src/types';

  let lot: SurplusLot | null = null;
  let bundle: RecommendationBundle | null = null;
  let procurementApprovalId = '';
  let facilityApprovalId = '';
  let deliveryApprovalId = '';
  let loading = true;
  let error = '';

  const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: 'bg-blue-100 text-blue-700',
    SCORING: 'bg-yellow-100 text-yellow-700',
    PENDING_PROCUREMENT: 'bg-orange-100 text-orange-700',
    PROCUREMENT_CONFIRMED: 'bg-teal-100 text-teal-700',
    IN_PRODUCTION: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    EXPIRED: 'bg-red-100 text-red-700',
  };

  onMount(async () => {
    const id = $page.params.id;
    try {
      const [lotsRes, recRes] = await Promise.all([
        fetch('/api/lots'),
        fetch(`/api/recommendations/${id}`),
      ]);
      const lotsData = await lotsRes.json();
      lot = lotsData.lots?.find((l: SurplusLot) => l.id === id) ?? null;

      const recData = await recRes.json();
      bundle = recData.bundle ?? null;
      procurementApprovalId = recData.procurementApprovalId ?? '';
      facilityApprovalId = recData.facilityApprovalId ?? '';
      deliveryApprovalId = recData.deliveryApprovalId ?? '';
    } catch (e) {
      error = 'Failed to load lot data.';
    } finally {
      loading = false;
    }
  });

  async function handleApprove(approvalId: string, type: string) {
    await fetch(`/api/approvals/${approvalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-role': 'OPERATOR' },
      body: JSON.stringify({ action: 'approve', operatorId: 'operator-ken' }),
    });
  }

  async function handleReject(approvalId: string, type: string) {
    await fetch(`/api/approvals/${approvalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-role': 'OPERATOR' },
      body: JSON.stringify({ action: 'reject', operatorId: 'operator-ken', notes: 'Rejected via UI' }),
    });
  }

  function daysUntil(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  }
</script>

<svelte:head><title>{lot ? lot.id + ' — ' + lot.species : 'Lot Detail'} | TideLift</title></svelte:head>

{#if loading}
  <div class="text-center py-20 text-gray-400">Loading lot data…</div>
{:else if error}
  <div class="text-center py-20 text-red-500">{error}</div>
{:else if lot}
  <div class="mb-6 flex items-start justify-between">
    <div>
      <div class="flex items-center gap-3 mb-1">
        <h1 class="text-2xl font-bold text-gray-900">{lot.species}</h1>
        <span class="text-sm px-2 py-0.5 rounded-full font-medium {STATUS_COLORS[lot.status] ?? 'bg-gray-100 text-gray-600'}">{lot.status.replace(/_/g, ' ')}</span>
      </div>
      <p class="text-gray-500 text-sm">{lot.id} — {lot.weightLbs.toLocaleString()} lbs</p>
    </div>
    {#if lot.score !== undefined}
      <div class="text-right">
        <div class="text-4xl font-black text-teal-600">{lot.score}</div>
        <div class="text-xs text-gray-400">Opportunity Score</div>
      </div>
    {/if}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Lot Specs -->
    <div class="lg:col-span-1 space-y-4">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="font-semibold text-gray-700 mb-3">Lot Details</h2>
        <dl class="text-sm space-y-2">
          <div class="flex justify-between"><dt class="text-gray-500">Harvest date</dt><dd>{lot.harvestDate}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Expiry date</dt>
            <dd class:text-red-600={daysUntil(lot.expiryDate) <= 3}>
              {lot.expiryDate} ({daysUntil(lot.expiryDate)}d)
            </dd>
          </div>
          <div class="flex justify-between"><dt class="text-gray-500">Market price</dt><dd>${lot.marketPricePerLb}/lb</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Proposed discount</dt><dd class="text-green-600">{lot.proposedDiscountPct}%</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Min order</dt><dd>{lot.minOrderLbs.toLocaleString()} lbs</dd></div>
          {#if lot.notes}<div class="pt-2 text-gray-500 text-xs italic">{lot.notes}</div>{/if}
        </dl>
      </div>

      {#if lot.scoreBreakdown}
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-700 mb-3">Score Breakdown</h2>
          {#each Object.entries({Price: lot.scoreBreakdown.priceScore, Expiry: lot.scoreBreakdown.expiryScore, Volume: lot.scoreBreakdown.volumeScore, Demand: lot.scoreBreakdown.demandScore}) as [label, pts]}
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs text-gray-500 w-14">{label}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-2">
                <div class="bg-teal-500 h-2 rounded-full" style="width:{(pts/25)*100}%"></div>
              </div>
              <span class="text-xs font-medium text-gray-700">{pts}/25</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Recommendation Panel -->
    <div class="lg:col-span-2">
      {#if bundle}
        <RecommendationPanel
          {bundle}
          {procurementApprovalId}
          {facilityApprovalId}
          {deliveryApprovalId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      {:else}
        <div class="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          No agent recommendation available yet.
        </div>
      {/if}
    </div>
  </div>
{/if}
