<script lang="ts">
	import { onMount } from 'svelte';

	const states = ['Negotiating', 'Awaiting approval', 'Idle'] as const;
	const rotationMs = 2200;
	let currentIndex = $state(0);

	onMount(() => {
		const timer = window.setInterval(() => {
			currentIndex = (currentIndex + 1) % states.length;
		}, rotationMs);

		return () => window.clearInterval(timer);
	});
</script>

<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
	<div class="flex items-center justify-between gap-3">
		<div>
			<p class="text-sm font-medium uppercase tracking-wide text-slate-500">Agent status</p>
			<h3 class="mt-1 text-lg font-semibold text-slate-900">Procurement copilot</h3>
		</div>
		<span class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{states[currentIndex]}</span>
	</div>
	<div class="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
		{#each states as state, index}
			<span class={`rounded-full px-3 py-1 ${index === currentIndex ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{state}</span>
		{/each}
	</div>
</section>
