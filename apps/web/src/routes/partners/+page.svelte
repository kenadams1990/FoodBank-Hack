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
    <h1 class="font-display font-bold text-2xl text-foam">Partner Directory</h1>
    <p class="font-mono text-sm text-mist mt-1">Suppliers and food bank partners.</p>
  </div>
  <input
    bind:value={query}
    placeholder="Search partners…"
    class="border border-line rounded-sm px-4 py-2 text-sm font-mono w-64 bg-raised text-foam placeholder:text-foam/35 focus:outline-none focus:ring-1 focus:ring-salmon/50"
  />
</div>

{#if loading}
  <p class="font-mono text-sm text-foam/40 animate-pulse">Loading…</p>
{:else}
  <h2 class="tl-label mb-3">Suppliers ({suppliers.length})</h2>
  <div class="tl-panel overflow-hidden mb-8">
    <table class="w-full text-sm">
      <thead class="bg-raised text-foam/40 uppercase text-xs font-mono">
        <tr>
          {#each ['Name', 'Location', 'Contact', 'Species', 'Capacity / wk'] as h}
            <th class="px-4 py-3 text-left">{h}</th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        {#each suppliers as s}
          <tr class="hover:bg-white/5">
            <td class="px-4 py-3 font-display font-semibold text-foam">{s.name}</td>
            <td class="px-4 py-3 text-mist">{s.location}</td>
            <td class="px-4 py-3">
              <p class="font-mono text-foam/85">{s.contact}</p>
              <a href="mailto:{s.email}" class="text-xs">{s.email}</a>
            </td>
            <td class="px-4 py-3 text-mist capitalize">{s.species.join(', ')}</td>
            <td class="px-4 py-3 text-mist">{s.avgCapacityLbsPerWeek.toLocaleString()} lbs</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h2 class="tl-label mb-3">Food Banks ({foodBanks.length})</h2>
  <div class="tl-panel overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-raised text-foam/40 uppercase text-xs font-mono">
        <tr>
          {#each ['Name', 'Region', 'Contact', 'Monthly Demand', 'Access Windows'] as h}
            <th class="px-4 py-3 text-left">{h}</th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        {#each foodBanks as fb}
          <tr class="hover:bg-white/5">
            <td class="px-4 py-3 font-display font-semibold text-foam">{fb.name}</td>
            <td class="px-4 py-3 text-mist">{fb.region}</td>
            <td class="px-4 py-3">
              <p class="font-mono text-foam/85">{fb.contact}</p>
              <a href="mailto:{fb.email}" class="text-xs">{fb.email}</a>
            </td>
            <td class="px-4 py-3 text-mist">{fb.monthlyDemandCases.toLocaleString()} cases</td>
            <td class="px-4 py-3 text-foam/35 text-xs">{fb.accessWindows.join(', ')}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
