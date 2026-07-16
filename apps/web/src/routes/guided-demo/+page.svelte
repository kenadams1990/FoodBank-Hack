<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import type { PageData } from './$types';

  export let data: PageData;

  const TOTAL_STEPS = 9;
  const STEP_DURATION_MS = 3500;

  const STEPS = [
    { id: 1, icon: '🎣', label: 'On-Vessel CV → Dispatch Decision', agent: 'intake:evaluateCatchLog' },
    { id: 2, icon: '📦', label: 'Dockside Sort — Barcoded Bins + Thermal QA', agent: 'intake:sortAtDock' },
    { id: 3, icon: '📊', label: 'Opportunity Score', agent: 'scorer:scoreLot' },
    { id: 4, icon: '💰', label: 'Procurement Counter-Offer', agent: 'procure:draftProcurement' },
    { id: 5, icon: '🏭', label: 'Facility Match', agent: 'canning:matchFacilities' },
    { id: 6, icon: '🚚', label: 'Delivery Routing → ACCFB', agent: 'route:planEquityDelivery' },
    { id: 7, icon: '✅', label: 'Operator Approval', agent: 'approvals:approveAction' },
    { id: 8, icon: '🆘', label: 'Perishable Rescue', agent: 'perishable:draftPerishableRescue' },
    { id: 9, icon: '🔀', label: 'Overflow Disposition', agent: 'overflow:draftOverflowDisposition' },
  ];

  let currentStep = 0; // 0 = nothing revealed yet
  let playing = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const lbsTile = tweened(0, { duration: 900, easing: cubicOut });
  const dollarTile = tweened(0, { duration: 900, easing: cubicOut });
  const mealsTile = tweened(0, { duration: 900, easing: cubicOut });

  function tick() {
    if (currentStep < TOTAL_STEPS) currentStep += 1;
    if (currentStep >= TOTAL_STEPS) pause();
  }

  function play() {
    if (currentStep >= TOTAL_STEPS) currentStep = 0;
    playing = true;
    clearInterval(timer);
    tick();
    timer = setInterval(tick, STEP_DURATION_MS);
  }

  function pause() {
    playing = false;
    clearInterval(timer);
  }

  function next() {
    pause();
    if (currentStep < TOTAL_STEPS) currentStep += 1;
  }

  function prev() {
    pause();
    if (currentStep > 0) currentStep -= 1;
  }

  function restart() {
    pause();
    currentStep = 0;
    lbsTile.set(0, { duration: 0 });
    dollarTile.set(0, { duration: 0 });
    mealsTile.set(0, { duration: 0 });
    play();
  }

  onMount(() => {
    play();
  });

  onDestroy(() => {
    clearInterval(timer);
  });

  $: if (currentStep >= 2) {
    lbsTile.set(data.dockResult.totalLbsAccepted);
    mealsTile.set(Math.round(data.dockResult.totalLbsAccepted / 1.2));
  }
  $: if (currentStep >= 4) {
    dollarTile.set(data.procurement.estimatedSavingsVsMarket);
  }

  $: scoreBars = [
    { label: 'Price savings', value: data.score.priceSavings, max: 30 },
    { label: 'Urgency', value: data.score.urgency, max: 25 },
    { label: 'Lot size', value: data.score.lotSize, max: 25 },
    { label: 'Demand match', value: data.score.demandMatch, max: 20 },
  ];
</script>

<svelte:head><title>Guided Demo — TideLift</title></svelte:head>

<div class="mb-6">
  <p class="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Self-running walkthrough</p>
  <h1 class="text-2xl font-bold text-brand-dark">F/V Morning Star, dock to ACCFB</h1>
  <p class="text-gray-500 text-sm mt-1 max-w-2xl">
    Every step below calls the real TideLift agent functions on one catch — 2,100 lbs of salmon
    logged as <span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">vcl-001</span>,
    scored and routed as lot
    <span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{data.lot.id}</span>.
    Nothing here is scripted narrative — the numbers and reasons are live agent output.
  </p>
</div>

