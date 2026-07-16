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
  <div class="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
    <p class="text-sm font-semibold text-red-700">⚠️ {noApprovedProcurement.length} lot(s) expiring within 48 hours with no approved procurement:</p>
    <ul class="mt-2 space-y-1">
      {#each noApprovedProcurement as lot}
        <li class="text-sm text-red-600">
          <a href="/lots/{lot.id}" class="underline capitalize">{lot.species}</a>
          — {lot.lbs.toLocaleString()} lbs — expires {lot.expiryDate}
        </li>
      {/each}
    </ul>
  </div>
{/if}
