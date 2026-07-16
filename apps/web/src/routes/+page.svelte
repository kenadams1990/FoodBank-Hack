<script lang="ts">
	import AgentStatusPanel from '$lib/components/AgentStatusPanel.svelte';
	import DeliveryPlanTable from '$lib/components/DeliveryPlanTable.svelte';
	import SurplusCard from '$lib/components/SurplusCard.svelte';
	import { getMockSurplusFeed } from '$lib/mockSurplusFeed';

	const surplusFeed = getMockSurplusFeed();
	const totalLbs = surplusFeed.reduce((sum, lot) => sum + lot.lbs, 0);
	const deliveryPlan = [
		{ supplier: 'Monterey Harbor Co-op', fish: 'Pacific Sardine', lbs: 3000, eta: 'Today 3:30 PM', status: 'Dock confirmed' },
		{ supplier: 'North Coast Landing', fish: 'Pink Salmon', lbs: 2400, eta: 'Tomorrow 8:00 AM', status: 'Truck assigned' },
		{ supplier: 'Half Moon Bay Fisheries', fish: 'Albacore Tuna', lbs: 1800, eta: 'Tomorrow 11:15 AM', status: 'Awaiting approval' }
	];
</script>

<section class="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
	<div class="space-y-6">
		<section class="rounded-3xl bg-white p-6 text-slate-900 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600">Surplus dashboard</p>
			<h2 class="mt-3 text-3xl font-semibold">Local seafood lots ready for rescue</h2>
			<p class="mt-3 max-w-2xl text-slate-600">Review today&apos;s offline surplus feed, compare lots, and approve the next canning + delivery move.</p>
			<div class="mt-5 grid gap-3 sm:grid-cols-3">
				<div class="rounded-2xl bg-slate-100 p-4"><p class="text-sm text-slate-500">Open lots</p><p class="mt-1 text-2xl font-semibold">{surplusFeed.length}</p></div>
				<div class="rounded-2xl bg-slate-100 p-4"><p class="text-sm text-slate-500">Available lbs</p><p class="mt-1 text-2xl font-semibold">{totalLbs.toLocaleString()}</p></div>
				<div class="rounded-2xl bg-slate-100 p-4"><p class="text-sm text-slate-500">Suppliers</p><p class="mt-1 text-2xl font-semibold">3 coastal hubs</p></div>
			</div>
		</section>
		<section class="grid gap-4 md:grid-cols-2">
			{#each surplusFeed as lot}
				<SurplusCard {lot} />
			{/each}
		</section>
	</div>
	<div class="space-y-6">
		<AgentStatusPanel />
		<section class="rounded-3xl bg-white p-6 text-slate-900 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600">Delivery plan</p>
			<h2 class="mt-2 text-2xl font-semibold">Today&apos;s draft redistribution plan</h2>
			<p class="mt-2 text-sm text-slate-600">Mock downstream handoffs keep the demo fully offline while showing supplier pickup timing.</p>
			<div class="mt-4">
				<DeliveryPlanTable rows={deliveryPlan} />
			</div>
		</section>
	</div>
</section>
