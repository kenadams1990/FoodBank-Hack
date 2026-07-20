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

<div class="mb-6">
  <h1 class="font-display font-bold text-foam text-[28px] leading-tight">Vessel Intake — Dock to Processing</h1>
  <p class="font-mono text-mist text-[13.5px] mt-2 max-w-[720px] leading-relaxed">
    On-vessel computer vision drives the purchase decision before the truck rolls. Run the intake pipeline on a
    logged catch, then decide: the agent drafts, you approve. Every decision is written to the audit log.
  </p>
</div>

<!-- Live vs Simulated legend — honesty about what is and isn't real AI today -->
<div class="tl-panel flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 mb-6">
  <span class="tl-label">What's real:</span>
  <span class="inline-flex items-center gap-1.5 font-mono text-sm text-mist">
    <span class="w-2 h-2 rounded-full bg-success-hi"></span>
    Scoring · procurement · routing — <span class="text-foam">live agent logic</span>
  </span>
  <span class="inline-flex items-center gap-1.5 font-mono text-sm text-mist">
    <span class="w-2 h-2 rounded-full bg-warning"></span>
    On-vessel computer-vision counts &amp; thermal readings — <span class="text-foam">simulated</span> (trained fish-scan model is roadmap)
  </span>
</div>

{#if loading}
  <p class="font-mono text-mist/55 animate-pulse">Loading intake feed…</p>
{:else}
  <div class="space-y-6">
    {#each previews as { log, dispatch, dockResult } (log.id)}
      {@const st = states[log.id]}
      {@const run = st?.run}
      <div class="tl-panel p-5">
        <!-- Header -->
        <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-display font-bold text-foam text-lg">{log.vesselName}</h2>
              <span class="chip-neutral">{log.vesselType}</span>
            </div>
            <p class="font-mono text-mist text-sm mt-1">
              {log.species} · {log.location} · pickup window {log.pickupWindow}
            </p>
          </div>
          <div class="text-right">
            <p class="font-mono font-bold text-foam text-base">{log.estimatedLbs.toLocaleString()} <span class="font-normal text-mist text-sm">lbs</span></p>
            <span class="readout inline-block mt-1">{log.id}</span>
          </div>
        </div>

        <!-- On-vessel computer vision — SIMULATED -->
        <div class="rounded-sm border border-white/10 bg-white/5 p-3 mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="tl-label">On-Vessel Computer Vision (at harvest)</span>
            <span class="chip-warn">Simulated</span>
          </div>
          <p class="font-mono text-sm text-mist">
            {log.cvEstimate.count.toLocaleString()} detected · avg {log.cvEstimate.avgWeightLbs} lbs ·
            grade {log.cvEstimate.sizeGrade} · confidence {(log.cvEstimate.confidence * 100).toFixed(0)}%
          </p>
        </div>

        <!-- Dispatch recommendation + Run control -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-start gap-3">
            <span class="{dispatch.recommend ? 'chip-ok' : 'chip-neutral'} whitespace-nowrap">
              {dispatch.recommend ? 'DISPATCH RECOMMENDED' : 'HOLD'}
            </span>
            <div class="font-mono text-sm text-mist">
              <p>{dispatch.reason}</p>
              <p class="text-foam/35 text-xs mt-1">Cold transport: {dispatch.coldTransportUnit}</p>
            </div>
          </div>
          <div class="text-right">
            {#if st?.phase === 'idle'}
              <button
                on:click={() => runIntake(log.id)}
                class="bg-salmon hover:bg-salmon-hi text-ink text-sm font-medium px-4 py-2 rounded-sm transition-colors"
              >Run intake pipeline</button>
              <p class="text-xs text-foam/35 mt-1 font-mono">Agent recommends. You decide.</p>
            {:else if st?.phase === 'running'}
              <button disabled class="bg-salmon/50 text-ink text-sm font-medium px-4 py-2 rounded-sm cursor-wait">Running…</button>
            {:else}
              <span class="chip-ok">Pipeline run</span>
            {/if}
          </div>
        </div>

        {#if st?.errorMsg}
          <p class="font-mono text-xs text-danger-hi mb-3">{st.errorMsg}</p>
        {/if}

        <!-- HOLD outcome -->
        {#if st?.phase === 'held'}
          <div class="rounded-sm border border-white/10 bg-white/5 p-4 font-mono text-sm text-mist">
            <p class="font-medium text-foam mb-1">Agent held this catch — no dispatch.</p>
            <p>{run?.dispatch.reason}</p>
          </div>
        {/if}

        <!-- Downstream agent decisions (revealed after a persisted run) -->
        {#if run?.persisted && (st?.phase === 'ran' || st?.phase === 'deciding' || st?.phase === 'approved' || st?.phase === 'rejected')}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div class="tl-panel p-3">
              <p class="tl-label mb-1">Opportunity Score</p>
              <p class="impact-number text-2xl">{run.score?.total}<span class="font-mono font-normal text-mist text-sm">/100</span></p>
            </div>
            <div class="tl-panel p-3">
              <p class="tl-label mb-1">Counter-Offer</p>
              <p class="impact-number text-2xl">${run.procurement?.recommendedPricePerLb}<span class="font-mono font-normal text-mist text-sm">/lb</span></p>
              <p class="font-mono text-[11px] text-success-hi mt-0.5">${run.procurement?.estimatedSavingsVsMarket.toLocaleString()} saved vs market</p>
            </div>
            <div class="tl-panel p-3">
              <p class="tl-label mb-1">Facility Match</p>
              <p class="font-display font-semibold text-foam text-sm leading-tight mt-1">{run.topMatch?.facility.name ?? '—'}</p>
            </div>
            <div class="tl-panel p-3">
              <p class="tl-label mb-1">Route → ACCFB</p>
              <p class="impact-number text-2xl">{run.accfbDelivery?.allocatedLbs.toLocaleString()}<span class="font-mono font-normal text-mist text-sm"> lbs</span></p>
            </div>
          </div>
        {/if}

        <!-- Dockside sort table (simulated thermal QA) -->
        <div class="overflow-x-auto">
          <div class="flex items-center gap-2 mb-2">
            <span class="tl-label">Dockside Sort — Barcoded Bins</span>
            <span class="chip-warn">Thermal QA simulated</span>
          </div>
          <table class="w-full font-mono text-sm">
            <thead>
              <tr class="text-left tl-label border-b border-line">
                <th class="py-2 pr-4 font-normal">Container</th>
                <th class="py-2 pr-4 font-normal text-right">Lbs</th>
                <th class="py-2 pr-4 font-normal text-right">Temp (°C)</th>
                <th class="py-2 pr-4 font-normal">Grade</th>
                <th class="py-2 pr-4 font-normal">QA</th>
                <th class="py-2 font-normal">Reason</th>
              </tr>
            </thead>
            <tbody>
              {#each dockResult.containers as c}
                <tr class="border-b border-line last:border-0">
                  <td class="py-2 pr-4 text-mist">{c.containerId}</td>
                  <td class="py-2 pr-4 text-right text-foam">{c.lbs.toLocaleString()}</td>
                  <td class="py-2 pr-4 text-right {c.qaStatus === 'FLAG' ? 'text-danger-hi font-medium' : 'text-foam'}">{c.tempC}</td>
                  <td class="py-2 pr-4 text-foam">{c.sizeGrade}</td>
                  <td class="py-2 pr-4">
                    <span class="{c.qaStatus === 'PASS' ? 'chip-ok' : 'chip-alert'}">{c.qaStatus}</span>
                  </td>
                  <td class="py-2 text-foam/55 text-xs">{c.reason}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="font-mono text-xs text-foam/35 mt-3">{dockResult.summary}</p>

        <!-- Operator decision -->
        {#if run?.persisted && st?.phase === 'ran'}
          <div class="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
            <p class="font-mono text-xs text-foam/35 mr-auto">Pending approval logged · Agent recommends. You decide.</p>
            <button
              on:click={() => decide(log.id, 'REJECT')}
              class="text-sm font-medium px-4 py-2 rounded-sm border border-white/10 text-mist hover:bg-white/5 transition-colors"
            >Reject</button>
            <button
              on:click={() => decide(log.id, 'APPROVE')}
              class="bg-salmon hover:bg-salmon-hi text-ink text-sm font-medium px-4 py-2 rounded-sm transition-colors"
            >Approve Dispatch</button>
          </div>
        {:else if st?.phase === 'deciding'}
          <p class="mt-4 text-right font-mono text-xs text-foam/35">Recording decision…</p>
        {:else if st?.phase === 'approved'}
          <div class="mt-4 rounded-sm border border-success/40 bg-success/10 p-4 font-mono text-sm">
            <p class="font-semibold text-success-hi">Dispatch approved — logged to audit.</p>
            <p class="text-mist mt-0.5">
              Lot moved to PROCUREMENT_CONFIRMED{#if st.shipmentCases}, ACCFB shipment scheduled ({st.shipmentCases.toLocaleString()} cases){/if}.
              <a href="/audit" class="underline hover:no-underline text-salmon">View in audit trail →</a>
            </p>
          </div>
        {:else if st?.phase === 'rejected'}
          <div class="mt-4 rounded-sm border border-white/10 bg-white/5 p-4 font-mono text-sm text-mist">
            <p class="font-semibold text-foam">Dispatch rejected — logged to audit.</p>
            <a href="/audit" class="underline hover:no-underline text-mist">View in audit trail →</a>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
