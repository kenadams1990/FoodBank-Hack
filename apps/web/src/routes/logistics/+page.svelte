<script lang="ts">
  import { onMount } from 'svelte';
  import ExceptionAlerts from '$lib/components/ExceptionAlerts.svelte';
  import type { SurplusLot } from '../../../../packages/shared/src/types';

  let kanban: Record<string, SurplusLot[]> = {};
  let allLots: SurplusLot[] = [];
  let loading = true;

  const columns = [
    { key: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'border-t-blue-400' },
    { key: 'PROCUREMENT_CONFIRMED', label: 'Procurement Confirmed', color: 'border-t-green-400' },
    { key: 'IN_PRODUCTION', label: 'In Production', color: 'border-t-purple-400' },
    { key: 'SHIPPED', label: 'Shipped', color: 'border-t-indigo-400' },
    { key: 'DELIVERED', label: 'Delivered', color: 'border-t-gray-400' },
  ];

  onMount(async () => {
    try {
      const res = await fetch('/api/shipments');
      const data = await res.json();
      kanban = data.kanban;
      allLots = Object.values(data.kanban).flat() as SurplusLot[];
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Logistics Board — TideLift</title></svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-brand-dark">Logistics Board</h1>
  <p class="text-gray-500 text-sm mt-1">Track every lot from surplus to delivery.</p>
</div>

<ExceptionAlerts lots={allLots} />

{#if loading}
  <p class="text-gray-400 animate-pulse">Loading board…</p>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {#each columns as col}
      <div class="bg-white rounded-xl border border-gray-100 border-t-4 {col.color} p-4 min-h-48">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {col.label}
          <span class="ml-1 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{(kanban[col.key] ?? []).length}</span>
        </h3>
        <div class="space-y-2">
          {#each (kanban[col.key] ?? []) as lot}
            <a href="/lots/{lot.id}" class="block bg-gray-50 hover:bg-teal-50 rounded-lg p-3 transition">
              <p class="text-sm font-semibold capitalize text-brand-dark">{lot.species}</p>
              <p class="text-xs text-gray-400">{lot.lbs.toLocaleString()} lbs · {lot.landingLocation}</p>
              {#if lot.score !== undefined}
                <p class="text-xs text-teal-600 font-medium mt-1">Score: {lot.score}</p>
              {/if}
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}
