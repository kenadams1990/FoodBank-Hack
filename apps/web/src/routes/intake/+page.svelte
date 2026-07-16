<script lang="ts">
  import { onMount } from 'svelte';
  import type { VesselCatchLog, PickupDispatch, DockIntakeResult } from '$shared/types';

  interface VisionMeta {
    source: 'live' | 'cached' | 'mock-fallback';
    dominantSpecies: string | null;
    detectionCount: number;
    bulk: boolean;
    note: string;
  }

  interface Intake {
    log: VesselCatchLog;
    dispatch: PickupDispatch;
    dockResult: DockIntakeResult;
    vision?: VisionMeta;
  }

  const visionBadge: Record<VisionMeta['source'], { label: string; cls: string }> = {
    live: { label: 'LIVE VISION', cls: 'bg-emerald-100 text-emerald-700' },
    cached: { label: 'PINNED READ', cls: 'bg-indigo-50 text-indigo-700' },
    'mock-fallback': { label: 'SIMULATED', cls: 'bg-gray-100 text-gray-500' },
  };

  const riskBadge: Record<'LOW' | 'ELEVATED' | 'HIGH', string> = {
    LOW: 'bg-green-50 text-green-700',
    ELEVATED: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-red-100 text-red-700',
  };

  let intakes: Intake[] = [];
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('/api/intake');
      const data = await res.json();
      intakes = data.intakes as Intake[];
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Vessel Intake — TideLift</title></svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-brand-dark">Vessel Intake — Dock to Processing</h1>
  <p class="text-gray-500 text-sm mt-1">
    On-vessel CV drives the purchase decision before the truck rolls. Dockside CV + thermal QA
    verify at transfer. Chem/micro QA runs before and after processing.
  </p>
</div>

{#if loading}
  <p class="text-gray-400 animate-pulse">Loading intake feed…</p>
{:else}
  <div class="space-y-6">
    {#each intakes as { log, dispatch, dockResult, vision }}
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <!-- Header card -->
        <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-brand-dark">{log.vesselName}</h2>
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full
                  {log.vesselType === 'wild-catch'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-emerald-50 text-emerald-700'}"
              >{log.vesselType}</span>
              {#if vision}
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full {visionBadge[vision.source].cls}"
                  title={vision.note}
                >{visionBadge[vision.source].label}</span>
              {/if}
              {#if dockResult.contaminationRisk}
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full {riskBadge[dockResult.contaminationRisk]}"
                  title={dockResult.contaminationNote}
                >{dockResult.contaminationRisk} CONTAM</span>
              {/if}
            </div>
            <p class="text-sm text-gray-500 capitalize mt-0.5">{log.species}</p>
          </div>
          <div class="text-right text-sm text-gray-500">
            <p class="font-medium text-brand-dark">{log.estimatedLbs.toLocaleString()} lbs</p>
            <p>{log.location}</p>
            <p>{log.pickupWindow}</p>
          </div>
        </div>

        <!-- On-vessel CV row -->
        <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            On-Vessel CV (at harvest)
          </p>
          <p class="text-gray-700">
            {log.cvEstimate.count.toLocaleString()} detected · avg {log.cvEstimate.avgWeightLbs} lbs ·
            grade {log.cvEstimate.sizeGrade} · confidence {(log.cvEstimate.confidence * 100).toFixed(0)}%
          </p>
          {#if vision}
            <p class="text-xs text-gray-400 mt-1">{vision.note}</p>
          {/if}
        </div>

        <!-- Dispatch recommendation -->
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
            <button
              disabled
              class="bg-teal-600/50 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-not-allowed"
            >Approve Dispatch</button>
            <p class="text-xs text-gray-400 italic mt-1">Agent recommends. You decide.</p>
          </div>
        </div>

        <!-- Dockside sort table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th class="py-2 pr-4">Container</th>
                <th class="py-2 pr-4">Lbs</th>
                <th class="py-2 pr-4">Temp (°C)</th>
                <th class="py-2 pr-4">Fresh</th>
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
                  <td class="py-2 pr-4 {c.qaStatus === 'FLAG' ? 'text-red-600 font-medium' : 'text-gray-700'}">
                    {c.tempC}
                  </td>
                  <td class="py-2 pr-4 text-gray-700">
                    {c.freshnessScore != null ? c.freshnessScore.toFixed(2) : '—'}
                  </td>
                  <td class="py-2 pr-4 text-gray-700">{c.sizeGrade}</td>
                  <td class="py-2 pr-4">
                    <span
                      class="text-xs font-semibold px-2 py-0.5 rounded-full
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
      </div>
    {/each}
  </div>
{/if}
