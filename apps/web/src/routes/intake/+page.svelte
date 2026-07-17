<script lang="ts">
  import { onMount } from 'svelte';
  import type { VesselCatchLog, PickupDispatch, DockIntakeResult } from '$shared/types';

  interface Preview {
    log: VesselCatchLog;
    dispatch: PickupDispatch;
    dockResult: DockIntakeResult;
  }

  // Full run result returned by POST /api/intake/run (shape mirrors runIntake()).
  interface RunResult {
    catchLog: VesselCatchLog;
    dispatch: PickupDispatch;
    dockResult: DockIntakeResult;
    persisted: boolean;
    lot: { id: string; score?: number; status: string } | null;
    score: { total: number; rationale: string } | null;
    procurement: {
      recommendedPricePerLb: number;
      estimatedTotalCost: number;
      estimatedSavingsVsMarket: number;
    } | null;
    topMatch: { facility: { name: string }; recommendedSlotDate: string } | null;
    accfbDelivery: { allocatedLbs: number; reason: string } | null;
    overflowDraft: { overflowLbs: number } | null;
    approval: { id: string; status: string } | null;
  }

  type Phase = 'idle' | 'running' | 'ran' | 'deciding' | 'approved' | 'rejected' | 'held';
  interface CatchState {
    phase: Phase;
    run: RunResult | null;
    shipmentCases: number | null;
    errorMsg: string | null;
  }

  let previews: Preview[] = [];
  let loading = true;
  let states: Record<string, CatchState> = {};

  onMount(async () => {
    try {
      const res = await fetch('/api/intake');
      const data = await res.json();
      previews = data.intakes as Preview[];
      for (const p of previews) {
        states[p.log.id] = { phase: 'idle', run: null, shipmentCases: null, errorMsg: null };
      }
      states = states;
    } finally {
      loading = false;
    }
  });

  async function runIntake(id: string) {
    states[id] = { ...states[id], phase: 'running', errorMsg: null };
    states = states;
    try {
      const res = await fetch('/api/intake/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ catchLogId: id }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Run failed');
      const run = (await res.json()) as RunResult;
      states[id] = {
        ...states[id],
        run,
        phase: run.persisted ? 'ran' : 'held',
      };
    } catch (e) {
      states[id] = { ...states[id], phase: 'idle', errorMsg: e instanceof Error ? e.message : 'Run failed' };
    }
    states = states;
  }

  async function decide(id: string, decision: 'APPROVE' | 'REJECT') {
    const approvalId = states[id].run?.approval?.id;
    if (!approvalId) return;
    states[id] = { ...states[id], phase: 'deciding', errorMsg: null };
    states = states;
    try {
      const res = await fetch('/api/intake/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ approvalId, decision, operatorId: 'operator:demo' }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Decision failed');
      const result = await res.json();
      states[id] = {
        ...states[id],
        phase: decision === 'APPROVE' ? 'approved' : 'rejected',
        shipmentCases: result.shipment?.cases ?? null,
      };
    } catch (e) {
      states[id] = { ...states[id], phase: 'ran', errorMsg: e instanceof Error ? e.message : 'Decision failed' };
    }
    states = states;
  }
</script>

<svelte:head><title>Vessel Intake — TideLift</title></svelte:head>

<div class="mb-5">
  <h1 class="text-2xl font-bold text-brand-dark">Vessel Intake — Dock to Processing</h1>
  <p class="text-gray-500 text-sm mt-1 max-w-3xl">
    On-vessel CV drives the purchase decision before the truck rolls. Run the intake pipeline on a
    logged catch, then decide: the agent drafts, you approve. Every decision is written to the audit log.
  </p>
</div>

<!-- Live vs Simulated legend — honesty about what is and isn't real AI today -->
<div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-6">
  <span class="font-semibold text-slate-500 uppercase tracking-wider">What's real:</span>
  <span class="inline-flex items-center gap-1.5 text-slate-600">
    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
    Scoring · procurement · routing math — <span class="font-medium">live agent logic</span>
  </span>
  <span class="inline-flex items-center gap-1.5 text-slate-600">
    <span class="w-2 h-2 rounded-full bg-amber-400"></span>
    On-vessel CV counts &amp; thermal readings — <span class="font-medium">simulated</span> (trained fish-scan model is roadmap)
  </span>
</div>

