<script lang="ts">
  import type { DeliveryPlanRow } from '$lib/mockSurplusFeed';
  export let rows: DeliveryPlanRow[] = [];
</script>

<div class="tl-panel overflow-hidden">
  <div class="px-4 py-3 border-b border-line">
    <h3 class="tl-label">Delivery Plan</h3>
  </div>
  {#if rows.length === 0}
    <div class="p-6 text-center text-foam/35 font-mono text-sm">No deliveries planned yet.</div>
  {:else}
    <table class="w-full font-mono text-sm">
      <thead>
        <tr class="border-b border-line">
          <th class="text-left px-4 py-2 font-semibold text-mist text-xs uppercase tracking-wide">Supplier</th>
          <th class="text-left px-4 py-2 font-semibold text-mist text-xs uppercase tracking-wide">Fish</th>
          <th class="text-right px-4 py-2 font-semibold text-mist text-xs uppercase tracking-wide">Lbs</th>
          <th class="text-left px-4 py-2 font-semibold text-mist text-xs uppercase tracking-wide">ETA</th>
          <th class="text-left px-4 py-2 font-semibold text-mist text-xs uppercase tracking-wide">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        {#each rows as row}
          <tr class="hover:bg-white/5 transition-colors">
            <td class="px-4 py-3 text-foam">{row.supplier}</td>
            <td class="px-4 py-3 text-foam">{row.fish}</td>
            <td class="px-4 py-3 text-right text-foam">{row.lbs}</td>
            <td class="px-4 py-3 text-mist">{row.eta}</td>
            <td class="px-4 py-3">
              <span class="{row.status === 'Scheduled' ? 'chip-ok' : 'chip-warn'}">
                {row.status}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
