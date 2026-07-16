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

  function formatPayload(sectionKey: string): string {
    const section = (recommendation as Record<string, Record<string, unknown>>)[sectionKey];
    const draft = section?.draft ?? section?.topMatch ?? section?.drafts;
    return JSON.stringify(draft, null, 2);
  }
</script>

<div class="space-y-5">
  <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">
    Agent Recommendations <span class="text-gray-400 font-normal normal-case">— Agent recommends. You decide.</span>
  </h2>

  {#each sections as section}
    {@const apvId = approvalId(section.key)}
    {@const status = done[section.key]}

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

      <pre class="text-xs bg-gray-50 rounded-lg p-3 overflow-auto max-h-48 mb-4">{formatPayload(section.key)}</pre>

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
