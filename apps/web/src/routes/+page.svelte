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
