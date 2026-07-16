<script lang="ts">
  import { mockSurplusFeed } from '$lib/mockSurplusFeed';
  import SurplusCard from '$lib/components/SurplusCard.svelte';
  import AgentStatusPanel from '$lib/components/AgentStatusPanel.svelte';
  import DeliveryPlanTable from '$lib/components/DeliveryPlanTable.svelte';

  const lots = mockSurplusFeed;
</script>

<svelte:head>
  <title>TideLift Dashboard</title>
</svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-brand-dark">Surplus Feed Dashboard</h1>
  <p class="text-gray-500 text-sm mt-1">Live surplus lots from local fisheries awaiting agent action.</p>
</div>

<a
  href="/guided-demo"
  class="block bg-brand-dark hover:bg-brand rounded-xl p-5 mb-6 text-white transition-colors group"
>
  <div class="flex items-center justify-between gap-4 flex-wrap">
    <div>
      <p class="text-xs font-semibold text-accent-light uppercase tracking-wider mb-1">Self-running walkthrough</p>
      <p class="text-lg font-bold">▶ Watch the guided demo</p>
      <p class="text-sm text-teal-100 mt-1 max-w-xl">
        One real catch, seven real agent decisions — from on-vessel CV to a truck at ACCFB — with
        live impact counters. Runs itself once started.
      </p>
    </div>
    <span class="text-sm font-semibold bg-white text-brand-dark px-4 py-2 rounded-lg group-hover:bg-teal-50 transition-colors whitespace-nowrap">
      Start walkthrough →
    </span>
  </div>
</a>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
  <div class="lg:col-span-2">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Surplus</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each lots as lot (lot.id)}
        <SurplusCard {lot} />
      {/each}
    </div>
  </div>
  <div>
    <AgentStatusPanel />
  </div>
</div>

<DeliveryPlanTable rows={[]} />
