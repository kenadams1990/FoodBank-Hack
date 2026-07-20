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
    <h1 class="font-display font-bold text-2xl text-foam">End-to-End Demo Run</h1>
    <p class="font-mono text-sm text-mist mt-1">Lot 001 — 4,800 lbs Pink Salmon → Canned → Fed</p>
  </div>
  <button
    on:click={runDemo}
    disabled={running}
    class="bg-salmon hover:bg-salmon-hi text-ink font-semibold font-mono px-6 py-2.5 rounded-sm disabled:opacity-50 transition"
  >
    {running ? 'Running…' : complete ? 'Run Again' : '▶ Run Demo'}
  </button>
</div>

<!-- Pipeline Steps -->
<div class="space-y-3 mb-8">
  {#each DEMO_STEPS as step}
    {@const done = currentStep > step.id}
    {@const active = currentStep === step.id}
    <div class="flex gap-4 items-start bg-deep-tide rounded-sm border p-4 transition
      {done ? 'border-ok/40 bg-ok/10' : active ? 'border-warn/40 bg-warn/10' : 'border-line'}">
      <span class="text-2xl">{step.icon}</span>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <p class="font-display font-semibold text-foam text-sm">{step.label}</p>
          {#if step.requiresApproval}
            <span class="chip-warn">Requires approval</span>
          {/if}
          {#if done}
            <span class="text-success-hi text-xs font-mono font-medium">✓ Done</span>
          {:else if active}
            <span class="text-warn text-xs font-mono animate-pulse">● Running</span>
          {/if}
        </div>
        <p class="text-xs font-mono text-mist mt-1">{step.description}</p>
        <p class="text-xs font-mono text-foam/30 mt-0.5">Agent: {step.agentAction}</p>
      </div>
    </div>
  {/each}
</div>

<!-- Impact Metrics -->
{#if impact.lbsRescued > 0}
  <div class="tl-panel p-6">
    <h2 class="tl-label mb-4">Impact Metrics</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {#each [
        { label: 'Food Rescued', value: `${impact.lbsRescued.toLocaleString()} lbs` },
        { label: 'Cans Produced', value: impact.cansProduced.toLocaleString() },
        { label: 'Meals Estimated', value: impact.mealsEstimated.toLocaleString() },
        { label: 'Cost Avoided', value: `$${impact.costAvoided.toLocaleString()}` },
      ] as m}
        <div class="text-center bg-raised rounded-sm border border-line p-4">
          <p class="font-display font-extrabold text-xl text-foam">{m.value}</p>
          <p class="font-mono text-[10px] text-foam/40 uppercase tracking-wider mt-1">{m.label}</p>
        </div>
      {/each}
    </div>
  </div>
{/if}
