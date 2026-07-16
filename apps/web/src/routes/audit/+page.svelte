<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

  $: events = data.events;
  $: total = data.total;
  $: pages = Math.ceil(total / 50);

  function entityColor(type: string) {
    const map: Record<string, string> = {
      LOT: 'bg-blue-100 text-blue-700',
      APPROVAL: 'bg-purple-100 text-purple-700',
      SHIPMENT: 'bg-green-100 text-green-700',
      FACILITY: 'bg-amber-100 text-amber-700',
    };
    return map[type] ?? 'bg-gray-100 text-gray-600';
  }

  function actionColor(action: string) {
    if (action.includes('APPROVED')) return 'text-green-600 font-semibold';
    if (action.includes('REJECTED')) return 'text-red-600 font-semibold';
    if (action.includes('CREATED')) return 'text-teal-600';
    return 'text-gray-700';
  }
</script>

<svelte:head><title>TideLift · Audit Log</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-brand-dark">Audit Log</h1>
    <p class="text-gray-500 text-sm mt-1">Every agent action and operator decision, in order.</p>
  </div>
  <span class="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{total} events</span>
</div>

<div class="bg-white rounded-xl shadow overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-gray-50 border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity ID</th>
        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      {#each events as ev (ev.id)}
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
            {new Date(ev.timestamp).toLocaleString()}
          </td>
          <td class="px-4 py-3">
            <span class="text-xs font-medium rounded-full px-2 py-0.5 {entityColor(ev.entityType)}">
              {ev.entityType}
            </span>
          </td>
          <td class="px-4 py-3">
            <span class="font-mono text-xs text-gray-500 truncate max-w-[140px] inline-block">
              {ev.entityId}
            </span>
          </td>
          <td class="px-4 py-3 {actionColor(ev.action)}">{ev.action}</td>
          <td class="px-4 py-3 text-gray-500 text-xs">{ev.actor}</td>
        </tr>
      {/each}
      {#if events.length === 0}
        <tr>
          <td colspan="5" class="px-4 py-12 text-center text-gray-400">No audit events yet.</td>
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
        class="px-3 py-1.5 rounded-lg border text-sm font-medium transition
          {data.events.length > 0 ? 'hover:bg-teal-50 hover:border-teal-300' : ''}"
      >{p}</a>
    {/each}
  </div>
{/if}
