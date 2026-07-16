<script lang="ts">
  import { onMount } from 'svelte';
  import { DEMO_STEPS } from '$lib/demoScenario';
  import { calcImpact } from '$lib/impactMetrics';
  import type { SurplusLot } from '../../../../packages/shared/src/types';

  let currentStep = 0;
  let running = false;
  let complete = false;
  let lots: SurplusLot[] = [];
  let impact = { lbsRescued: 0, cansProduced: 0, mealsEstimated: 0, costAvoided: 0, retailValueAvoided: 0 };

  onMount(async () => {
    const res = await fetch('/api/lots');
    const data = await res.json();
    lots = data.lots;
    impact = calcImpact(lots);
  });

  async function runDemo() {
    running = true;
    currentStep = 0;
    complete = false;

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      currentStep = i + 1;
      await delay(900);
    }

    const res = await fetch('/api/lots');
    const data = await res.json();
    lots = data.lots;
    impact = calcImpact(lots);
    complete = true;
    running = false;
  }

  function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
</script>

<svelte:head><title>Demo Run — TideLift</title></svelte:head>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold text-brand-dark">End-to-End Demo Run</h1>
    <p class="text-gray-500 text-sm mt-1">Lot 001 — 4,800 lbs Pink Salmon → Canned → Fed</p>
  </div>
  <button
    on:click={runDemo}
    disabled={running}
    class="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
  >
    {running ? 'Running…' : complete ? 'Run Again' : '▶ Run Demo'}
  </button>
</div>

<!-- Pipeline Steps -->
<div class="space-y-3 mb-8">
  {#each DEMO_STEPS as step}
    {@const done = currentStep > step.id}
    {@const active = currentStep === step.id}
    <div class="flex gap-4 items-start bg-white rounded-xl border p-4 transition
      {done ? 'border-teal-200 bg-teal-50' : active ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'}">
      <span class="text-2xl">{step.icon}</span>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <p class="font-semibold text-brand-dark text-sm">{step.label}</p>
          {#if step.requiresApproval}
            <span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Requires approval</span>
          {/if}
          {#if done}
            <span class="text-teal-600 text-xs font-medium">✓ Done</span>
          {:else if active}
            <span class="text-yellow-600 text-xs animate-pulse">● Running</span>
          {/if}
        </div>
        <p class="text-xs text-gray-500 mt-1">{step.description}</p>
        <p class="text-xs text-gray-300 mt-0.5">Agent: {step.agentAction}</p>
      </div>
    </div>
  {/each}
</div>

<!-- Impact Metrics -->
{#if impact.lbsRescued > 0}
  <div class="bg-white rounded-xl border border-gray-100 p-6">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Impact Metrics</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {#each [
        { label: 'Food Rescued', value: `${impact.lbsRescued.toLocaleString()} lbs`, icon: '🐟' },
        { label: 'Cans Produced', value: impact.cansProduced.toLocaleString(), icon: '🥫' },
        { label: 'Meals Estimated', value: impact.mealsEstimated.toLocaleString(), icon: '🍽️' },
        { label: 'Cost Avoided', value: `$${impact.costAvoided.toLocaleString()}`, icon: '💸' },
      ] as m}
        <div class="text-center bg-teal-50 rounded-xl p-4">
          <p class="text-3xl mb-1">{m.icon}</p>
          <p class="text-xl font-extrabold text-brand-dark">{m.value}</p>
          <p class="text-xs text-gray-400 mt-1">{m.label}</p>
        </div>
      {/each}
    </div>
  </div>
{/if}
