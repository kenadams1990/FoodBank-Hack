<script lang="ts">
  import type { DeliveryPlanRow } from '$lib/mockSurplusFeed';
  export let rows: DeliveryPlanRow[] = [];
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <div class="px-4 py-3 border-b border-gray-200">
    <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Delivery Plan</h3>
  </div>
  {#if rows.length === 0}
    <div class="p-6 text-center text-gray-400 text-sm">No deliveries planned yet.</div>
  {:else}
    <table class="w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="text-left px-4 py-2 font-semibold text-gray-600">Supplier</th>
          <th class="text-left px-4 py-2 font-semibold text-gray-600">Fish</th>
          <th class="text-right px-4 py-2 font-semibold text-gray-600">Lbs</th>
          <th class="text-left px-4 py-2 font-semibold text-gray-600">ETA</th>
          <th class="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each rows as row}
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-gray-800">{row.supplier}</td>
            <td class="px-4 py-3 text-gray-800">{row.fish}</td>
            <td class="px-4 py-3 text-right text-gray-800">{row.lbs}</td>
            <td class="px-4 py-3 text-gray-600">{row.eta}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                {row.status === 'Scheduled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                {row.status}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