{#if loading}
  <p class="text-gray-400 animate-pulse">Loading intake feed…</p>
{:else}
  <div class="space-y-6">
    {#each previews as { log, dispatch, dockResult } (log.id)}
      {@const st = states[log.id]}
      {@const run = st?.run}
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <!-- Header -->
        <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-brand-dark">{log.vesselName}</h2>
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full
                  {log.vesselType === 'wild-catch' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}"
              >{log.vesselType}</span>
            </div>
            <p class="text-sm text-gray-500 capitalize mt-0.5">{log.species}</p>
          </div>
          <div class="text-right text-sm text-gray-500">
            <p class="font-medium text-brand-dark">{log.estimatedLbs.toLocaleString()} lbs</p>
            <p>{log.location}</p>
            <p>{log.pickupWindow}</p>
          </div>
        </div>

        <!-- On-vessel CV — SIMULATED -->
        <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            On-Vessel CV (at harvest)
            <span class="normal-case tracking-normal text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Simulated</span>
          </p>
          <p class="text-gray-700">
            {log.cvEstimate.count.toLocaleString()} detected · avg {log.cvEstimate.avgWeightLbs} lbs ·
            grade {log.cvEstimate.sizeGrade} · confidence {(log.cvEstimate.confidence * 100).toFixed(0)}%
          </p>
        </div>

        <!-- Dispatch recommendation + Run control -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-start gap-3">
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap
                {dispatch.recommend ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}"
            >{dispatch.recommend ? 'DISPATCH RECOMMENDED' : 'HOLD'}</span>
            <div class="text-sm text-gray-600">
              <p>{dispatch.reason}</p>
              <p class="text-xs text-gray-400 mt-1">Cold transport: {dispatch.coldTransportUnit}</p>
            </div>
          </div>
          <div class="text-right">
            {#if st?.phase === 'idle'}
              <button
                on:click={() => runIntake(log.id)}
                class="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >Run intake pipeline</button>
              <p class="text-xs text-gray-400 italic mt-1">Agent recommends. You decide.</p>
            {:else if st?.phase === 'running'}
              <button disabled class="bg-teal-600/50 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-wait">Running…</button>
            {:else}
              <span class="text-xs font-mono text-teal-700">✓ pipeline run</span>
            {/if}
          </div>
        </div>

        {#if st?.errorMsg}
          <p class="text-xs text-red-600 mb-3">⚠ {st.errorMsg}</p>
        {/if}

        <!-- HOLD outcome -->
        {#if st?.phase === 'held'}
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p class="font-medium text-gray-700 mb-1">Agent held this catch — no dispatch.</p>
            <p>{run?.dispatch.reason}</p>
          </div>
        {/if}

        <!-- Downstream agent decisions (revealed after a persisted run) -->
        {#if run?.persisted && (st?.phase === 'ran' || st?.phase === 'deciding' || st?.phase === 'approved' || st?.phase === 'rejected')}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div class="rounded-lg border border-gray-100 p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Opportunity Score</p>
              <p class="text-2xl font-bold text-brand-dark">{run.score?.total}<span class="text-sm text-gray-400">/100</span></p>
            </div>
            <div class="rounded-lg border border-gray-100 p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Counter-Offer</p>
              <p class="text-2xl font-bold text-brand-dark">${run.procurement?.recommendedPricePerLb}<span class="text-sm text-gray-400">/lb</span></p>
              <p class="text-[11px] text-emerald-600 mt-0.5">${run.procurement?.estimatedSavingsVsMarket.toLocaleString()} saved vs market</p>
            </div>
            <div class="rounded-lg border border-gray-100 p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Facility Match</p>
              <p class="text-sm font-semibold text-brand-dark leading-tight mt-1">{run.topMatch?.facility.name ?? '—'}</p>
            </div>
            <div class="rounded-lg border border-gray-100 p-3">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Route → ACCFB</p>
              <p class="text-2xl font-bold text-brand-dark">{run.accfbDelivery?.allocatedLbs.toLocaleString()}<span class="text-sm text-gray-400"> lbs</span></p>
            </div>
          </div>
        {/if}

        <!-- Dockside sort table (simulated thermal QA) -->
        <div class="overflow-x-auto">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            Dockside sort — barcoded bins
            <span class="normal-case tracking-normal text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Thermal QA simulated</span>
          </p>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th class="py-2 pr-4">Container</th>
                <th class="py-2 pr-4">Lbs</th>
                <th class="py-2 pr-4">Temp (°C)</th>
                <th class="py-2 pr-4">Grade</th>
                <th class="py-2 pr-4">QA</th>
                <th class="py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {#each dockResult.containers as c}
                <tr class="border-b border-gray-50 last:border-0">
                  <td class="py-2 pr-4 font-mono text-xs text-gray-700">{c.containerId}</td>
                  <td class="py-2 pr-4 text-gray-700">{c.lbs.toLocaleString()}</td>
                  <td class="py-2 pr-4 {c.qaStatus === 'FLAG' ? 'text-red-600 font-medium' : 'text-gray-700'}">{c.tempC}</td>
                  <td class="py-2 pr-4 text-gray-700">{c.sizeGrade}</td>
                  <td class="py-2 pr-4">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full
                      {c.qaStatus === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}"
                    >{c.qaStatus}</span>
                  </td>
                  <td class="py-2 text-xs text-gray-400">{c.reason}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-gray-400 mt-3">{dockResult.summary}</p>

        <!-- Operator decision -->
        {#if run?.persisted && st?.phase === 'ran'}
          <div class="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
            <p class="text-xs text-gray-400 italic mr-auto">Pending approval logged · Agent recommends. You decide.</p>
            <button
              on:click={() => decide(log.id, 'REJECT')}
              class="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >Reject</button>
            <button
              on:click={() => decide(log.id, 'APPROVE')}
              class="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >Approve Dispatch</button>
          </div>
        {:else if st?.phase === 'deciding'}
          <p class="mt-4 text-right text-xs font-mono text-gray-400">Recording decision…</p>
        {:else if st?.phase === 'approved'}
          <div class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p class="font-semibold text-emerald-800">✓ Dispatch approved — logged to audit.</p>
            <p class="text-emerald-700 mt-0.5">
              Lot moved to PROCUREMENT_CONFIRMED{#if st.shipmentCases}, ACCFB shipment scheduled ({st.shipmentCases.toLocaleString()} cases){/if}.
              <a href="/audit" class="underline hover:no-underline">View in audit trail →</a>
            </p>
          </div>
        {:else if st?.phase === 'rejected'}
          <div class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p class="font-semibold text-gray-700">Dispatch rejected — logged to audit.</p>
            <a href="/audit" class="underline hover:no-underline text-gray-500">View in audit trail →</a>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
