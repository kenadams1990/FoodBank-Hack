<script lang="ts">
	import DeliveryPlanTable from '$lib/components/DeliveryPlanTable.svelte';
	import SurplusCard from '$lib/components/SurplusCard.svelte';
	import { getMockSurplusFeed } from '$lib/mockSurplusFeed';

	const surplusFeed = getMockSurplusFeed();
	const bestLot = [...surplusFeed].sort((left, right) => right.lbs / right.pricePerLb - left.lbs / left.pricePerLb)[0];
	const negotiatedPrice = Number((bestLot.pricePerLb * 0.89).toFixed(2));
	const deliveryPlan = [
		{ supplier: bestLot.supplier, fish: bestLot.fishType, lbs: 5200, eta: 'Today 5:45 PM', status: 'Pickup scheduled' },
		{ supplier: 'Bay Cannery Partners', fish: bestLot.fishType, lbs: 3400, eta: 'Tomorrow 9:00 AM', status: 'Canning slot booked' }
	];
	const stageLabels = ['Surplus feed loaded', 'Best lot selected', 'Price negotiated', 'Delivery plan generated'];
	let stage = $state(0);

	function advanceRun() {
		stage = stage < stageLabels.length ? stage + 1 : 0;
	}
</script>

<section class="space-y-6 text-slate-900">
	<section class="rounded-3xl bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600">Offline mock run</p>
				<h2 class="mt-2 text-3xl font-semibold">Simulate a full agent recommendation</h2>
				<p class="mt-2 max-w-2xl text-slate-600">Step through surplus review, automated selection, negotiation guidance, and delivery planning without any live APIs.</p>
			</div>
			<button class="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600" onclick={advanceRun}>
				{stage === 0 ? 'Run Agent' : stage > stageLabels.length - 1 ? 'Reset Demo' : 'Next Step'}
			</button>
		</div>
		<div class="mt-5 flex flex-wrap gap-2 text-sm">
			{#each stageLabels as label, index}
				<span class={`rounded-full px-3 py-1 ${stage > index ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{index + 1}. {label}</span>
			{/each}
		</div>
	</section>

	<section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each surplusFeed as lot}
			<SurplusCard {lot} featured={stage > 0 && lot.id === bestLot.id} />
		{/each}
	</section>

	{#if stage > 0}
		<section class="rounded-3xl bg-white p-6 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600">Agent pick</p>
			<h3 class="mt-2 text-2xl font-semibold">{bestLot.fishType} from {bestLot.supplier}</h3>
			<p class="mt-2 text-slate-600">Highest pound-per-dollar score in the current feed with enough shelf life to schedule canning tomorrow morning.</p>
		</section>
	{/if}

	{#if stage > 1}
		<section class="rounded-3xl bg-white p-6 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600">Negotiated price</p>
			<h3 class="mt-2 text-3xl font-semibold">${negotiatedPrice.toFixed(2)}/lb</h3>
			<p class="mt-2 text-slate-600">The agent recommends a quick-close discount based on perishability and available canning capacity.</p>
		</section>
	{/if}

	{#if stage > 2}
		<section class="rounded-3xl bg-white p-6 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.3em] text-emerald-600">Delivery plan</p>
			<h3 class="mt-2 text-2xl font-semibold">Draft execution plan</h3>
			<div class="mt-4">
				<DeliveryPlanTable rows={deliveryPlan} />
			</div>
		</section>
	{/if}
</section>
