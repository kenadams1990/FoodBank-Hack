<script lang="ts">
  import {
    mockSurplusFeed,
    pickBestLot,
    negotiatePrice,
    buildDeliveryPlan,
    type SurplusLot,
    type DeliveryPlanRow,
  } from '$lib/mockSurplusFeed';
  import SurplusCard from '$lib/components/SurplusCard.svelte';
  import AgentStatusPanel from '$lib/components/AgentStatusPanel.svelte';
  import DeliveryPlanTable from '$lib/components/DeliveryPlanTable.svelte';

  let stage: number = 0;
  let bestLot: SurplusLot | null = null;
  let negotiatedPrice: number | null = null;
  let plan: DeliveryPlanRow[] = [];

  const stages = [
    'Idle — press "Run Agent" to start',
    'Scanning surplus feed…',
    'Agent selected best lot. Awaiting your approval.',
    'Negotiating procurement price…',
    'Price locked! Generating delivery plan…',
    'Done — delivery plan ready.',
  ];

  function runAgent() {
    stage = 1;
    bestLot = null;
    negotiatedPrice = null;
    plan = [];

    setTimeout(() => { stage = 2; bestLot = pickBestLot(mockSurplusFeed); }, 1000);
    setTimeout(() => { stage = 3; }, 2500);
    setTimeout(() => { if (bestLot) { negotiatedPrice = negotiatePrice(bestLot); stage = 4; } }, 4000);
    setTimeout(() => { if (bestLot) { plan = buildDeliveryPlan(bestLot); stage = 5; } }, 5500);
  }
</script>

<svelte:head>
  <title>Mock Agent Run — TideLift</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-brand-dark">Mock Agent Run</h1>
    <p class="text-gray-500 text-sm mt-1">Full end-to-end simulation — no network calls.</p>
  </div>
  <button
    on:click={runAgent}
    class="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition-colors {stage > 0 && stage < 5 ? 'opacity-50 cursor-not-allowed' : ''}"
    disabled={stage > 0 && stage < 5}
  >
    {stage === 0 ? 'Run Agent' : 'Running…'}
  </button>
</div>

<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <p class="text-blue-800 font-medium">{stages[stage]}</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
  <div class="lg:col-span-2">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Surplus Feed</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each mockSurplusFeed as lot (lot.id)}
        <div class={stage >= 2 && bestLot?.id === lot.id ? 'ring-2 ring-accent rounded-lg' : ''}>
          <SurplusCard {lot} />
        </div>
      {/each}
    </div>
  </div>
  <div class="space-y-4">
    <AgentStatusPanel />
    {#if bestLot && negotiatedPrice !== null}
      <div class="bg-white rounded-lg shadow-md p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Negotiated Price</h3>
        <div class="space-y-1">
          <p class="text-gray-600">List: <span class="line-through">${bestLot.pricePerLb.toFixed(2)}/lb</span></p>
          <p class="text-2xl font-bold text-green-600">${negotiatedPrice.toFixed(2)}/lb</p>
          <p class="text-sm text-gray-500">15% agent discount applied</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<DeliveryPlanTable rows={plan} />
