<script lang="ts">
  export let recommendation: Record<string, unknown>;
  export let lotId: string;

  let approving: Record<string, boolean> = {};
  let done: Record<string, 'approved' | 'rejected'> = {};
  let notes: Record<string, string> = {};

  const sections = [
    { key: 'procurement', type: 'PROCUREMENT', label: 'Procurement Offer' },
    { key: 'canning',     type: 'FACILITY_BOOKING', label: 'Facility Booking' },
    { key: 'delivery',   type: 'DELIVERY_RELEASE', label: 'Delivery Plan' },
  ];

  async function act(approvalId: string, sectionKey: string, status: 'APPROVED' | 'REJECTED') {
    approving[sectionKey] = true;
    try {
      await fetch(`/api/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, operatorId: 'operator:ken', notes: notes[sectionKey] }),
      });
      done[sectionKey] = status === 'APPROVED' ? 'approved' : 'rejected';
    } finally {
      approving[sectionKey] = false;
    }
  }

  function approvalId(sectionKey: string): string {
    const section = (recommendation as Record<string, Record<string, unknown>>)[sectionKey];
    return (section?.approvalRequest as Record<string, string>)?.id ?? '';
  }

  // The agent draft for a section. May be a single object (procurement / facility
  // match) or an array (per-agency delivery rows).
  function getDraft(sectionKey: string): unknown {
    const section = (recommendation as Record<string, Record<string, unknown>>)[sectionKey];
    return section?.draft ?? section?.topMatch ?? section?.drafts ?? null;
  }

  // Pull the human-readable rationale off a draft — this is the load-bearing
  // "why" behind every recommendation, so it leads the card.
  function reasonOf(row: Record<string, unknown>): string {
    return (row?.reason as string) ?? (row?.rationale as string) ?? '';
  }

  // camelCase → Title Case for field labels.
  function humanize(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .replace(/\bLbs\b/, 'lbs')
      .replace(/\bPct\b/, '%')
      .trim();
  }

  // Format a scalar value with domain-aware units so nothing reads as raw data.
  function formatValue(key: string, val: unknown): string {
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'number') {
      if (/price|cost|perLb/i.test(key)) return `$${val.toFixed(2)}`;
      if (/lbs/i.test(key)) return `${val.toLocaleString()} lbs`;
      if (/pct|percent/i.test(key)) return `${val}%`;
      if (/score|reliability|risk|priority|confidence/i.test(key) && val <= 1) return `${Math.round(val * 100)}%`;
      return val.toLocaleString();
    }
    return String(val);
  }

  // Scalar fields to show as a labeled grid — excludes the reason (shown above)
  // and any nested objects/arrays (rendered separately).
  function scalarEntries(row: Record<string, unknown>): [string, unknown][] {
    return Object.entries(row).filter(
      ([k, v]) => k !== 'reason' && k !== 'rationale' && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'),
    );
  }

  // Nested arrays of objects (e.g. vendor options) → rendered as sub-rows.
  function arrayEntries(row: Record<string, unknown>): [string, Record<string, unknown>[]][] {
    return Object.entries(row).filter(
      ([, v]) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'object',
    ) as [string, Record<string, unknown>[]][];
  }
</script>

<div class="space-y-5">
  <h2 class="tl-label">
    Agent Recommendations <span class="italic normal-case font-normal text-foam/35">— Agent recommends. You decide.</span>
  </h2>

  {#each sections as section}
    {@const apvId = approvalId(section.key)}
    {@const status = done[section.key]}
    {@const draft = getDraft(section.key)}
    {@const rows = Array.isArray(draft) ? draft : draft ? [draft] : []}

    <div class="tl-panel p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-display font-semibold text-foam">{section.label}</h3>
        {#if status === 'approved'}
          <span class="chip-ok">✓ Approved</span>
        {:else if status === 'rejected'}
          <span class="chip-alert">✕ Rejected</span>
        {:else}
          <span class="chip-warn">● Pending your decision</span>
        {/if}
      </div>

      {#if rows.length === 0}
        <p class="font-mono text-sm text-foam/35 mb-4">No draft details available for this step.</p>
      {:else}
        <div class="space-y-3 mb-4">
          {#each rows as row}
            {@const r = row}
            <div class="bg-raised rounded-sm p-4">
              {#if reasonOf(r)}
                <p class="font-mono text-sm text-foam leading-relaxed mb-3">{reasonOf(r)}</p>
              {/if}

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {#each scalarEntries(r) as [k, v]}
                  <div>
                    <p class="font-mono text-[11px] text-mist uppercase tracking-wide">{humanize(k)}</p>
                    <p class="font-mono text-sm font-semibold text-foam">{formatValue(k, v)}</p>
                  </div>
                {/each}
              </div>

              {#each arrayEntries(r) as [k, items]}
                <div class="mt-3">
                  <p class="font-mono text-[11px] text-mist uppercase tracking-wide mb-1">{humanize(k)}</p>
                  <div class="space-y-1">
                    {#each items as item}
                      <div class="flex flex-wrap gap-x-4 gap-y-1 bg-white/5 rounded-sm border border-line px-3 py-2">
                        {#each scalarEntries(item) as [ik, iv]}
                          <span class="font-mono text-xs"><span class="text-mist">{humanize(ik)}:</span> <span class="font-medium text-foam">{formatValue(ik, iv)}</span></span>
                        {/each}
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

      {#if !status}
        <textarea
          bind:value={notes[section.key]}
          placeholder="Optional notes for audit log…"
          class="w-full font-mono text-sm bg-white/5 border border-line rounded-sm p-2 mb-3 resize-none h-16 text-foam placeholder:text-foam/30 focus:outline-none focus:border-salmon/50"
        />
        <div class="flex gap-3">
          <button
            on:click={() => act(apvId, section.key, 'APPROVED')}
            disabled={approving[section.key]}
            class="flex-1 bg-salmon hover:bg-salmon-hi text-ink font-mono font-semibold py-2 rounded-sm text-sm transition-colors disabled:opacity-50"
          >Approve</button>
          <button
            on:click={() => act(apvId, section.key, 'REJECTED')}
            disabled={approving[section.key]}
            class="flex-1 border border-line text-mist hover:text-danger-hi hover:border-alert/50 font-mono font-semibold py-2 rounded-sm text-sm transition-colors disabled:opacity-50"
          >Reject</button>
        </div>
      {/if}
    </div>
  {/each}
</div>
