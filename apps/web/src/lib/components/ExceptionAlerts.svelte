<script lang="ts">
  import type { SurplusLot } from '../../../../../packages/shared/src/types';
  export let lots: SurplusLot[] = [];

  $: expiringIn48h = lots.filter(l => {
    if (['DELIVERED', 'EXPIRED'].includes(l.status)) return false;
    const ms = new Date(l.expiryDate).getTime() - Date.now();
    return ms > 0 && ms < 48 * 3600 * 1000;
  });

  $: noApprovedProcurement = expiringIn48h.filter(l =>
    !['PROCUREMENT_CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(l.status)
  );
</script>

{#if noApprovedProcurement.length > 0}
  <div class="mb-4 rounded-sm border border-alert/40 bg-alert/10 px-4 py-3">
    <div class="flex items-start gap-2">
      <svg class="text-danger-hi shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="17" r="1" fill="currentColor"/>
      </svg>
      <div class="min-w-0">
        <p class="font-mono text-sm font-semibold text-danger-hi">
          {noApprovedProcurement.length} lot(s) expiring within 48 hours with no approved procurement:
        </p>
        <ul class="mt-2 space-y-1">
          {#each noApprovedProcurement as lot}
            <li class="font-mono text-xs text-mist">
              <a href="/lots/{lot.id}" class="underline text-foam hover:text-salmon-hi capitalize">{lot.species}</a>
              — {lot.lbs.toLocaleString()} lbs — expires {lot.expiryDate}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}