<!-- Controls + progress -->
<div class="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
  <div class="flex items-center gap-2">
    <button
      on:click={prev}
      disabled={currentStep <= 0}
      class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition"
      aria-label="Previous step"
    >⏮</button>

    {#if playing}
      <button
        on:click={pause}
        class="px-4 py-2 rounded-lg bg-brand-dark text-white text-sm font-semibold hover:bg-brand transition"
      >⏸ Pause</button>
    {:else}
      <button
        on:click={play}
        class="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition"
      >▶ {currentStep === 0 ? 'Play' : currentStep >= TOTAL_STEPS ? 'Replay' : 'Resume'}</button>
    {/if}

    <button
      on:click={next}
      disabled={currentStep >= TOTAL_STEPS}
      class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition"
      aria-label="Next step"
    >⏭</button>

    <button
      on:click={restart}
      class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
      aria-label="Restart"
    >↺</button>
  </div>

  <div class="flex-1 min-w-[200px]">
    <div class="flex justify-between text-xs text-gray-400 mb-1.5">
      <span>Step {Math.min(currentStep, TOTAL_STEPS)} of {TOTAL_STEPS}</span>
      {#if currentStep >= TOTAL_STEPS}<span class="text-teal-600 font-semibold">Complete</span>{/if}
    </div>
    <div class="flex gap-1">
      {#each STEPS as step (step.id)}
        <div
          class="h-1.5 flex-1 rounded-full transition-colors duration-300
            {currentStep >= step.id ? 'bg-teal-500' : 'bg-gray-200'}"
        ></div>
      {/each}
    </div>
  </div>
</div>

<!-- Impact tiles -->
<div class="sticky top-14 sm:top-16 z-10 bg-gray-50/95 backdrop-blur-sm pt-1 pb-3 sm:pb-4 -mx-2 px-2">
  <div class="grid grid-cols-3 gap-2 sm:gap-4">
    <div class="bg-white rounded-xl border border-gray-100 p-2 sm:p-4 text-center">
      <p class="text-lg sm:text-2xl mb-0.5 sm:mb-1">🐟</p>
      <p class="text-base sm:text-2xl font-extrabold text-brand-dark tabular-nums">{Math.round($lbsTile).toLocaleString()} lbs</p>
      <p class="hidden sm:block text-xs text-gray-400 mt-1">Recovered / diverted from waste — dockside-QA-cleared</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-100 p-2 sm:p-4 text-center">
      <p class="text-lg sm:text-2xl mb-0.5 sm:mb-1">💵</p>
      <p class="text-base sm:text-2xl font-extrabold text-brand-dark tabular-nums">${Math.round($dollarTile).toLocaleString()}</p>
      <p class="hidden sm:block text-xs text-gray-400 mt-1">Saved vs. market — agent's counter-offer vs. {data.lot.species} market rate</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-100 p-2 sm:p-4 text-center">
      <p class="text-lg sm:text-2xl mb-0.5 sm:mb-1">🍽️</p>
      <p class="text-base sm:text-2xl font-extrabold text-brand-dark tabular-nums">{Math.round($mealsTile).toLocaleString()}</p>
      <p class="hidden sm:block text-xs text-gray-400 mt-1">Meals recovered — Feeding America basis, 1.2 lbs/meal</p>
    </div>
  </div>
</div>

<!-- Step timeline -->
<div class="space-y-0">
  {#each STEPS as step (step.id)}
    {@const state = currentStep > step.id ? 'done' : currentStep === step.id ? 'active' : 'upcoming'}
    <div class="flex gap-4">
      <div class="flex flex-col items-center">
        <div
          class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors
            {state === 'done' ? 'bg-teal-600 text-white' : state === 'active' ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'}"
        >
          {state === 'done' ? '✓' : step.id}
        </div>
        {#if step.id < STEPS.length}
          <div class="w-0.5 flex-1 my-1 {state === 'done' ? 'bg-teal-500' : 'bg-gray-200'}"></div>
        {/if}
      </div>

      <div class="flex-1 pb-6">
        {#if currentStep >= step.id}
          <div transition:fade={{ duration: 250 }} class="bg-white rounded-xl border border-gray-100 p-5">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xl">{step.icon}</span>
              <h2 class="font-semibold text-brand-dark text-sm sm:text-base truncate">{step.label}</h2>
              {#if state === 'active'}
                <span class="text-xs text-amber-600 animate-pulse ml-1">● Running</span>
              {/if}
              <span class="hidden sm:inline text-xs text-gray-300 font-mono ml-auto">{step.agent}</span>
            </div>

            {#if step.id === 1}
              <p class="text-sm text-gray-600 mb-3">
                On-vessel CV already decided whether to send cold transport — before the boat is
                even at the dock.
              </p>
              <div class="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700">
                <span class="font-semibold text-brand-dark">{data.catchLog.vesselName}</span>
                ({data.catchLog.vesselType}) — {data.catchLog.species}, {data.catchLog.estimatedLbs.toLocaleString()} lbs.
                CV detected {data.catchLog.cvEstimate.count.toLocaleString()}, avg {data.catchLog.cvEstimate.avgWeightLbs} lbs,
                grade {data.catchLog.cvEstimate.sizeGrade}, confidence {(data.catchLog.cvEstimate.confidence * 100).toFixed(0)}%.
              </div>
              <div class="flex items-start gap-3">
                <span
                  class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap
                    {data.dispatch.recommend ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}"
                >{data.dispatch.recommend ? 'DISPATCH RECOMMENDED' : 'HOLD'}</span>
                <p class="text-sm text-gray-600">{data.dispatch.reason}</p>
              </div>

            {:else if step.id === 2}
              <p class="text-sm text-gray-600 mb-3">
                At transfer, the catch is sorted into barcoded reusable bins; a thermal cam
                verifies every bin stayed within the cold chain.
              </p>
              <div class="overflow-x-auto mb-3">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th class="py-2 pr-4">Bin</th>
                      <th class="py-2 pr-4">Lbs</th>
                      <th class="py-2 pr-4">Temp (°C)</th>
                      <th class="py-2">QA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each data.dockResult.containers as c}
                      <tr class="border-b border-gray-50 last:border-0">
                        <td class="py-2 pr-4 font-mono text-xs text-gray-700">{c.containerId}</td>
                        <td class="py-2 pr-4 text-gray-700">{c.lbs.toLocaleString()}</td>
                        <td class="py-2 pr-4 {c.qaStatus === 'FLAG' ? 'text-red-600 font-medium' : 'text-gray-700'}">{c.tempC}</td>
                        <td class="py-2">
                          <span
                            class="text-xs font-semibold px-2 py-0.5 rounded-full
                              {c.qaStatus === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}"
                          >{c.qaStatus}</span>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              <p class="text-xs text-gray-400">{data.dockResult.summary}</p>

            {:else if step.id === 3}
              <p class="text-sm text-gray-600 mb-3">
                The scorer weighs discount, urgency, lot size, and demand fit into one 0–100
                opportunity score.
              </p>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl font-extrabold text-brand-dark tabular-nums">{data.score.total}</span>
                <span class="text-sm text-gray-400">/ 100</span>
              </div>
              {#each scoreBars as b}
                <div class="mb-2">
                  <div class="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>{b.label}</span><span>{b.value}/{b.max}</span>
                  </div>
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-teal-500 rounded-full" style="width: {(b.value / b.max) * 100}%"></div>
                  </div>
                </div>
              {/each}
              <p class="text-xs text-gray-400 mt-3">{data.score.rationale}</p>

            {:else if step.id === 4}
              <div class="flex items-center gap-2 mb-3">
                <p class="text-sm text-gray-600 flex-1">
                  A counter-offer, floored at 60% of market so the food bank never overpays for
                  surplus catch.
                </p>
                <span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">Requires approval</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                <div>
                  <p class="text-xs text-gray-400">Offer</p>
                  <p class="font-semibold text-brand-dark">${data.procurement.recommendedPricePerLb}/lb</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">Market</p>
                  <p class="font-semibold text-gray-500">${data.lot.marketPricePerLb}/lb</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">60% floor</p>
                  <p class="font-semibold text-gray-500">${(data.lot.marketPricePerLb * 0.6).toFixed(2)}/lb</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400">Est. savings</p>
                  <p class="font-semibold text-teal-600">${data.procurement.estimatedSavingsVsMarket.toLocaleString()}</p>
                </div>
              </div>
              <details class="text-xs text-gray-400">
                <summary class="cursor-pointer hover:text-gray-600">View draft negotiation email</summary>
                <pre class="mt-2 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">{data.procurement.negotiationScript}</pre>
              </details>

            {:else if step.id === 5}
              <div class="flex items-center gap-2 mb-3">
                <p class="text-sm text-gray-600 flex-1">Ranked by species compatibility, open capacity, certifications, and cost.</p>
                <span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">Requires approval</span>
              </div>
              {#if data.topMatch}
                <div class="bg-gray-50 rounded-lg p-3 mb-2">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-semibold text-brand-dark">{data.topMatch.facility.name}</span>
                    <span class="text-xs font-bold bg-teal-100 text-teal-700 rounded-full px-2 py-0.5">match {data.topMatch.matchScore}/100</span>
                  </div>
                  <p class="text-xs text-gray-500">{data.topMatch.facility.location} · {data.topMatch.recommendedSlotDate} · est. {data.topMatch.estimatedCans.toLocaleString()} cans</p>
                </div>
                <p class="text-xs text-gray-400">{data.topMatch.rationale}</p>
              {:else}
                <p class="text-sm text-gray-400">No compatible facility slot available.</p>
              {/if}

            {:else if step.id === 6}
              <div class="flex items-center gap-2 mb-3">
                <p class="text-sm text-gray-600 flex-1">
                  Equity-aware routing — protein gap, perishability, and access-window tightness,
                  not miles alone — sends this catch to {data.accfb.name}.
                </p>
                <span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">Requires approval</span>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 mb-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-semibold text-brand-dark">{data.accfb.name}</span>
                  <span class="text-xs font-bold bg-teal-100 text-teal-700 rounded-full px-2 py-0.5">urgency {data.accfbDelivery.urgencyScore.toFixed(2)}</span>
                </div>
                <p class="text-xs text-gray-500">
                  {data.accfbDelivery.allocatedLbs.toLocaleString()} lbs allocated · access window {data.accfbDelivery.accessWindow}
                  {#if data.accfbDelivery.perishablePriority}· <span class="text-accent font-medium">prioritized (perishable)</span>{/if}
                </p>
              </div>
              <p class="text-xs text-gray-400">{data.accfbDelivery.reason}</p>

            {:else if step.id === 7}
              <p class="text-sm text-gray-600 mb-3">
                Every draft above is a recommendation — an operator makes the call. This
                walkthrough plays the operator's decision so the audit trail is real, not staged.
              </p>
              <div class="flex items-start gap-3 mb-3">
                <span class="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                  {data.approval.status}
                </span>
                <div class="text-sm text-gray-600">
                  <p>Resolved by <span class="font-mono text-xs">{data.approval.operatorId}</span> — {data.approval.notes}</p>
                  <p class="text-xs text-gray-400 mt-1">Approval {data.approval.id} · logged {new Date(data.approval.resolvedAt ?? data.approval.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p class="text-xs text-gray-400 italic">Agent recommends. You decide. — every step above stays a draft until this click.</p>

            {:else if step.id === 8}
              <p class="text-sm text-gray-600 mb-3">
                When lots are hours from expiry, the perishable rescue agent builds an emergency
                routing plan — cold-transport assignments and agency delivery rows — so nothing
                spoils waiting for the normal weekly run.
              </p>
              <p class="text-xs text-gray-400 italic">Perishable rescue output visible on the Cold-Chain Ops page. Lot {data.lot.id} flagged as urgent ({data.lot.notes}).</p>

            {:else if step.id === 9}
              <div class="flex items-center gap-2 mb-3">
                <p class="text-sm text-gray-600 flex-1">
                  When canning capacity is exceeded or no facility matches, the overflow agent
                  ranks alternative destinations — community kitchen, direct food bank delivery,
                  or retail — so no lbs are stranded.
                </p>
                <span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">Requires approval</span>
              </div>

              <!-- Retail eligibility pill -->
              <div class="flex items-center gap-2 mb-4">
                <span class="text-xs font-semibold px-2 py-1 rounded-full
                  {data.overflowDraft.retailEligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
                  Retail {data.overflowDraft.retailEligible ? 'eligible' : 'ineligible'}
                </span>
                <span class="text-xs text-gray-400">
                  {data.overflowDraft.overflowLbs.toLocaleString()} lbs overflow · ${ data.lot.pricePerLb.toFixed(2)}/lb vs market ${data.lot.marketPricePerLb.toFixed(2)}/lb
                </span>
              </div>

              {#if data.overflowDraft.destinations.length === 0}
                <p class="text-sm text-teal-600 font-medium">All lbs absorbed by canning — no overflow destinations needed.</p>
              {:else}
                <!-- Ranked destination cards -->
                <div class="space-y-3 mb-4">
                  {#each data.overflowDraft.destinations as dest}
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="w-6 h-6 rounded-full bg-brand-dark text-white text-xs font-bold flex items-center justify-center shrink-0">{dest.rank}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full
                          {dest.type === 'MINI_PROCESSOR' ? 'bg-purple-100 text-purple-700'
                          : dest.type === 'FOOD_BANK_DIRECT' ? 'bg-teal-100 text-teal-700'
                          : 'bg-orange-100 text-orange-700'}">
                          {dest.type === 'MINI_PROCESSOR' ? 'Community Kitchen' : dest.type === 'FOOD_BANK_DIRECT' ? 'Food Bank Direct' : 'Retail'}
                        </span>
                        <span class="font-semibold text-brand-dark text-sm">{dest.destinationLabel}</span>
                        <span class="ml-auto text-xs font-semibold text-gray-500 tabular-nums">{dest.lbs.toLocaleString()} lbs</span>
                      </div>
                      <p class="text-xs text-gray-400 pl-8">{dest.reason}</p>
                    </div>
                  {/each}
                </div>
              {/if}

              <!-- Draft reason footer -->
              <p class="text-xs text-gray-400 italic">{data.overflowDraft.reason}</p>
            {/if}
          </div>
        {:else}
          <div class="rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-300">
            {step.label} — pending
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
