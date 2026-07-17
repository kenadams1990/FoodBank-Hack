<script lang="ts">
  import { tick } from 'svelte';

  interface Detection {
    className: string;
    confidence: number;
    bbox: [number, number, number, number];
  }
  interface AnalyzeResult {
    ok: boolean;
    error?: string;
    width: number;
    height: number;
    detections: Detection[];
    estimate: { count: number; avgWeightLbs: number; sizeGrade: string; confidence: number };
    estimateNote: string;
    dominantSpecies: string | null;
    freshness: { score: number; status: 'FRESH' | 'CHECK'; source: string; note: string };
    contamination: { risk: 'LOW' | 'ELEVATED' | 'HIGH'; note: string; site: string | null };
  }

  const SPECIES = ['auto', 'salmon', 'tuna', 'cod', 'sardine', 'mackerel', 'trout', 'oyster'];
  // Locations wired to the provenance reference (provenance-data.ts).
  const LOCATIONS = [
    'Bodega Bay Harbor, CA',
    'Monterey Harbor, CA',
    'Tomales Bay, CA',
    'San Francisco Bay, CA',
    'Palos Verdes, CA',
  ];

  let previewSrc = '';
  let species = 'auto';
  let location = LOCATIONS[0];
  let loading = false;
  let error = '';
  let result: AnalyzeResult | null = null;
  let canvas: HTMLCanvasElement;

  const riskCls: Record<string, string> = {
    LOW: 'bg-green-50 text-green-700',
    ELEVATED: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-red-100 text-red-700',
  };

  function onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    result = null;
    error = '';
    const reader = new FileReader();
    reader.onload = () => {
      previewSrc = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!previewSrc) return;
    loading = true;
    error = '';
    result = null;
    try {
      const imageB64 = previewSrc.split(',')[1]; // strip data:...;base64,
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageB64,
          species: species === 'auto' ? undefined : species,
          location,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        error = data.error ?? 'Analysis failed.';
        return;
      }
      result = data;
      await tick();
      drawOverlay();
    } catch (e) {
      error = 'Could not reach the analyze endpoint.';
    } finally {
      loading = false;
    }
  }

  function drawOverlay() {
    if (!result || !canvas) return;
    const img = new Image();
    img.onload = () => {
      const maxW = 680;
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.font = '12px monospace';
      for (const d of result!.detections) {
        const [x, y, w, h] = d.bbox.map((v) => v * scale) as [number, number, number, number];
        ctx.strokeStyle = 'rgba(16,185,129,0.95)';
        ctx.strokeRect(x, y, w, h);
        const label = `${d.className} ${(d.confidence * 100).toFixed(0)}%`;
        ctx.fillStyle = 'rgba(16,185,129,0.95)';
        const tw = ctx.measureText(label).width + 6;
        ctx.fillRect(x, Math.max(0, y - 15), tw, 15);
        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 3, Math.max(11, y - 4));
      }
    };
    img.src = previewSrc;
  }
</script>

<svelte:head><title>Analyze a Catch — TideLift</title></svelte:head>

<div class="mb-6">
  <h1 class="text-2xl font-bold text-brand-dark">Analyze a Catch Photo</h1>
  <p class="text-gray-500 text-sm mt-1">
    Upload a photo of the catch. The model reads it for the three factors —
    <strong>quantity/size</strong>, <strong>freshness</strong>, and
    <strong>source contamination</strong>. Agent recommends. You decide.
  </p>
</div>

<div class="grid md:grid-cols-2 gap-6">
  <!-- Left: upload + preview -->
  <div>
    <div class="bg-white rounded-xl border border-gray-100 p-5">
      <label
        class="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-8 cursor-pointer hover:border-teal-400 transition"
      >
        <input type="file" accept="image/*" class="hidden" on:change={onFile} />
        <span class="text-sm text-gray-500">Click to choose a catch photo</span>
        <span class="text-xs text-gray-400 mt-1">JPG / PNG</span>
      </label>

      <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
        <label class="block">
          <span class="text-xs text-gray-500 uppercase tracking-wider">Species hint</span>
          <select bind:value={species} class="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5">
            {#each SPECIES as s}<option value={s}>{s}</option>{/each}
          </select>
        </label>
        <label class="block">
          <span class="text-xs text-gray-500 uppercase tracking-wider">Harvest location</span>
          <select bind:value={location} class="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5">
            {#each LOCATIONS as l}<option value={l}>{l}</option>{/each}
          </select>
        </label>
      </div>

      <button
        on:click={analyze}
        disabled={!previewSrc || loading}
        class="mt-4 w-full bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg
          disabled:opacity-40 disabled:cursor-not-allowed"
      >{loading ? 'Analyzing…' : 'Analyze catch'}</button>

      {#if error}
        <p class="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-3 font-mono">{error}</p>
      {/if}
    </div>

    {#if previewSrc}
      <div class="bg-white rounded-xl border border-gray-100 p-3 mt-4 overflow-x-auto">
        {#if result}
          <canvas bind:this={canvas} class="max-w-full rounded-lg"></canvas>
        {:else}
          <img src={previewSrc} alt="catch preview" class="max-w-full rounded-lg" />
        {/if}
      </div>
    {/if}
  </div>

  <!-- Right: the three factors -->
  <div class="space-y-4">
    {#if !result}
      <div class="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
        Upload a photo and hit <strong>Analyze</strong> to see the three factors.
      </div>
    {:else}
      <!-- Factor 1 — detection -->
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">1 · Quantity &amp; Size</p>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            LIVE VISION
          </span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-3xl font-bold text-brand-dark">{result.estimate.count}</span>
          <span class="text-sm text-gray-500">fish detected</span>
        </div>
        <p class="text-sm text-gray-600 mt-1">
          grade {result.estimate.sizeGrade} · avg {result.estimate.avgWeightLbs} lbs ·
          {(result.estimate.confidence * 100).toFixed(0)}% mean confidence
          {#if result.dominantSpecies}· {result.dominantSpecies}{/if}
        </p>
        <p class="text-xs text-gray-400 mt-1">{result.estimateNote}</p>
      </div>

      <!-- Factor 2 — freshness -->
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">2 · Freshness (eye/gill)</p>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-full
              {result.freshness.status === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}"
          >{result.freshness.status}</span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-3xl font-bold text-brand-dark">{result.freshness.score.toFixed(2)}</span>
          <span class="text-sm text-gray-500">/ 1.00</span>
          <span class="text-[10px] font-mono text-gray-400 border border-gray-200 rounded px-1 ml-1">
            {result.freshness.source === 'mock-fallback' ? 'SIMULATED' : result.freshness.source}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">{result.freshness.note}</p>
      </div>

      <!-- Factor 3 — contamination -->
      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">3 · Source Contamination</p>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full {riskCls[result.contamination.risk]}">
            {result.contamination.risk}
          </span>
        </div>
        <p class="text-sm text-gray-600 mt-2">{result.contamination.note}</p>
      </div>
    {/if}
  </div>
</div>
