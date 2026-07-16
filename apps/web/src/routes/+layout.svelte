<script lang="ts">
	import AgentBanner from '$lib/components/AgentBanner.svelte';
	import './layout.css';

	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/mock-run', label: 'Mock run' }
	];
</script>

<svelte:head>
	<title>FoodBank Hack Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100">
	<div class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
		<header class="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-sm font-medium uppercase tracking-[0.3em] text-emerald-300">FoodBank Hack</p>
				<h1 class="mt-2 text-3xl font-semibold">Canned seafood surplus redistribution</h1>
			</div>
			<nav class="flex gap-3 text-sm font-medium text-slate-200">
				{#each navItems as item}
					<a class="rounded-full border border-white/10 px-4 py-2 transition hover:border-emerald-300 hover:text-emerald-200" href={item.href}>{item.label}</a>
				{/each}
			</nav>
		</header>
		<div class="mt-4">
			<AgentBanner />
		</div>
		<main class="mt-6 flex-1">{@render children()}</main>
	</div>
</div>
