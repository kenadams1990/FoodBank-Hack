<script lang="ts">
  import { onMount } from 'svelte';

  const COLUMNS = [
    { key: 'PENDING_PROCUREMENT', label: 'Pending Approval', color: 'border-orange-300' },
    { key: 'PROCUREMENT_CONFIRMED', label: 'Procurement Confirmed', color: 'border-green-300' },
    { key: 'IN_PRODUCTION', label: 'In Production', color: 'border-purple-300' },
    { key: 'SHIPPED', label: 'Shipped', color: 'border-indigo-300' },
    { key: 'DELIVERED', label: 'Delivered', color: 'border-gray-300' },
  ];

  let shipments: any[] = [];
  let lots: any[] = [];
  let loading = true;

  onMount(async () => {
    const [shipRes, lotRes] = await Promise.all([
      fetch('/api/shipments').then(r => r.json()),
      fetch('/api/lots').then(r => r.json()),
    ]);
    shipments = shipRes.shipments ?? [];
    lots = lotRes.lots ?? [];
    loading = false;
  });

  function getLotsForStatus(status: string) {
    return lots.filter((l: any) => l.status === status);
  }

  function getShipmentForLot(lotId: string) {
    return shipments.find((s: any) => s.lotId === lotId);
  }
</script>

<svelte:head><title>Logistics Board | TideLift</title></svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-brand-dark">Logistics Board</h1>
  <p class="text-gray-500 text-sm mt-1">All active lots by pipeline stage.</p>
</div>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-dark"></div>
  </div>
{:else}
  <div class="grid grid-cols-5 gap-3 min-w-[900px] overflow-x-auto pb-4">
    {#each COLUMNS as col}
      <div class="bg-gray-50 rounded-xl border-t-4 {col.color} p-3">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{col.label}</h3>
        <div class="space-y-2">
          {#each getLotsForStatus(col.key) as lot}
            {@const shp = getShipmentForLot(lot.id)}
            <a href="/lots/{lot.id}"
              class="block bg-white rounded-lg border border-gray-200 p-3 hover:border-brand-dark transition-colors">
              <p class="text-sm font-semibold capitalize">{lot.species}</p>
              <p class="text-xs text-gray-400 mt-0.5">{lot.lbs.toLocaleString()} lbs • {lot.location.split(',')[0]}</p>
              {#if lot.score != null}
                <div class="flex items-center gap-1 mt-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-1">
                    <div class="bg-brand-dark h-1 rounded-full" style="width:{lot.score}%"></div>
                  </div>
                  <span class="text-xs font-mono text-gray-500">{lot.score}</span>
                </div>
              {/if}
              {#if shp}
                <p class="text-xs text-gray-400 mt-1">→ {shp.foodBank?.name ?? shp.foodBankId}</p>
              {/if}
            </a>
          {/each}
          {#if getLotsForStatus(col.key).length === 0}
            <p class="text-xs text-gray-300 text-center py-4">Empty</p>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
