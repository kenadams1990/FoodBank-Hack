<script lang="ts">
  import { mockSurplusFeed } from '$lib/mockSurplusFeed';
  import SurplusCard from '$lib/components/SurplusCard.svelte';
  import AgentStatusPanel from '$lib/components/AgentStatusPanel.svelte';

  const lots = mockSurplusFeed;

  // Impact math: meals = lbs ÷ 1.2 (Feeding America basis)
  // Using available lots here as a live indicator
  $: totalLbs = lots.reduce((s, l) => s + l.lbs, 0);
  $: totalMeals = Math.round(totalLbs / 1.2);

  const agentActivity = [
    { time: '09:14', action: 'Scored lot', detail: 'F/V Morning Star · Salmon', score: 87 },
    { time: '09:11', action: 'Drafted offer', detail: 'Monterey Harbor · Sardine @ 30%', score: null },
    { time: '08:52', action: 'Awaiting approval', detail: 'Lot 3 · Halibut · 1,200 lbs', score: null },
    { time: '08:31', action: 'Delivery planned', detail: 'Oakland Canning Co → ACCFB', score: null },
    { time: '08:10', action: 'Thermal flag', detail: '4.1°C detected on Lot 2', score: null },
  ];
</script>

<svelte:head>
  <title>TIDELIFT · Dashboard</title>
</svelte:head>

<!-- ══ Impact Hero Band ══════════════════════════════════════════════════ -->
<div
  class="-mx-5 mb-8 bg-ink border-b border-white/5"
  style="margin-top: -2rem; padding-top: 2rem;"
>
  <div class="max-w-7xl mx-auto px-5 pt-6 pb-8">

    <!-- Top line -->
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2">
      <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-brand/70">TideLift · cold-chain ops</span>
      <span class="font-mono text-[10px] text-white/30 italic">Agent recommends. You decide.</span>
    </div>

    <!-- Impact numbers -->
    <div class="flex items-end gap-3 mb-1 flex-wrap">
      <span class="impact-number text-5xl sm:text-6xl leading-none">
        {totalLbs.toLocaleString()}
      </span>
      <span class="font-mono text-white/50 text-lg mb-1">lbs</span>
      <span class="font-mono text-white/20 text-2xl mb-1 mx-1">→</span>
      <span class="impact-number text-5xl sm:text-6xl leading-none">
        {totalMeals.toLocaleString()}
      </span>
      <span class="font-mono text-white/50 text-lg mb-1">meals to ACCFB</span>
      <span class="flex items-center gap-1.5 ml-2 mb-1">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-ok animate-pulse"></span>
        <span class="font-mono text-[10px] text-ok uppercase tracking-widest">live</span>
      </span>
    </div>
    <p class="font-mono text-[10px] text-white/20 mb-6">meals = lbs ÷ 1.2 · Feeding America basis</p>

    <!-- Cold-chain flow strip -->
    <div class="flow-strip text-white/30" role="img" aria-label="Cold chain stages: Vessel to Food Bank">
      <!-- Vessel -->
      <span class="flow-strip__node flow-strip__node--active">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 17l3-10 3 3 3-7 3 7 3-3 3 10H3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        Vessel
      </span>
      <span class="flow-strip__connector">──●──</span>
      <!-- Pickup -->
      <span class="flow-strip__node flow-strip__node--active">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M16 7V5a4 4 0 0 0-8 0v2" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        Pickup
      </span>
      <span class="flow-strip__connector">───</span>
      <!-- Processing -->
      <span class="flow-strip__node">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
          <path d="M19.07 4.93a10 10 0 1 1-14.14 0" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        Processing
      </span>
      <span class="flow-strip__connector">───</span>
      <!-- Food Bank -->
      <span class="flow-strip__node">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" stroke-width="1.5"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        Food Bank
      </span>
    </div>
  </div>
</div>
<!-- ═══════════════════════════════════════════════════════════════════════ -->

