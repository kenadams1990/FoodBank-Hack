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
    'Idle':              'bg-ink/30',
    'Scanning feed':     'bg-brand',
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

<div class="bg-white border border-line rounded-xl overflow-hidden">
  <!-- Header: live status pulse -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-line">
    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">Agent Activity</span>
    <span class="flex items-center gap-1.5">
      <span
        class="inline-block w-2 h-2 rounded-full animate-pulse-slow {statusColors[currentStatus]}"
        aria-hidden="true"
      ></span>
      <span class="font-mono text-xs text-ink/60">{currentStatus}</span>
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
          <span class="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-brand/50" aria-hidden="true"></span>
          <div class="min-w-0">
            <p class="font-mono text-[11px] text-ink/40">{entry.time}</p>
            <p class="font-sans text-sm font-medium text-ink leading-tight">{entry.action}</p>
            <p class="font-mono text-[11px] text-ink/50 truncate">{entry.detail}</p>
            {#if entry.score != null}
              <span class="font-mono text-[10px] bg-brand/10 text-brand border border-brand/20 rounded px-1.5 py-0.5 mt-1 inline-block">
                score {entry.score}/100
              </span>
            {/if}
          </div>
        </li>
      {/each}
    {:else}
      <li class="px-4 py-6 text-center">
        <p class="font-mono text-xs text-ink/30">No activity yet</p>
        <p class="font-mono text-[10px] text-ink/20 mt-1">Agent will log decisions here</p>
      </li>
    {/if}
  </ul>
</div>
