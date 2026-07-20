<script lang="ts">
  import type { PerishableRescueDraft } from '../../../../packages/shared/src/types';

  export let draft: PerishableRescueDraft;

  $: hasUrgent = draft.urgentLots.length > 0;
  $: hasAssignments = draft.coldTransportAssignments.length > 0;
  $: criticalCount = draft.urgentLots.filter((l) => l.hoursRemaining <= 24).length;
</script>

<div class="bg-deep-tide border border-line rounded-sm overflow-hidden">

  <!-- ── Header ── -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-line bg-ink">
    <div class="flex items-center gap-2">
      <!-- Snowflake / cold-chain icon -->
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
           class="text-foam/70" aria-hidden="true">
        <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Perishable Rescue Queue</span>
    </div>
    <!-- Urgency badge -->
    {#if criticalCount > 0}
      <span class="chip-alert">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
        {criticalCount} critical
      </span>
    {:else if hasUrgent}
      <span class="chip-warn">{draft.urgentLots.length} urgent</span>
    {:else}
      <span class="chip-ok">All clear</span>
    {/if}
  </div>

  {#if !hasUrgent}
    <!-- Empty state -->
    <div class="px-4 py-8 text-center">
      <svg class="mx-auto mb-3 text-foam/20" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="1.5"/>
        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <p class="font-display font-semibold text-sm text-foam/40">No lots in the rescue window</p>
      <p class="font-mono text-[11px] text-foam/25 mt-1">Lots expiring within 72 h will appear here</p>
    </div>

  {:else}
    <!-- ── Urgent lot list ── -->
    <div class="border-b border-line">
      <p class="font-mono text-[10px] uppercase tracking-[0.15em] text-mist px-4 pt-3 pb-1">Expiring Lots</p>
      <ul class="divide-y divide-line">
        {#each draft.urgentLots as lot, i}
          <li class="px-4 py-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="font-display font-semibold text-sm text-foam capitalize leading-tight">{lot.species}</p>
              <p class="font-mono text-[11px] text-mist">{lot.lbs.toLocaleString()} lbs · <span class="readout">{lot.lotId}</span></p>
            </div>
            <!-- Hours remaining chip -->
            {#if lot.hoursRemaining <= 24}
              <span class="chip-alert shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {lot.hoursRemaining}h left
              </span>
            {:else}
              <span class="chip-warn shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {lot.hoursRemaining}h left
              </span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    <!-- ── Cold-transport assignments ── -->
    {#if hasAssignments}
      <div class="border-b border-line">
        <p class="font-mono text-[10px] uppercase tracking-[0.15em] text-mist px-4 pt-3 pb-1">Transport Assignments</p>
        <ul class="divide-y divide-line">
          {#each draft.coldTransportAssignments as assignment}
            <li class="px-4 py-3">
              <div class="flex items-start justify-between gap-2 mb-1">
                <span class="readout capitalize">{assignment.lotId}</span>
                <span class="font-mono text-[10px] text-mist">{assignment.coldTransportUnit}</span>
              </div>
              <p class="font-sans text-xs text-foam/60">→ {assignment.assignedAgencyId}</p>
              <p class="font-mono text-[10px] text-mist mt-0.5">{assignment.pickupWindowSuggestion}</p>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- ── Delivery rows summary ── -->
    {#if draft.deliveryRows.length > 0}
      <div class="border-b border-line">
        <p class="font-mono text-[10px] uppercase tracking-[0.15em] text-mist px-4 pt-3 pb-1">Equity Allocation</p>
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-line">
              <th class="font-mono text-[10px] text-mist text-left px-4 py-1.5">Agency</th>
              <th class="font-mono text-[10px] text-mist text-right px-4 py-1.5">Lbs</th>
              <th class="font-mono text-[10px] text-mist text-right px-4 py-1.5">Score</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            {#each draft.deliveryRows as row}
              <tr>
                <td class="px-4 py-2">
                  <p class="font-sans text-foam/80 text-xs leading-tight">{row.neighborhood}</p>
                  {#if row.perishablePriority}
                    <span class="chip-alert" style="font-size:9px; padding: 1px 4px;">priority</span>
                  {/if}
                </td>
                <td class="px-4 py-2 text-right font-mono text-xs text-foam/70">{row.allocatedLbs.toLocaleString()}</td>
                <td class="px-4 py-2 text-right font-mono text-xs text-foam">{row.urgencyScore.toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <!-- ── Unroutable warning ── -->
    {#if draft.unroutableLbs > 0}
      <div class="px-4 py-3 border-b border-line bg-alert/5">
        <div class="flex items-start gap-2">
          <svg class="text-danger-hi shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
          <div>
            <p class="font-mono text-xs text-danger-hi font-medium">{draft.unroutableLbs.toLocaleString()} lbs unroutable</p>
            <p class="font-mono text-[10px] text-mist mt-0.5">No cold-capable agency in window — flag for manual dispatch</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- ── Agent reason / HITL footer ── -->
    <div class="px-4 py-3">
      <p class="font-mono text-[10px] text-mist leading-relaxed">{draft.reason}</p>
    </div>

  {/if}

</div>
