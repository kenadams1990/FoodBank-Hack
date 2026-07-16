<script lang="ts">
  import { onMount } from 'svelte';

  let suppliers: any[] = [];
  let foodBanks: any[] = [];
  let query = '';
  let loading = true;
  let tab: 'suppliers' | 'foodbanks' = 'suppliers';

  async function load() {
    loading = true;
    const res = await fetch(`/api/partners${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    const data = await res.json();
    suppliers = data.suppliers ?? [];
    foodBanks = data.foodBanks ?? [];
    loading = false;
  }

  onMount(load);
</script>

<svelte:head><title>Partner Directory | TideLift</title></svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-brand-dark">Partner Directory</h1>
  <p class="text-gray-500 text-sm mt-1">Suppliers and food bank partners.</p>
</div>

<div class="flex gap-3 mb-5">
  <input bind:value={query} on:input={load} placeholder="Search name or region…"
    class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/30" />
  <div class="flex gap-1">
    <button class="px-3 py-2 text-sm rounded-lg {tab === 'suppliers' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600'}" on:click={() => tab = 'suppliers'}>Suppliers ({suppliers.length})</button>
    <button class="px-3 py-2 text-sm rounded-lg {tab === 'foodbanks' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600'}" on:click={() => tab = 'foodbanks'}>Food Banks ({foodBanks.length})</button>
  </div>
</div>

{#if tab === 'suppliers'}
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="text-xs text-gray-400 border-b">
        <tr>
          <th class="text-left pb-2">Name</th>
          <th class="text-left pb-2">Location</th>
          <th class="text-left pb-2">Species</th>
          <th class="text-left pb-2">Contact</th>
          <th class="text-right pb-2">Avg lbs/mo</th>
        </tr>
      </thead>
      <tbody>
        {#each suppliers as s}
          <tr class="border-b border-gray-50 hover:bg-gray-50">
            <td class="py-3 font-medium">{s.name}</td>
            <td class="py-3 text-gray-500">{s.location}</td>
            <td class="py-3">{s.species.join(', ')}</td>
            <td class="py-3"><a href="mailto:{s.contactEmail}" class="text-brand-dark hover:underline text-xs">{s.contactEmail}</a></td>
            <td class="py-3 text-right font-mono">{s.avgMonthlyLbs.toLocaleString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="text-xs text-gray-400 border-b">
        <tr>
          <th class="text-left pb-2">Name</th>
          <th class="text-left pb-2">Region</th>
          <th class="text-left pb-2">Contact</th>
          <th class="text-right pb-2">Monthly Demand</th>
          <th class="text-left pb-2">Dietary Notes</th>
        </tr>
      </thead>
      <tbody>
        {#each foodBanks as b}
          <tr class="border-b border-gray-50 hover:bg-gray-50">
            <td class="py-3 font-medium">{b.name}</td>
            <td class="py-3 text-gray-500">{b.region}</td>
            <td class="py-3"><a href="mailto:{b.contactEmail}" class="text-brand-dark hover:underline text-xs">{b.contactEmail}</a></td>
            <td class="py-3 text-right font-mono">{b.monthlyDemandCases.toLocaleString()} cases</td>
            <td class="py-3 text-xs text-gray-400">{b.dietaryRestrictions.join(', ') || '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
