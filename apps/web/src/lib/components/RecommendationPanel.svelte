<script lang="ts">
  export let recommendation: Record<string, unknown>;
  export let lotId: string;

  let approving: Record<string, boolean> = {};
  let done: Record<string, 'approved' | 'rejected'> = {};
  let notes: Record<string, string> = {};

  const sections = [
    { key: 'procurement', type: 'PROCUREMENT', label: 'Procurement Offer', icon: '💰' },
    { key: 'canning',     type: 'FACILITY_BOOKING', label: 'Facility Booking', icon: '🏭' },
    { key: 'delivery',   type: 'DELIVERY_RELEASE', label: 'Delivery Plan', icon: '🚚' },
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
  <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">
    Agent Recommendations <span class="text-gray-400 font-normal normal-case">— Agent recommends. You decide.</span>
  </h2>

  {#each sections as section}
    {@const apvId = approvalId(section.key)}
    {@const status = done[section.key]}
    {@const draft = getDraft(section.key)}
    {@const rows = Array.isArray(draft) ? draft : draft ? [draft] : []}

    <div class="bg-white rounded-xl border border-gray-100 p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-brand-dark">{section.icon} {section.label}</h3>
        {#if status === 'approved'}
          <span class="text-green-600 text-sm font-medium">✓ Approved</span>
        {:else if status === 'rejected'}
          <span class="text-red-500 text-sm font-medium">✕ Rejected</span>
        {:else}
          <span class="text-yellow-500 text-sm font-medium">● Pending your decision</span>
        {/if}
      </div>

      {#if rows.length === 0}
        <p class="text-sm text-gray-400 mb-4">No draft details available for this step.</p>
      {:else}
        <div class="space-y-3 mb-4">
          {#each rows as row}
            {@const r = row}
            <div class="bg-gray-50 rounded-lg p-4">
              {#if reasonOf(r)}
                <p class="text-sm text-brand-dark leading-relaxed mb-3">{reasonOf(r)}</p>
              {/if}

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {#each scalarEntries(r) as [k, v]}
                  <div>
                    <p class="text-[11px] text-gray-400 uppercase tracking-wide">{humanize(k)}</p>
                    <p class="text-sm font-semibold text-brand-dark">{formatValue(k, v)}</p>
                  </div>
                {/each}
              </div>

              {#each arrayEntries(r) as [k, items]}
                <div class="mt-3">
                  <p class="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{humanize(k)}</p>
                  <div class="space-y-1">
                    {#each items as item}
                      <div class="flex flex-wrap gap-x-4 gap-y-1 bg-white rounded-lg border border-gray-100 px-3 py-2">
                        {#each scalarEntries(item) as [ik, iv]}
                          <span class="text-xs"><span class="text-gray-400">{humanize(ik)}:</span> <span class="font-medium text-brand-dark">{formatValue(ik, iv)}</span></span>
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
          class="w-full text-sm border border-gray-200 rounded-lg p-2 mb-3 resize-none h-16"
        />
        <div class="flex gap-3">
          <button
            on:click={() => act(apvId, section.key, 'APPROVED')}
            disabled={approving[section.key]}
            class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
          >Approve</button>
          <button
            on:click={() => act(apvId, section.key, 'REJECTED')}
            disabled={approving[section.key]}
            class="flex-1 border border-red-300 text-red-500 hover:bg-red-50 font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
          >Reject</button>
        </div>
      {/if}
    </div>
  {/each}
</div>
