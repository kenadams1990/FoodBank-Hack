<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { SurplusLot } from '../../../../../packages/shared/src/types';
  import RecommendationPanel from '$lib/components/RecommendationPanel.svelte';
  import ExceptionAlerts from '$lib/components/ExceptionAlerts.svelte';

  let lot: SurplusLot | null = null;
  let scoreBreakdown: Record<string, unknown> | null = null;
  let recommendation: Record<string, unknown> | null = null;
  let loading = true;
  let scoring = false;
  let error = '';

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-blue-100 text-blue-800',
    SCORED: 'bg-yellow-100 text-yellow-800',
    PROCUREMENT_PENDING: 'bg-orange-100 text-orange-800',
    PROCUREMENT_CONFIRMED: 'bg-green-100 text-green-800',
    IN_PRODUCTION: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-gray-100 text-gray-700',
    EXPIRED: 'bg-red-100 text-red-800',
  };

  onMount(async () => {
    try {
      const res = await fetch(`/api/lots`);
      const data = await res.json();
      lot = data.lots.find((l: SurplusLot) => l.id === $page.params.id) ?? null;
      if (lot?.score) await loadRecommendation();
    } catch (e) {
      error = 'Failed to load lot.';
    } finally {
      loading = false;
    }
  });

  async function triggerScore() {
    if (!lot) return;
    scoring = true;
    try {
      const res = await fetch(`/api/lots/${lot.id}/score`, { method: 'POST' });
      const data = await res.json();
      scoreBreakdown = data.score;
      lot = { ...lot, score: data.score.total, status: 'SCORED' };
      await loadRecommendation();
    } finally {
      scoring = false;
    }
  }

  async function loadRecommendation() {
    if (!lot) return;
    const res = await fetch(`/api/recommendations/${lot.id}`);
    recommendation = await res.json();
  }
</script>

<svelte:head><title>{lot?.species ?? 'Lot'} — TideLift</title></svelte:head>

{#if loading}
  <p class="text-gray-400 animate-pulse">Loading lot…</p>
{:else if error}
  <p class="text-red-500">{error}</p>
{:else if lot}
  <ExceptionAlerts lots={[lot]} />

  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-brand-dark capitalize">{lot.species} — {lot.lbs.toLocaleString()} lbs</h1>
      <p class="text-gray-500 text-sm mt-1">{lot.landingLocation} · Harvested {lot.harvestDate} · Expires {lot.expiryDate}</p>
    </div>
    <span class="px-3 py-1 rounded-full text-xs font-semibold {statusColors[lot.status] ?? 'bg-gray-100'}">  {lot.status.replace(/_/g, ' ')}</span>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
    {#each [
      { label: 'Price / lb', value: `$${lot.pricePerLb}` },
      { label: 'Market / lb', value: `$${lot.marketPricePerLb}` },
      { label: 'Discount', value: `${lot.proposedDiscountPct}%` },
      { label: 'Est. Cans', value: Math.floor(lot.lbs * 1.8 * 0.88).toLocaleString() },
    ] as stat}
      <div class="bg-white rounded-xl border border-gray-100 p-4">
        <p class="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
        <p class="text-xl font-bold text-brand-dark mt-1">{stat.value}</p>
      </div>
    {/each}
  </div>

  {#if lot.score !== undefined}
    <div class="bg-white rounded-xl border border-gray-100 p-5 mb-6">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Opportunity Score</h2>
      <div class="flex items-center gap-4 mb-3">
        <span class="text-5xl font-extrabold text-brand-dark">{lot.score}</span>
        <span class="text-gray-400">/ 100</span>
      </div>
      {#if scoreBreakdown}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {#each [
            { label: 'Price Savings', value: scoreBreakdown.priceSavings, max: 30 },
            { label: 'Urgency', value: scoreBreakdown.urgency, max: 25 },
            { label: 'Lot Size', value: scoreBreakdown.lotSize, max: 25 },
            { label: 'Demand Match', value: scoreBreakdown.demandMatch, max: 20 },
          ] as dim}
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-400">{dim.label}</p>
              <p class="font-bold text-brand-dark">{dim.value}<span class="text-gray-400 font-normal">/{dim.max}</span></p>
              <div class="mt-1 h-1.5 bg-gray-200 rounded-full"><div class="h-1.5 bg-teal-500 rounded-full" style="width:{(Number(dim.value)/dim.max)*100}%"></div></div>
            </div>
          {/each}
        </div>
        {#if scoreBreakdown.rationale}
          <p class="mt-3 text-xs text-gray-500 italic">{scoreBreakdown.rationale}</p>
        {/if}
      {/if}
    </div>
  {:else}
    <button
      on:click={triggerScore}
      disabled={scoring}
      class="mb-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50"
    >
      {scoring ? 'Scoring…' : 'Score This Lot'}
    </button>
  {/if}

  {#if recommendation}
    <RecommendationPanel {recommendation} lotId={lot.id} />
  {/if}

  {#if lot.notes}
    <p class="mt-4 text-sm text-gray-500 italic">Note: {lot.notes}</p>
  {/if}
{/if}
