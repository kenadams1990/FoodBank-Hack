<script lang="ts">
  import type { SurplusLot } from '$lib/mockSurplusFeed';
  export let lot: SurplusLot;
</script>

<div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-brand hover:shadow-lg transition-shadow">
  <div class="flex justify-between items-start mb-2">
    <h3 class="text-lg font-bold text-brand-dark">{lot.fishType}</h3>
    <span class="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1">
      {lot.expiryDays}d to expiry
    </span>
  </div>
  <p class="text-sm text-gray-600 mb-3">{lot.supplier}</p>
  <div class="flex justify-between items-center">
    <span class="text-2xl font-bold text-gray-800">{lot.lbs} lbs</span>
    <span class="text-lg font-semibold text-accent">${lot.pricePerLb.toFixed(2)}/lb</span>
  </div>
</div>
