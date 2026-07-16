<script lang="ts">
  import { onMount } from 'svelte';
  import type { Supplier, FoodBank } from '../../../../packages/shared/src/types';

  let suppliers: Supplier[] = [];
  let foodBanks: FoodBank[] = [];
  let query = '';
  let loading = true;

  async function load() {
    const res = await fetch(`/api/partners${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    const data = await res.json();
    suppliers = data.suppliers;
    foodBanks = data.foodBanks;
  }

  onMount(async () => { await load(); loading = false; });

  let debounce: ReturnType<typeof setTimeout>;
  $: { query; clearTimeout(debounce); debounce = setTimeout(load, 250); }
</script>

<svelte:head><title>Partners — TideLift</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-brand-dark">Partner Directory</h1>
    <p class="text-gray-500 text-sm mt-1">Suppliers and food bank partners.</p>
  </div>
  <input
    bind:value={query}
    placeholder="Search partners…"
    class="border border-gray-200 rounded-lg px-4 py-2 text-sm w-64"
  />
</div>

{#if loading}
  <p class="text-gray-400 animate-pulse">Loading…</p>
{:else}
  <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Suppliers ({suppliers.length})</h2>
  <div class="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
        <tr>
          {#each ['Name', 'Location', 'Contact', 'Species', 'Capacity / wk'] as h}
            <th class="px-4 py-3 text-left">{h}</th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each suppliers as s}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-brand-dark">{s.name}</td>
            <td class="px-4 py-3 text-gray-500">{s.location}</td>
            <td class="px-4 py-3">
              <p>{s.contact}</p>
              <a href="mailto:{s.email}" class="text-teal-600 text-xs">{s.email}</a>
            </td>
            <td class="px-4 py-3 text-gray-500 capitalize">{s.species.join(', ')}</td>
            <td class="px-4 py-3 text-gray-500">{s.avgCapacityLbsPerWeek.toLocaleString()} lbs</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Food Banks ({foodBanks.length})</h2>
  <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 uppercase text-xs">
        <tr>
          {#each ['Name', 'Region', 'Contact', 'Monthly Demand', 'Access Windows'] as h}
            <th class="px-4 py-3 text-left">{h}</th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#each foodBanks as fb}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-brand-dark">{fb.name}</td>
            <td class="px-4 py-3 text-gray-500">{fb.region}</td>
            <td class="px-4 py-3">
              <p>{fb.contact}</p>
              <a href="mailto:{fb.email}" class="text-teal-600 text-xs">{fb.email}</a>
            </td>
            <td class="px-4 py-3 text-gray-500">{fb.monthlyDemandCases.toLocaleString()} cases</td>
            <td class="px-4 py-3 text-gray-400 text-xs">{fb.accessWindows.join(', ')}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
