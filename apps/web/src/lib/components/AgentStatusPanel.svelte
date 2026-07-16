<script lang="ts">
  import { onMount } from 'svelte';
  import { agentStatusCycle, type AgentStatus } from '$lib/mockSurplusFeed';

  let status: AgentStatus = 'Idle';
  let idx = 0;

  onMount(() => {
    const interval = setInterval(() => {
      idx = (idx + 1) % agentStatusCycle.length;
      status = agentStatusCycle[idx];
    }, 3000);
    return () => clearInterval(interval);
  });

  const statusColors: Record<string, string> = {
    'Idle': 'bg-gray-400',
    'Scanning feed': 'bg-blue-500',
    'Negotiating': 'bg-amber-500',
    'Awaiting approval': 'bg-accent',
    'Delivery planned': 'bg-green-500',
  };
</script>

<div class="bg-white rounded-lg shadow-md p-4">
  <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Agent Status</h3>
  <div class="flex items-center gap-3">
    <span class="inline-block w-3 h-3 rounded-full animate-pulse {statusColors[status]}"></span>
    <span class="text-lg font-medium text-gray-800">{status}</span>
  </div>
</div>