<!-- Three ways in: the pitch deck, the self-running walkthrough, and the hands-on prototype -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <!-- Pitch deck CTA — hosted as a Claude artifact, opens in a new tab -->
  <a
    href="https://claude.ai/code/artifact/454250c6-d977-4211-bec3-2ad748096b30"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center justify-between gap-4 flex-wrap
           bg-brand-deep hover:bg-brand rounded-xl p-5 transition-colors group
           border border-brand/30"
  >
    <div>
      <p class="font-mono text-[10px] text-brand/70 uppercase tracking-widest mb-1">The pitch · 10 slides</p>
      <p class="font-display text-base font-bold text-white">▶ Read the deck</p>
      <p class="text-sm text-white/60 mt-1">
        The problem, the pipeline, and what ACCFB gets — the presentation given at the AISCO judging round.
      </p>
    </div>
    <span class="font-mono text-xs font-semibold bg-brand text-white px-4 py-2 rounded-lg
                 group-hover:bg-white group-hover:text-brand-deep transition-colors whitespace-nowrap">
      Open deck →
    </span>
  </a>

  <!-- Guided demo CTA -->
  <a
    href="/guided-demo"
    class="flex items-center justify-between gap-4 flex-wrap
           bg-brand-deep hover:bg-brand rounded-xl p-5 transition-colors group
           border border-brand/30"
  >
    <div>
      <p class="font-mono text-[10px] text-brand/70 uppercase tracking-widest mb-1">Self-running walkthrough</p>
      <p class="font-display text-base font-bold text-white">▶ Watch the guided demo</p>
      <p class="text-sm text-white/60 mt-1">
        One real catch, seven agent decisions — vessel computer vision to ACCFB truck — with live impact counters.
      </p>
    </div>
    <span class="font-mono text-xs font-semibold bg-brand text-white px-4 py-2 rounded-lg
                 group-hover:bg-white group-hover:text-brand-deep transition-colors whitespace-nowrap">
      Start walkthrough →
    </span>
  </a>

  <!-- Interactive prototype CTA -->
  <a
    href="/intake"
    class="flex items-center justify-between gap-4 flex-wrap
           bg-ink hover:bg-black rounded-xl p-5 transition-colors group
           border border-impact/40"
  >
    <div>
      <p class="font-mono text-[10px] text-impact/80 uppercase tracking-widest mb-1">Hands-on · live working prototype</p>
      <p class="font-display text-base font-bold text-white">▶ Run the pipeline yourself</p>
      <p class="text-sm text-white/60 mt-1">
        Run a real catch through the agents, then approve dispatch — every decision logged to the audit trail.
      </p>
    </div>
    <span class="font-mono text-xs font-semibold bg-impact text-white px-4 py-2 rounded-lg
                 group-hover:bg-white group-hover:text-ink transition-colors whitespace-nowrap">
      Open prototype →
    </span>
  </a>
</div>

<!-- ══ Main grid ════════════════════════════════════════════════════════ -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

  <!-- Left: Surplus cards -->
  <div class="lg:col-span-2">
    <h2 class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 mb-4">Available Surplus</h2>
    {#if lots.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each lots as lot (lot.id)}
          <SurplusCard {lot} />
        {/each}
      </div>
    {:else}
      <div class="catch-ticket p-8 text-center">
        <svg class="mx-auto mb-3 text-ink/20" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 17l3-10 3 3 3-7 3 7 3-3 3 10H3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <p class="font-display font-semibold text-ink/40">No lots awaiting action</p>
        <p class="font-mono text-xs text-ink/30 mt-1">New surplus will appear here as vessels check in</p>
      </div>
    {/if}
  </div>

  <!-- Right rail -->
  <div class="flex flex-col gap-5">
    <!-- Agent Activity Feed -->
    <AgentStatusPanel {agentActivity} />

    <!-- Impact tile -->
    <div class="bg-ink rounded-xl p-5 border border-white/5">
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-brand/70 mb-3">Impact Today</p>
      <div class="flex flex-col gap-3">
        <div>
          <p class="impact-number text-3xl">{totalMeals.toLocaleString()}</p>
          <p class="font-mono text-[10px] text-white/30 mt-0.5">meals to ACCFB</p>
        </div>
        <div class="border-t border-white/5 pt-3">
          <p class="font-mono text-white/70 text-sm">{totalLbs.toLocaleString()} <span class="text-white/30">lbs recovered</span></p>
        </div>
      </div>
    </div>
  </div>
</div>
