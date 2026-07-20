<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStatusCycle, type AgentStatus } from '$lib/mockSurplusFeed';

  // Live cycling status
  let currentStatus: AgentStatus = 'Idle';
  let idx = 0;

  // Activity feed passed in from parent (optional — falls back to cycling only)
  export let agentActivity: Array<{
    time: string;
    action: string;
    detail: string;
    score: number | null;
  }> = [];

  const statusColors: Record<string, string> = {
    'Idle':              'bg-mist/25',
    'Scanning feed':     'bg-mist/50',
    'Negotiating':       'bg-warn',
    'Awaiting approval': 'bg-impact',
    'Delivery planned':  'bg-ok',
  };

  onMount(() => {
    const interval = setInterval(() => {
      idx = (idx + 1) % agentStatusCycle.length;
      currentStatus = agentStatusCycle[idx];
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div class="tl-panel overflow-hidden">
  <!-- Header: live status pulse -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-line">
    <span class="tl-label">Agent Activity</span>
    <span class="flex items-center gap-1.5">
      <span
        class="inline-block w-2 h-2 rounded-full animate-pulse-slow {statusColors[currentStatus]}"
        aria-hidden="true"
      ></span>
      <span class="font-mono text-xs text-mist">{currentStatus}</span>
    </span>
  </div>

  <!-- Activity feed -->
  <ul class="divide-y divide-line" role="log" aria-label="Agent activity feed" aria-live="polite">
    {#if agentActivity.length > 0}
      {#each agentActivity as entry, i}
        <li
          class="px-4 py-3 flex items-start gap-3 animate-slide-in"
          style="animation-delay: {i * 60}ms"
        >
          <!-- Dot -->
          <span class="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-mist/40" aria-hidden="true"></span>
          <div class="min-w-0">
            <p class="font-mono text-[11px] text-foam/35">{entry.time}</p>
            <p class="font-mono text-sm font-medium text-foam leading-tight">{entry.action}</p>
            <p class="font-mono text-[11px] text-mist truncate">{entry.detail}</p>
            {#if entry.score != null}
              <span
                class="font-mono text-[10px] text-salmon border border-salmon/30 rounded-sm px-1.5 py-0.5 mt-1 inline-block"
                style="background: rgba(232, 101, 74, .08);"
              >
                score {entry.score}/100
              </span>
            {/if}
          </div>
        </li>
      {/each}
    {:else}
      <li class="px-4 py-6 text-center">
        <p class="font-mono text-xs text-foam/35">No activity yet</p>
        <p class="font-mono text-[10px] text-foam/20 mt-1">Agent will log decisions here</p>
      </li>
    {/if}
  </ul>
</div>
