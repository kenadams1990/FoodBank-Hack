<script lang="ts">
  import { onMount } from 'svelte';
  import type { Supplier, FoodBank } from '../../../../../packages/shared/src/types';

  let suppliers: Supplier[] = [];
  let foodBanks: FoodBank[] = [];
  let query = '';
  let loading = true;
  let tab: 'suppliers' | 'foodbanks' = 'suppliers';

  async function load() {
    const res = await fetch(`/api/partners${query ? '?q=' + encodeURIComponent(query) : ''}`);
    const data = await res.json();
    suppliers = data.suppliers ?? [];
    foodBanks = data.foodBanks ?? [];
    loading = false;
  }

  onMount(load);

  function search() { loading = true; load(); }
</script>

<svelte:head><title>Partner Directory | TideLift</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <h1 class="text-2xl font-bold text-gray-900">Partner Directory</h1>
  <div class="flex items-center gap-2">
    <input
      bind:value={query}
      on:input={search}
      placeholder="Search partners…"
      class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-400"
    />
  </div>
</div>

<div class="flex gap-2 mb-4">
  <button class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
    class:bg-teal-600={tab === 'suppliers'} class:text-white={tab === 'suppliers'}
    class:bg-white={tab !== 'suppliers'} class:text-gray-600={tab !== 'suppliers'}
    class:border={tab !== 'suppliers'} class:border-gray-200={tab !== 'suppliers'}
    on:click={() => tab = 'suppliers'}>Suppliers ({suppliers.length})</button>
  <button class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
    class:bg-teal-600={tab === 'foodbanks'} class:text-white={tab === 'foodbanks'}
    class:bg-white={tab !== 'foodbanks'} class:text-gray-600={tab !== 'foodbanks'}
    class:border={tab !== 'foodbanks'} class:border-gray-200={tab !== 'foodbanks'}
    on:click={() => tab = 'foodbanks'}>Food Banks ({foodBanks.length})</button>
</div>

{#if loading}
  <div class="text-center py-20 text-gray-400">Loading…</div>
{:else if tab === 'suppliers'}
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Species</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Certs</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each suppliers as s}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-800">{s.name}</td>
            <td class="px-4 py-3 text-gray-500">{s.location}</td>
            <td class="px-4 py-3 text-gray-500">{s.species.join(', ')}</td>
            <td class="px-4 py-3"><a href="mailto:{s.contactEmail}" class="text-teal-600 hover:underline">{s.contactName}</a></td>
            <td class="px-4 py-3 text-gray-400 text-xs">{s.certifications.join(', ')}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Food Bank</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Region</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Monthly Demand</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
          <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each foodBanks as fb}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-800">{fb.name}</td>
            <td class="px-4 py-3 text-gray-500">{fb.region}</td>
            <td class="px-4 py-3 text-gray-500">{fb.monthlyDemandCases} cases/mo</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-12 bg-gray-100 rounded-full h-1.5">
                  <div class="bg-teal-500 h-1.5 rounded-full" style="width:{fb.priorityScore}%"></div>
                </div>
                <span class="text-xs font-semibold text-gray-600">{fb.priorityScore}</span>
              </div>
            </td>
            <td class="px-4 py-3"><a href="mailto:{fb.contactEmail}" class="text-teal-600 hover:underline">{fb.contactName}</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
