<script lang="ts">
  import type { RecommendationBundle } from '../../../../../../packages/shared/src/types';
  export let bundle: RecommendationBundle;

  let approvalStatus: Record<string, 'idle' | 'approved' | 'rejected' | 'loading'> = {
    procurement: 'idle',
    facility: 'idle',
    delivery: 'idle',
  };

  async function act(type: 'procurement' | 'facility' | 'delivery', action: 'APPROVE' | 'REJECT') {
    approvalStatus[type] = 'loading';
    // Find pending approval of matching type
    const typeMap = {
      procurement: 'PROCUREMENT',
      facility: 'FACILITY_BOOKING',
      delivery: 'DELIVERY_RELEASE',
    } as const;
    try {
      const listRes = await fetch('/api/approvals');
      const { approvals } = await listRes.json();
      const pending = approvals.find(
        (a: any) => a.approvalType === typeMap[type] &&
          a.entityId === bundle.lot.id &&
          a.status === 'PENDING'
      );
      if (!pending) { approvalStatus[type] = 'idle'; return; }

      await fetch(`/api/approvals/${pending.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, operatorId: 'operator-ken' }),
      });
      approvalStatus[type] = action === 'APPROVE' ? 'approved' : 'rejected';
    } catch {
      approvalStatus[type] = 'idle';
    }
  }
</script>

<div class="space-y-5">
  <!-- Procurement Draft -->
  <section class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-semibold text-gray-800">Procurement Recommendation</h3>
        <p class="text-xs text-gray-400 mt-0.5">Agent recommends. You decide.</p>
      </div>
      {#if approvalStatus.procurement === 'approved'}
        <span class="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">✓ Approved</span>
      {:else if approvalStatus.procurement === 'rejected'}
        <span class="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">✕ Rejected</span>
      {/if}
    </div>
    <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-sm">
      <div><dt class="text-gray-400">Counter-offer</dt><dd class="font-semibold">${bundle.procurementDraft.counterOfferPricePerLb}/lb</dd></div>
      <div><dt class="text-gray-400">Min Order</dt><dd class="font-semibold">{bundle.procurementDraft.suggestedMoqLbs.toLocaleString()} lbs</dd></div>
      <div><dt class="text-gray-400">Offer Valid</dt><dd class="font-semibold">{bundle.procurementDraft.offerValidHrs}h</dd></div>
    </dl>
    <p class="text-xs text-gray-500 mt-3 italic">{bundle.procurementDraft.justification}</p>
    {#if approvalStatus.procurement === 'idle'}
      <div class="flex gap-2 mt-4">
        <button on:click={() => act('procurement', 'APPROVE')}
          class="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700">
          ✓ Approve Procurement
        </button>
        <button on:click={() => act('procurement', 'REJECT')}
          class="flex-1 bg-red-50 text-red-700 text-sm font-medium py-2 rounded-lg hover:bg-red-100 border border-red-200">
          ✕ Reject
        </button>
      </div>
    {/if}
  </section>

  <!-- Facility Matches -->
  <section class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-start justify-between">
      <h3 class="font-semibold text-gray-800">Canning Facility Match</h3>
      {#if approvalStatus.facility === 'approved'}
        <span class="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">✓ Booked</span>
      {:else if approvalStatus.facility === 'rejected'}
        <span class="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">✕ Rejected</span>
      {/if}
    </div>
    <div class="space-y-3 mt-4">
      {#each bundle.facilityMatches.slice(0, 3) as match, i}
        <div class="border border-gray-100 rounded-lg p-3 {i === 0 ? 'ring-1 ring-brand-dark/20' : ''}">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold">{match.facility.name}</p>
              <p class="text-xs text-gray-400">{match.facility.location}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-brand-dark">{match.matchScore}/100</p>
              <p class="text-xs text-gray-400">{match.estimatedDays}d • {match.estimatedCases} cases</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">{match.rationale}</p>
        </div>
      {/each}
    </div>
    {#if approvalStatus.facility === 'idle'}
      <div class="flex gap-2 mt-4">
        <button on:click={() => act('facility', 'APPROVE')}
          class="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700">
          ✓ Book Top Facility
        </button>
        <button on:click={() => act('facility', 'REJECT')}
          class="flex-1 bg-red-50 text-red-700 text-sm font-medium py-2 rounded-lg hover:bg-red-100 border border-red-200">
          ✕ Reject
        </button>
      </div>
    {/if}
  </section>

  <!-- Delivery Plan -->
  <section class="bg-white rounded-xl border border-gray-200 p-5">
    <div class="flex items-start justify-between">
      <h3 class="font-semibold text-gray-800">Delivery Plan</h3>
      {#if approvalStatus.delivery === 'approved'}
        <span class="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">✓ Released</span>
      {:else if approvalStatus.delivery === 'rejected'}
        <span class="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">✕ Rejected</span>
      {/if}
    </div>
    <table class="w-full text-xs mt-4">
      <thead><tr class="text-gray-400 border-b">
        <th class="text-left pb-2">Food Bank</th>
        <th class="text-right pb-2">Cases</th>
        <th class="text-right pb-2">Window</th>
      </tr></thead>
      <tbody>
        {#each bundle.shipmentDrafts as draft}
          <tr class="border-b border-gray-50">
            <td class="py-2 font-medium">{draft.foodBankName}</td>
            <td class="text-right py-2">{draft.estimatedCases}</td>
            <td class="text-right py-2 text-gray-400">{draft.deliveryWindow}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if approvalStatus.delivery === 'idle'}
      <div class="flex gap-2 mt-4">
        <button on:click={() => act('delivery', 'APPROVE')}
          class="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700">
          ✓ Release Delivery
        </button>
        <button on:click={() => act('delivery', 'REJECT')}
          class="flex-1 bg-red-50 text-red-700 text-sm font-medium py-2 rounded-lg hover:bg-red-100 border border-red-200">
          ✕ Reject
        </button>
      </div>
    {/if}
  </section>
</div>
