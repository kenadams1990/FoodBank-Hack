<script lang="ts">
  import { onMount } from 'svelte';
  import { DEMO_SCENARIO } from '../../../../../../packages/shared/src/demoScenario';
  import { calcImpact, formatImpact } from '$lib/impactMetrics';
  import { SURPLUS_LOTS } from '../../../../../../packages/shared/src/mockData';

  let currentStep = 0;
  let running = false;
  let bundle: any = null;
  let approvalResults: Record<string, string> = {};
  let metrics = formatImpact(calcImpact(SURPLUS_LOTS));

  const STEP_COUNT = DEMO_SCENARIO.steps.length;

  async function runDemo() {
    running = true;
    currentStep = 0;
    approvalResults = {};

    for (let i = 0; i < STEP_COUNT; i++) {
      currentStep = i + 1;
      const step = DEMO_SCENARIO.steps[i];

      if (step.step === 2) {
        await fetch(`/api/lots/${DEMO_SCENARIO.lotId}/score`, { method: 'POST' });
      }
      if (step.step === 3) {
        const res = await fetch(`/api/recommendations/${DEMO_SCENARIO.lotId}`);
        bundle = await res.json();
      }
      if (step.step === 4 || step.step === 6 || step.step === 8) {
        const listRes = await fetch('/api/approvals');
        const { approvals } = await listRes.json();
        const pending = approvals.filter((a: any) => a.entityId === DEMO_SCENARIO.lotId && a.status === 'PENDING');
        for (const apr of pending) {
          await fetch(`/api/approvals/${apr.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'APPROVE', operatorId: 'operator-ken', notes: 'Demo auto-run' }),
          });
          approvalResults[apr.approvalType] = 'APPROVED';
        }
      }

      // Pace the steps for visual effect
      await new Promise((r) => setTimeout(r, 700));
    }

    // Recompute metrics after demo
    const lotRes = await fetch('/api/lots');
    const { lots } = await lotRes.json();
    metrics = formatImpact(calcImpact(lots));
    running = false;
  }
</script>

<svelte:head><title>Demo Run | TideLift</title></svelte:head>

<div class="mb-6 flex items-start justify-between">
  <div>
    <h1 class="text-2xl font-bold text-brand-dark">End-to-End Demo</h1>
    <p class="text-gray-500 text-sm mt-1">{DEMO_SCENARIO.description}</p>
  </div>
  <button on:click={runDemo} disabled={running}
    class="bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50">
    {running ? 'Running…' : '▶ Run Demo'}
  </button>
</div>

<!-- Impact Metrics -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
  {#each Object.entries(metrics) as [label, value]}
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <p class="text-xs text-gray-400">{label}</p>
      <p class="text-lg font-bold text-brand-dark mt-1">{value}</p>
    </div>
  {/each}
</div>

<!-- Pipeline Steps -->
<div class="space-y-3">
  {#each DEMO_SCENARIO.steps as step}
    {@const done = currentStep >= step.step}
    {@const active = currentStep === step.step && running}
    <div class="flex items-start gap-4 p-4 rounded-xl border transition-all
      {active ? 'bg-brand-dark/5 border-brand-dark' : done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}">
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
        {active ? 'bg-brand-dark text-white animate-pulse' : done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}">
        {done && !active ? '✓' : step.step}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <p class="text-sm font-semibold {done ? 'text-gray-800' : 'text-gray-400'}">{step.label}</p>
          {#if step.requiresHuman}
            <span class="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">👤 Human Gate</span>
          {/if}
        </div>
        <p class="text-xs text-gray-500 mt-0.5">{step.description}</p>
        {#if done && step.requiresHuman && approvalResults[step.entity?.replace('Approval','')]}
          <p class="text-xs text-green-600 mt-1 font-medium">✓ Approved by operator-ken</p>
        {/if}
      </div>
    </div>
  {/each}
</div>
