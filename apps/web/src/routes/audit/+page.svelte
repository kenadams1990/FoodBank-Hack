<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

  $: events = data.events;
  $: total = data.total;
  $: operatorDecisions = data.operatorDecisions;
  $: pages = Math.ceil(total / 50);

  // Status chip derived from the existing action string — same signals the
  // old actionColor() read (APPROVED / REJECTED / CREATED), remapped to the
  // Tide chip taxonomy instead of inventing a new status field.
  function statusInfo(action: string): { label: string; chip: string } {
    if (action.includes('REJECTED')) return { label: 'REJECTED', chip: 'chip-alert' };
    if (action === 'APPROVAL_CREATED' || action.includes('PENDING')) return { label: 'PENDING', chip: 'chip-warn' };
    if (action.includes('APPROVED')) return { label: 'APPROVED', chip: 'chip-ok' };
    return { label: 'LOGGED', chip: 'chip-ok' };
  }
</script>

<svelte:head><title>TideLift · Audit Trail</title></svelte:head>

<div class="mb-8">
  <h1 class="font-display font-bold text-foam text-3xl">Audit Trail</h1>
  <p class="font-mono text-mist text-sm mt-3 max-w-[680px] leading-relaxed">
    Every agent draft and every operator decision, logged either way. Radical auditability — the record is the product.
  </p>
</div>

<div class="flex flex-wrap items-baseline gap-x-10 gap-y-3 mb-10">
  <div>
    <span class="font-display font-bold text-4xl text-foam tabular-nums">{total}</span>
    <span class="font-mono text-mist text-xs uppercase tracking-wide ml-2">events logged</span>
  </div>
  <div>
    <span class="font-display font-bold text-4xl text-foam tabular-nums">{operatorDecisions}</span>
    <span class="font-mono text-mist text-xs uppercase tracking-wide ml-2">operator decisions</span>
  </div>
  <div>
    <span class="impact-number text-4xl">0</span>
    <span class="font-mono text-mist text-xs uppercase tracking-wide ml-2">auto-executed</span>
  </div>
</div>

<h2 class="tl-label mb-3">Event Log</h2>

<div class="tl-panel overflow-hidden">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="border-b border-line">
        <th class="tl-label text-left font-normal px-4 py-3">Timestamp</th>
        <th class="tl-label text-left font-normal px-4 py-3">Actor</th>
        <th class="tl-label text-left font-normal px-4 py-3">Action</th>
        <th class="tl-label text-left font-normal px-4 py-3">Detail</th>
        <th class="tl-label text-left font-normal px-4 py-3">Status</th>
      </tr>
    </thead>
    <tbody>
      {#each events as ev (ev.id)}
        <tr class="border-b border-line last:border-b-0">
          <td class="px-4 py-4 font-mono text-xs text-foam/55 whitespace-nowrap">
            {new Date(ev.timestamp).toLocaleString()}
          </td>
          <td class="px-4 py-4 font-mono text-xs text-mist whitespace-nowrap">{ev.actor}</td>
          <td class="px-4 py-4 font-mono text-xs text-foam">{ev.action}</td>
          <td class="px-4 py-4 font-mono text-xs text-mist/90 truncate max-w-[240px]">
            {ev.entityType.toLowerCase()}:{ev.entityId}
          </td>
          <td class="px-4 py-4">
            <span class={statusInfo(ev.action).chip}>{statusInfo(ev.action).label}</span>
          </td>
        </tr>
      {/each}
      {#if events.length === 0}
        <tr>
          <td colspan="5" class="px-4 py-12 text-center font-mono text-xs text-foam/35">No audit events yet.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

{#if pages > 1}
  <div class="flex gap-2 mt-6 justify-center">
    {#each Array.from({ length: pages }, (_, i) => i + 1) as p}
      <a
        href="?page={p}"
        class="px-3 py-1.5 rounded-sm border border-line font-mono text-xs text-mist transition-colors
          {data.events.length > 0 ? 'hover:border-salmon/40 hover:text-foam' : ''}"
      >{p}</a>
    {/each}
  </div>
{/if}
