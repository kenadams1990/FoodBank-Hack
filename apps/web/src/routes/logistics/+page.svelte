<script lang="ts">
  import { onMount } from 'svelte';
  import ExceptionAlerts from '$lib/components/ExceptionAlerts.svelte';
  import PerishableRescuePanel from '$lib/components/PerishableRescuePanel.svelte';
  import { draftPerishableRescue } from '../../../../../apps/agents/perishable.js';
  import { mockAgencyNeeds } from '../../../../../apps/agents/route.js';
  import { SURPLUS_LOTS } from '../../../../../packages/shared/src/mockData.js';
  import type { SurplusLot, PerishableRescueDraft } from '../../../../../packages/shared/src/types';

  let kanban: Record<string, SurplusLot[]> = {};
  let allLots: SurplusLot[] = [];
  let loading = true;

  // Perishable rescue draft — computed from mock data, same pattern as every
  // other agent page. 3 cold-transport units, 72-hour urgency horizon.
  const rescueDraft: PerishableRescueDraft = draftPerishableRescue(
    SURPLUS_LOTS,
    mockAgencyNeeds,
    3,
    72
  );

  // Column top-border accent: PENDING_APPROVAL is the one place that carries
  // the page's single salmon signal (it's the state that needs an operator
  // decision); every other column uses a semantic/neutral tone.
  const columns = [
    { key: 'PENDING_APPROVAL',      label: 'Pending Approval',      color: 'border-t-salmon' },
    { key: 'PROCUREMENT_CONFIRMED', label: 'Procurement Confirmed', color: 'border-t-ok' },
    { key: 'IN_PRODUCTION',         label: 'In Production',         color: 'border-t-warn' },
    { key: 'SHIPPED',               label: 'Shipped',               color: 'border-t-mist' },
    { key: 'DELIVERED',             label: 'Delivered',             color: 'border-t-line' },
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

<svelte:head><title>Logistics — TIDELIFT</title></svelte:head>

<!-- Page header -->
<div class="mb-6">
  <h1 class="font-display font-bold text-2xl text-foam">Logistics Board</h1>
  <p class="font-mono text-xs text-mist mt-1">Track every lot from surplus to delivery. Cold-chain rescue panel live below.</p>
</div>

<ExceptionAlerts lots={allLots} />

<!-- Main content: kanban + right rail with rescue panel -->
<div class="grid grid-cols-1 xl:grid-cols-4 gap-6">

  <!-- Kanban (3/4 width on xl) -->
  <div class="xl:col-span-3">
    {#if loading}
      <p class="font-mono text-xs text-foam/35 animate-pulse">Loading board…</p>
    {:else}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {#each columns as col}
          <div class="bg-deep-tide rounded-sm border border-line border-t-4 {col.color} p-4 min-h-48">
            <h3 class="font-mono text-[10px] uppercase tracking-[0.15em] text-mist mb-3">
              {col.label}
              <span class="ml-1 bg-white/5 text-foam/55 rounded-sm px-1.5 py-0.5">
                {(kanban[col.key] ?? []).length}
              </span>
            </h3>
            <div class="space-y-2">
              {#each (kanban[col.key] ?? []) as lot}
                <a
                  href="/lots/{lot.id}"
                  class="catch-ticket block p-3"
                >
                  <p class="font-display text-sm font-semibold capitalize text-foam">{lot.species}</p>
                  <p class="font-mono text-[11px] text-mist mt-0.5">
                    {lot.lbs.toLocaleString()} lbs
                  </p>
                  {#if lot.score !== undefined}
                    <span class="font-mono text-[10px] text-mist mt-1 inline-block">{lot.score}/100</span>
                  {/if}
                </a>
              {/each}
              {#if (kanban[col.key] ?? []).length === 0}
                <p class="font-mono text-[10px] text-foam/35 text-center pt-4">No lots here</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Right rail: Perishable Rescue Panel -->
  <div class="xl:col-span-1">
    <PerishableRescuePanel draft={rescueDraft} />
  </div>

</div>
