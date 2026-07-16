<script lang="ts">
  import { onMount } from 'svelte';
  import type { SurplusLot } from '../../../../../packages/shared/src/types';

  let expiringLots: SurplusLot[] = [];
  let show = true;

  onMount(async () => {
    const res = await fetch('/api/lots');
    if (!res.ok) return;
    const data = await res.json();
    const now = Date.now();
    const cutoff = now + 48 * 60 * 60 * 1000;
    expiringLots = (data.lots as SurplusLot[]).filter(l => {
      const exp = new Date(l.expiryDate).getTime();
      return exp <= cutoff && exp > now &&
        (l.status === 'AVAILABLE' || l.status === 'SCORING' || l.status === 'PENDING_PROCUREMENT');
    });
  });
</script>

{#if show && expiringLots.length > 0}
  <div class="bg-amber-50 border-b border-amber-200 px-4 py-2">
    <div class="max-w-7xl mx-auto flex items-start justify-between gap-4">
      <div class="flex items-start gap-2">
        <span class="text-amber-600 font-bold text-sm mt-0.5">⚠️ Exception Alert</span>
        <div class="text-sm text-amber-800">
          {#each expiringLots as lot}
            <div>
              <a href="/lots/{lot.id}" class="underline font-medium">{lot.id}</a>
              — {lot.weightLbs.toLocaleString()} lbs {lot.species} expires
              <strong>{new Date(lot.expiryDate).toLocaleDateString()}</strong>
              with no approved procurement.
            </div>
          {/each}
        </div>
      </div>
      <button
        class="text-amber-500 hover:text-amber-700 text-xs shrink-0 mt-0.5"
        on:click={() => show = false}
      >Dismiss</button>
    </div>
  </div>
{/if}
