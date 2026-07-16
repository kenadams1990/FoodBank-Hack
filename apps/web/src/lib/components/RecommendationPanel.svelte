<script lang="ts">
  import type { RecommendationBundle } from '../../../../../packages/shared/src/types';

  export let bundle: RecommendationBundle;
  export let onApprove: (approvalId: string, type: string) => Promise<void>;
  export let onReject: (approvalId: string, type: string) => Promise<void>;
  export let procurementApprovalId: string;
  export let facilityApprovalId: string;
  export let deliveryApprovalId: string;

  let procStatus: 'idle' | 'loading' | 'done' = 'idle';
  let facStatus: 'idle' | 'loading' | 'done' = 'idle';
  let delStatus: 'idle' | 'loading' | 'done' = 'idle';
  let rejectNotes = '';

  async function handle(action: 'approve' | 'reject', id: string, type: string, setStatus: (s: 'idle' | 'loading' | 'done') => void) {
    setStatus('loading');
    if (action === 'approve') await onApprove(id, type);
    else await onReject(id, type);
    setStatus('done');
  }
</script>

<div class="space-y-6">
  <!-- Procurement Draft -->
  <section class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-gray-800">Procurement Recommendation</h3>
      <span class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Agent Draft</span>
    </div>
    <div class="text-sm text-gray-600 space-y-1 mb-4">
      <div><span class="font-medium">Counter price:</span> ${bundle.procurementDraft.counterPricePerLb}/lb</div>
      <div><span class="font-medium">Suggested MOQ:</span> {bundle.procurementDraft.suggestedMOQLbs.toLocaleString()} lbs</div>
      <div><span class="font-medium">Estimated total:</span> ${bundle.procurementDraft.estimatedTotalCost.toLocaleString()}</div>
      <div><span class="font-medium">Savings vs. market:</span> <span class="text-green-600">${bundle.procurementDraft.savingsVsMarket.toLocaleString()}</span></div>
      <p class="text-gray-500 italic mt-2 text-xs">{bundle.procurementDraft.justification}</p>
    </div>
    {#if procStatus === 'done'}
      <p class="text-sm text-green-600 font-medium">✓ Decision recorded</p>
    {:else}
      <div class="flex gap-2">
        <button
          class="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
          disabled={procStatus === 'loading'}
          on:click={() => handle('approve', procurementApprovalId, 'PROCUREMENT', s => procStatus = s)}
        >{procStatus === 'loading' ? 'Approving...' : 'Approve Procurement'}</button>
        <button
          class="px-4 py-1.5 bg-white border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50"
          disabled={procStatus === 'loading'}
          on:click={() => handle('reject', procurementApprovalId, 'PROCUREMENT', s => procStatus = s)}
        >Reject</button>
      </div>
    {/if}
  </section>

  <!-- Facility Matches -->
  <section class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-gray-800">Canning Facility Match</h3>
      <span class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Agent Draft</span>
    </div>
    {#each bundle.facilityMatches.slice(0, 3) as match, i}
      <div class="text-sm text-gray-600 border rounded-lg p-3 mb-2" class:border-teal-300={i === 0} class:bg-teal-50={i === 0}>
        <div class="flex items-center justify-between">
          <span class="font-medium">{match.facility.name}</span>
          <span class="text-xs font-semibold text-teal-700">Score {match.matchScore}/100</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">{match.matchReason}</p>
        <div class="flex gap-4 mt-1 text-xs text-gray-500">
          <span>~{match.estimatedCans.toLocaleString()} cans</span>
          <span>{match.estimatedDays}d run</span>
          <span>${match.totalCanningCost.toLocaleString()} total</span>
          <span>Slot: {match.slot.date}</span>
        </div>
      </div>
    {/each}
    {#if facStatus === 'done'}
      <p class="text-sm text-green-600 font-medium mt-2">✓ Decision recorded</p>
    {:else}
      <div class="flex gap-2 mt-3">
        <button
          class="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
          disabled={facStatus === 'loading'}
          on:click={() => handle('approve', facilityApprovalId, 'FACILITY_BOOKING', s => facStatus = s)}
        >{facStatus === 'loading' ? 'Booking...' : 'Book Top Facility'}</button>
        <button
          class="px-4 py-1.5 bg-white border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50"
          disabled={facStatus === 'loading'}
          on:click={() => handle('reject', facilityApprovalId, 'FACILITY_BOOKING', s => facStatus = s)}
        >Reject</button>
      </div>
    {/if}
  </section>

  <!-- Delivery Plan -->
  <section class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-gray-800">Delivery Plan</h3>
      <span class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Agent Draft</span>
    </div>
    <div class="space-y-2 mb-4">
      {#each bundle.shipmentDrafts as draft}
        <div class="text-sm border rounded-lg p-3">
          <div class="flex justify-between">
            <span class="font-medium">{draft.foodBank.name}</span>
            <span class="text-teal-600 font-semibold">{draft.cansAllocated.toLocaleString()} cans</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{draft.priorityReason}</p>
          <p class="text-xs text-gray-400">{draft.deliveryWindow} — {draft.routeNotes}</p>
        </div>
      {/each}
    </div>
    {#if delStatus === 'done'}
      <p class="text-sm text-green-600 font-medium">✓ Decision recorded</p>
    {:else}
      <div class="flex gap-2">
        <button
          class="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
          disabled={delStatus === 'loading'}
          on:click={() => handle('approve', deliveryApprovalId, 'DELIVERY_RELEASE', s => delStatus = s)}
        >{delStatus === 'loading' ? 'Releasing...' : 'Release Delivery'}</button>
        <button
          class="px-4 py-1.5 bg-white border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50"
          disabled={delStatus === 'loading'}
          on:click={() => handle('reject', deliveryApprovalId, 'DELIVERY_RELEASE', s => delStatus = s)}
        >Reject</button>
      </div>
    {/if}
  </section>

  <!-- Agent Brief -->
  <section class="bg-gray-50 rounded-xl border border-gray-200 p-5">
    <h3 class="font-semibold text-gray-700 mb-2 text-sm">Agent Brief</h3>
    <pre class="text-xs text-gray-600 whitespace-pre-wrap font-mono">{bundle.agentBrief}</pre>
  </section>
</div>
