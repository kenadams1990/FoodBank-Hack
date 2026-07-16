<script lang="ts">
  import type { SurplusLot } from '../../../../../../packages/shared/src/types';
  export let lots: SurplusLot[] = [];

  function daysUntil(dateStr: string): number {
    return Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  }

  $: expiringLots = lots.filter((l) => {
    const days = daysUntil(l.expiryDate);
    return days <= 2 && days >= 0 &&
      !['PROCUREMENT_CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'].includes(l.status);
  });
</script>

{#if expiringLots.length > 0}
  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
    <div class="flex items-start gap-3">
      <span class="text-amber-500 text-xl">⚠️</span>
      <div>
        <p class="text-sm font-semibold text-amber-900">Expiry Alert</p>
        <ul class="mt-1 space-y-1">
          {#each expiringLots as lot}
            <li class="text-xs text-amber-700">
              <a href="/lots/{lot.id}" class="font-semibold hover:underline capitalize">{lot.species}</a>
              ({lot.lbs.toLocaleString()} lbs) expires in {daysUntil(lot.expiryDate)} day(s) — no procurement confirmed.
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}
