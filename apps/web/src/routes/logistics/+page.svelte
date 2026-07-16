<script lang="ts">
  import { onMount } from 'svelte';
  import type { SurplusLot } from '../../../../../packages/shared/src/types';

  const COLUMNS: { key: string; label: string; color: string }[] = [
    { key: 'PENDING_PROCUREMENT', label: 'Pending Approval', color: 'border-t-orange-400' },
    { key: 'PROCUREMENT_CONFIRMED', label: 'Procurement Confirmed', color: 'border-t-teal-400' },
    { key: 'IN_PRODUCTION', label: 'In Production', color: 'border-t-purple-400' },
    { key: 'SHIPPED', label: 'Shipped', color: 'border-t-indigo-400' },
    { key: 'DELIVERED', label: 'Delivered', color: 'border-t-green-400' },
  ];

  let lots: SurplusLot[] = [];
  let loading = true;

  onMount(async () => {
    const res = await fetch('/api/lots');
    const data = await res.json();
    lots = data.lots ?? [];
    loading = false;
  });

  function lotsForStatus(status: string): SurplusLot[] {
    return lots.filter(l => l.status === status);
  }

  function daysUntil(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  }
</script>

<svelte:head><title>Logistics Board | TideLift</title></svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-gray-900">Logistics Board</h1>
  <p class="text-gray-500 text-sm mt-1">Track every lot from pending approval through delivered.</p>
</div>

{#if loading}
  <div class="text-center py-20 text-gray-400">Loading…</div>
{:else}
  <div class="grid grid-cols-5 gap-4 overflow-x-auto">
    {#each COLUMNS as col}
      <div class="min-w-0">
        <div class="bg-white rounded-xl border border-t-4 {col.color} border-gray-200 p-3">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-wide">{col.label}</h2>
            <span class="text-xs bg-gray-100 text-gray-500 rounded-full px-2">{lotsForStatus(col.key).length}</span>
          </div>
          <div class="space-y-2">
            {#each lotsForStatus(col.key) as lot}
              <a href="/lots/{lot.id}" class="block bg-gray-50 rounded-lg p-3 hover:bg-teal-50 transition-colors border border-gray-100">
                <div class="font-medium text-sm text-gray-800">{lot.species}</div>
                <div class="text-xs text-gray-500">{lot.weightLbs.toLocaleString()} lbs</div>
                <div class="text-xs mt-1" class:text-red-500={daysUntil(lot.expiryDate) <= 3} class:text-gray-400={daysUntil(lot.expiryDate) > 3}>
                  Expires {lot.expiryDate}
                </div>
                {#if lot.score !== undefined}
                  <div class="mt-1 text-xs font-semibold text-teal-600">Score {lot.score}</div>
                {/if}
              </a>
            {/each}
            {#if lotsForStatus(col.key).length === 0}
              <div class="text-xs text-gray-300 text-center py-4">Empty</div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
