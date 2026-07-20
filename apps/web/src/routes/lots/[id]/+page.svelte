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
    AVAILABLE: 'chip-neutral',
    SCORED: 'chip-neutral',
    PROCUREMENT_PENDING: 'chip-warn',
    PROCUREMENT_CONFIRMED: 'chip-ok',
    IN_PRODUCTION: 'chip-warn',
    SHIPPED: 'chip-ok',
    DELIVERED: 'chip-ok',
    EXPIRED: 'chip-alert',
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
  <p class="font-mono text-foam/35 animate-pulse">Loading lot…</p>
{:else if error}
  <p class="font-mono text-danger-hi">{error}</p>
{:else if lot}
  <ExceptionAlerts lots={[lot]} />

  <div class="flex items-start justify-between mb-6 gap-3 flex-wrap">
    <div>
      <h1 class="font-display font-bold text-2xl text-foam capitalize">{lot.species} — {lot.lbs.toLocaleString()} lbs</h1>
      <p class="font-mono text-mist text-sm mt-1">{lot.landingLocation} · Harvested {lot.harvestDate} · Expires {lot.expiryDate}</p>
    </div>
    <span class="{statusColors[lot.status] ?? 'chip-neutral'}">{lot.status.replace(/_/g, ' ')}</span>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
    {#each [
      { label: 'Price / lb', value: `$${lot.pricePerLb}` },
      { label: 'Market / lb', value: `$${lot.marketPricePerLb}` },
      { label: 'Discount', value: `${lot.proposedDiscountPct}%` },
      { label: 'Est. Cans', value: Math.floor(lot.lbs * 1.8 * 0.88).toLocaleString() },
    ] as stat}
      <div class="tl-panel p-4">
        <p class="tl-label">{stat.label}</p>
        <p class="font-display font-bold text-xl text-foam mt-1">{stat.value}</p>
      </div>
    {/each}
  </div>

  {#if lot.score !== undefined}
    <div class="tl-panel p-5 mb-6">
      <h2 class="tl-label mb-3">Opportunity Score</h2>
      <div class="flex items-center gap-4 mb-3">
        <span class="impact-number text-5xl">{lot.score}</span>
        <span class="font-mono text-mist">/ 100</span>
      </div>
      {#if scoreBreakdown}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {#each [
            { label: 'Price Savings', value: scoreBreakdown.priceSavings, max: 30 },
            { label: 'Urgency', value: scoreBreakdown.urgency, max: 25 },
            { label: 'Lot Size', value: scoreBreakdown.lotSize, max: 25 },
            { label: 'Demand Match', value: scoreBreakdown.demandMatch, max: 20 },
          ] as dim}
            <div class="bg-raised rounded-sm p-3">
              <p class="font-mono text-xs text-mist">{dim.label}</p>
              <p class="font-mono font-bold text-foam">{dim.value}<span class="text-mist font-normal">/{dim.max}</span></p>
              <div class="mt-1 h-1.5 bg-white/10 rounded-sm"><div class="h-1.5 bg-mist rounded-sm" style="width:{(Number(dim.value)/dim.max)*100}%"></div></div>
            </div>
          {/each}
        </div>
        {#if scoreBreakdown.rationale}
          <p class="mt-3 font-mono text-xs text-mist italic">{scoreBreakdown.rationale}</p>
        {/if}
      {/if}
    </div>
  {:else}
    <button
      on:click={triggerScore}
      disabled={scoring}
      class="mb-6 bg-salmon hover:bg-salmon-hi text-ink font-mono font-semibold text-sm px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50"
    >
      {scoring ? 'Scoring…' : 'Score This Lot'}
    </button>
  {/if}

  {#if recommendation}
    <RecommendationPanel {recommendation} lotId={lot.id} />
  {/if}

  {#if lot.notes}
    <p class="mt-4 font-mono text-sm text-mist italic">Note: {lot.notes}</p>
  {/if}
{/if}
