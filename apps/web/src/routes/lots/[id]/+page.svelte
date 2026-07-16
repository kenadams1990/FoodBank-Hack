<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import RecommendationPanel from '$lib/components/RecommendationPanel.svelte';
  import ExceptionAlerts from '$lib/components/ExceptionAlerts.svelte';

  let lot: any = null;
  let bundle: any = null;
  let loading = true;
  let error = '';

  const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: 'bg-blue-100 text-blue-800',
    SCORED: 'bg-yellow-100 text-yellow-800',
    PENDING_PROCUREMENT: 'bg-orange-100 text-orange-800',
    PROCUREMENT_CONFIRMED: 'bg-green-100 text-green-800',
    IN_PRODUCTION: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-gray-100 text-gray-800',
    EXPIRED: 'bg-red-100 text-red-800',
  };

  onMount(async () => {
    const id = $page.params.id;
    try {
      const [lotRes, bundleRes] = await Promise.all([
        fetch(`/api/lots?species=`).then(r => r.json()),
        fetch(`/api/recommendations/${id}`).then(r => r.json()),
      ]);
      lot = lotRes.lots?.find((l: any) => l.id === id);
      bundle = bundleRes;
    } catch (e) {
      error = 'Failed to load lot data.';
    } finally {
      loading = false;
    }
  });

  async function triggerScore() {
    const res = await fetch(`/api/lots/${$page.params.id}/score`, { method: 'POST' });
    const data = await res.json();
    lot = data.lot;
    bundle = { ...bundle, score: data.score };
  }
</script>

<svelte:head>
  <title>{lot ? `${lot.species} — ${lot.id}` : 'Lot Detail'} | TideLift</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-dark"></div>
  </div>
{:else if error}
  <p class="text-red-600">{error}</p>
{:else if lot}
  <ExceptionAlerts lots={lot ? [lot] : []} />

  <div class="mb-4 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-brand-dark capitalize">{lot.species} Lot</h1>
      <p class="text-xs text-gray-400 font-mono mt-0.5">{lot.id}</p>
    </div>
    <span class="px-3 py-1 rounded-full text-xs font-semibold {STATUS_COLORS[lot.status] || 'bg-gray-100 text-gray-700'}">
      {lot.status.replace(/_/g, ' ')}
    </span>
  </div>

  <!-- Lot Specs -->
  <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Lot Details</h2>
    <dl class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
      <div><dt class="text-gray-400">Volume</dt><dd class="font-semibold">{lot.lbs.toLocaleString()} lbs</dd></div>
      <div><dt class="text-gray-400">Harvest Date</dt><dd class="font-semibold">{lot.harvestDate}</dd></div>
      <div><dt class="text-gray-400">Expiry Date</dt><dd class="font-semibold text-red-600">{lot.expiryDate}</dd></div>
      <div><dt class="text-gray-400">Price / lb</dt><dd class="font-semibold">${lot.pricePerLb}</dd></div>
      <div><dt class="text-gray-400">Market Price / lb</dt><dd class="font-semibold">${lot.marketPricePerLb}</dd></div>
      <div><dt class="text-gray-400">Location</dt><dd class="font-semibold">{lot.location}</dd></div>
    </dl>
  </div>

  <!-- Score Breakdown -->
  <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Opportunity Score</h2>
      {#if lot.status === 'AVAILABLE'}
        <button on:click={triggerScore}
          class="text-xs bg-brand-dark text-white px-3 py-1.5 rounded-lg hover:opacity-90">
          Re-score
        </button>
      {/if}
    </div>
    {#if bundle?.score}
      <div class="flex items-center gap-4 mb-4">
        <span class="text-5xl font-bold text-brand-dark">{bundle.score.score}</span>
        <p class="text-sm text-gray-600">{bundle.score.recommendation}</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {#each Object.entries(bundle.score.breakdown) as [key, val]}
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400 capitalize">{key.replace('Score', '')}</p>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                <div class="bg-brand-dark h-1.5 rounded-full" style="width:{val}%"></div>
              </div>
              <span class="text-xs font-semibold">{val}</span>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-sm text-gray-400">No score yet. Click Re-score to evaluate.</p>
    {/if}
  </div>

  <!-- Recommendation Panel -->
  {#if bundle}
    <RecommendationPanel {bundle} />
  {/if}
{/if}
