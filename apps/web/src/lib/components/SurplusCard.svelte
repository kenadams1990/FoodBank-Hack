<script lang="ts">
  import type { SurplusLot } from '$shared/types';
  export let lot: SurplusLot;

  // Human-readable species: Title Case, no raw IDs surfaced
  $: species = lot.species
    ? lot.species.charAt(0).toUpperCase() + lot.species.slice(1).toLowerCase()
    : 'Unknown';

  // Vessel name from supplierId — strip prefix, Title Case, fallback gracefully
  $: vessel = lot.supplierId
    ? lot.supplierId.replace(/^sup-\d+-?/i, '').replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || lot.supplierId
    : 'Unknown Vessel';

  $: daysLeft = Math.max(0, Math.ceil(
    (new Date(lot.expiryDate).getTime() - Date.now()) / 86_400_000
  ));

  // Thermal chip style
  $: tempClass = (lot.tempC ?? 0) > 4
    ? 'chip-alert'
    : (lot.tempC ?? 0) > 3
      ? 'chip-warn'
      : 'chip-ok';

  // Urgency chip style
  $: urgencyClass = daysLeft <= 2
    ? 'chip-alert'
    : daysLeft <= 4
      ? 'chip-warn'
      : 'chip-neutral';

  // Ref tag — small mono identifier, shown discretely
  $: refTag = lot.id ?? '';
</script>

<a
  href="/lots/{lot.id}"
  class="catch-ticket block p-0 group animate-fade-up"
  aria-label="{species} lot from {vessel}"
>
  <!-- Card header -->
  <div class="px-4 pt-4 pb-3 border-b border-line">
    <div class="flex items-start justify-between gap-2 mb-1">
      <!-- Species + vessel -->
      <div>
        <h3 class="font-display font-bold text-foam text-base leading-tight">{species}</h3>
        <p class="font-mono text-[11px] text-foam/35 mt-0.5 truncate max-w-[140px]">{vessel}</p>
      </div>
      <!-- Score badge -->
      {#if lot.score != null}
        <span
          class="shrink-0 font-mono text-xs font-medium text-salmon border border-salmon/30 rounded-sm px-2 py-1"
          style="background: rgba(232, 101, 74, .08);"
        >
          {lot.score}<span class="text-salmon/50">/100</span>
        </span>
      {/if}
    </div>
    <!-- Ref tag: small, unobtrusive -->
    {#if refTag}
      <span class="readout">{refTag}</span>
    {/if}
  </div>

  <!-- Card body -->
  <div class="px-4 py-3">
    <!-- Main readout row -->
    <div class="flex items-baseline gap-3 mb-3">
      <span class="font-display font-extrabold text-2xl text-foam">
        {lot.lbs.toLocaleString()}
      </span>
      <span class="font-mono text-xs text-foam/35">lbs</span>
      <span class="ml-auto font-mono text-base font-medium text-mist">
        {lot.proposedDiscountPct}%
        <span class="font-mono text-xs text-foam/35">disc</span>
      </span>
    </div>

    <!-- Status chips row -->
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Thermal chip -->
      {#if lot.tempC != null}
        <span class={tempClass}>
          <!-- Thermometer SVG -->
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" stroke="currentColor" stroke-width="2"/>
          </svg>
          {lot.tempC.toFixed(1)}°C
        </span>
      {/if}
      <!-- Urgency chip -->
      <span class={urgencyClass}>
        <!-- Clock SVG -->
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {daysLeft}d left
      </span>
    </div>
  </div>
</a>
