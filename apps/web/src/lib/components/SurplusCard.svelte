<script lang="ts">
	import type { SurplusLot } from '$lib/mockSurplusFeed';

	let { lot, featured = false } = $props<{ lot: SurplusLot; featured?: boolean }>();
</script>

<article class={`rounded-2xl border p-5 shadow-sm ${featured ? 'border-emerald-400 bg-emerald-50/90' : 'border-slate-200 bg-white'}`}>
	<div class="flex items-start justify-between gap-3">
		<div>
			<p class="text-sm font-medium uppercase tracking-wide text-slate-500">{lot.id}</p>
			<h3 class="mt-1 text-xl font-semibold text-slate-900">{lot.fishType}</h3>
			<p class="mt-2 text-sm text-slate-600">{lot.supplier}</p>
		</div>
		<span class="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{lot.lbs.toLocaleString()} lbs</span>
	</div>
	<div class="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
		<div class="rounded-xl bg-slate-100 p-3">
			<p class="text-slate-500">Expiry</p>
			<p class="mt-1 font-semibold">{lot.expiryDays} days</p>
		</div>
		<div class="rounded-xl bg-slate-100 p-3">
			<p class="text-slate-500">Price</p>
			<p class="mt-1 font-semibold">${lot.pricePerLb.toFixed(2)}/lb</p>
		</div>
	</div>
</article>
