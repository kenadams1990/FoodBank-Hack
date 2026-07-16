<script lang="ts">
  import type { SurplusLot } from '$shared/types';
  export let lot: SurplusLot;

  $: daysLeft = Math.max(0, Math.ceil(
    (new Date(lot.expiryDate).getTime() - Date.now()) / 86_400_000
  ));
  $: urgentClass = daysLeft <= 2
    ? 'bg-red-100 text-red-700'
    : daysLeft <= 4
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-600';
</script>

<a
  href="/lots/{lot.id}"
  class="block bg-white rounded-lg shadow-md p-4 border-l-4 border-brand hover:shadow-lg transition-shadow"
>
  <div class="flex justify-between items-start mb-2">
    <h3 class="text-lg font-bold text-brand-dark">{lot.species}</h3>
    <div class="flex gap-1 items-center flex-wrap justify-end">
      {#if lot.score != null}
        <span class="text-xs font-bold bg-teal-100 text-teal-700 rounded-full px-2 py-1">
          ⭐ {lot.score}/100
        </span>
      {/if}
      <span class="text-xs rounded-full px-2 py-1 {urgentClass}">
        ⏱ {daysLeft}d left
      </span>
    </div>
  </div>
  <p class="text-sm text-gray-500 mb-1">{lot.supplierId}</p>
  <p class="text-xs text-gray-400 mb-3 font-mono">{lot.id}</p>
  <div class="flex justify-between items-center">
    <span class="text-2xl font-bold text-gray-800">{lot.lbs.toLocaleString()} lbs</span>
    <span class="text-lg font-semibold text-accent">{lot.proposedDiscountPct}% disc.</span>
  </div>
</a>
