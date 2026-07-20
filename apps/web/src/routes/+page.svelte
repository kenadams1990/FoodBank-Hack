<script lang="ts">
  import { mockSurplusFeed } from '$lib/mockSurplusFeed';
  import SurplusCard from '$lib/components/SurplusCard.svelte';
  import AgentStatusPanel from '$lib/components/AgentStatusPanel.svelte';

  const lots = mockSurplusFeed;

  // Impact math: meals = lbs ÷ 1.2 (Feeding America basis)
  // Using available lots here as a live indicator
  $: totalLbs = lots.reduce((s, l) => s + l.lbs, 0);
  $: totalMeals = Math.round(totalLbs / 1.2);

  // Lots inside the 48-hour cold-chain window — drives the exception alert in the right rail
  $: expiringSoon = lots.filter((l) => {
    const daysLeft = Math.ceil((new Date(l.expiryDate).getTime() - Date.now()) / 86_400_000);
    return daysLeft <= 2;
  }).length;

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
  class="-mx-5 mb-8 bg-ink border-b border-line"
  style="margin-top: -2rem; padding-top: 2rem;"
>
  <div class="max-w-7xl mx-auto px-5 pt-6 pb-8">

    <!-- Top line -->
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2">
      <span class="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-salmon/80">TideLift · cold-chain ops</span>
      <span class="font-mono text-[10px] text-foam/35">meals = lbs ÷ 1.2 · Feeding America basis</span>
    </div>

    <!-- Impact numbers -->
    <div class="flex items-end gap-3 mb-6 flex-wrap">
      <span class="font-display font-bold tabular-nums text-foam text-5xl sm:text-6xl leading-none tracking-tight">
        {totalLbs.toLocaleString()}
      </span>
      <span class="font-mono text-mist text-lg mb-1">lbs</span>
      <span class="font-mono text-foam/35 text-2xl mb-1 mx-1">→</span>
      <span class="impact-number text-5xl sm:text-6xl leading-none">
        {totalMeals.toLocaleString()}
      </span>
      <span class="font-mono text-mist text-lg mb-1">meals to ACCFB</span>
      <span class="flex items-center gap-1.5 ml-2 mb-1">
        <span class="tl-pulse inline-block w-1.5 h-1.5 rounded-full bg-success-hi"></span>
        <span class="font-mono text-[10px] text-success-hi uppercase tracking-widest">live</span>
      </span>
    </div>

    <!-- Cold-chain flow strip -->
    <div class="flow-strip" role="img" aria-label="Cold chain stages: Vessel to Food Bank">
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
    class="tl-panel flex items-center justify-between gap-4 flex-wrap p-5 transition-colors group hover:border-white/20"
  >
    <div>
      <p class="font-mono text-[10px] text-mist uppercase tracking-widest mb-1">The pitch · 10 slides</p>
      <p class="font-display text-base font-bold text-foam">Read the deck</p>
      <p class="text-sm text-foam/55 mt-1">
        The problem, the pipeline, and what ACCFB gets — the presentation given at the AISCO judging round.
      </p>
    </div>
    <span class="font-mono text-xs font-medium text-foam/70 border border-white/10 rounded-sm px-4 py-2
                 group-hover:text-foam group-hover:border-white/20 transition-colors whitespace-nowrap">
      Open deck →
    </span>
  </a>

  <!-- Guided demo CTA -->
  <a
    href="/guided-demo"
    class="tl-panel flex items-center justify-between gap-4 flex-wrap p-5 transition-colors group hover:border-white/20"
  >
    <div>
      <p class="font-mono text-[10px] text-mist uppercase tracking-widest mb-1">Self-running walkthrough</p>
      <p class="font-display text-base font-bold text-foam">Watch the guided demo</p>
      <p class="text-sm text-foam/55 mt-1">
        One real catch, seven agent decisions — vessel computer vision to ACCFB truck — with live impact counters.
      </p>
    </div>
    <span class="font-mono text-xs font-medium text-foam/70 border border-white/10 rounded-sm px-4 py-2
                 group-hover:text-foam group-hover:border-white/20 transition-colors whitespace-nowrap">
      Start walkthrough →
    </span>
  </a>

  <!-- Interactive prototype CTA — the primary action on this screen -->
  <a
    href="/intake"
    class="bg-deep-tide border border-salmon/40 rounded-sm flex items-center justify-between gap-4 flex-wrap p-5
           transition-colors group hover:border-salmon/70"
  >
    <div>
      <p class="font-mono text-[10px] text-salmon/80 uppercase tracking-widest mb-1">Hands-on · live working prototype</p>
      <p class="font-display text-base font-bold text-foam">Run the pipeline yourself</p>
      <p class="text-sm text-foam/55 mt-1">
        Run a real catch through the agents, then approve dispatch — every decision logged to the audit trail.
      </p>
    </div>
    <span class="font-mono text-xs font-semibold bg-salmon text-ink rounded-sm px-4 py-2
                 group-hover:bg-salmon-hi transition-colors whitespace-nowrap">
      Open prototype →
    </span>
  </a>
</div>

<!-- ══ Main grid ════════════════════════════════════════════════════════ -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

  <!-- Left: Surplus cards -->
  <div class="lg:col-span-2">
    <h2 class="tl-label mb-4">Available Surplus</h2>
    {#if lots.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each lots as lot (lot.id)}
          <SurplusCard {lot} />
        {/each}
      </div>
    {:else}
      <div class="catch-ticket p-8 text-center">
        <svg class="mx-auto mb-3 text-foam/20" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 17l3-10 3 3 3-7 3 7 3-3 3 10H3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <p class="font-display font-semibold text-foam/55">No lots awaiting action</p>
        <p class="font-mono text-xs text-foam/35 mt-1">New surplus will appear here as vessels check in</p>
      </div>
    {/if}
  </div>

  <!-- Right rail -->
  <div class="flex flex-col gap-5">
    <!-- Exception alert: lots inside the 48-hour cold-chain window -->
    {#if expiringSoon > 0}
      <div class="rounded-sm border border-salmon/30 p-4" style="background: var(--surface-error);">
        <p class="font-mono text-[10px] uppercase tracking-[0.28em] text-salmon/80 mb-1">Attention</p>
        <p class="font-mono text-sm text-salmon leading-snug">
          {expiringSoon} lot{expiringSoon > 1 ? 's' : ''} expiring within 48 hours
        </p>
      </div>
    {/if}

    <!-- Agent Activity Feed -->
    <AgentStatusPanel {agentActivity} />

    <!-- Impact tile -->
    <div class="tl-panel p-5">
      <p class="font-mono text-[10px] uppercase tracking-[0.28em] text-salmon/80 mb-3">Impact Today</p>
      <div class="flex flex-col gap-3">
        <div>
          <p class="impact-number text-3xl">{totalMeals.toLocaleString()}</p>
          <p class="font-mono text-[10px] text-foam/35 mt-0.5">meals to ACCFB</p>
        </div>
        <div class="border-t border-line pt-3">
          <p class="font-mono text-foam/70 text-sm">{totalLbs.toLocaleString()} <span class="text-foam/35">lbs recovered</span></p>
        </div>
      </div>
    </div>
  </div>
</div>
