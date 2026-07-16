<script lang="ts">
  import '../app.css';
  import AgentBanner from '$lib/components/AgentBanner.svelte';
  import { page } from '$app/stores';

  const NAV = [
    { href: '/', label: 'Dashboard' },
    { href: '/logistics', label: 'Logistics' },
    { href: '/partners', label: 'Partners' },
    { href: '/mock-run', label: 'Demo Run' },
  ];
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2">
      <span class="text-xl font-bold text-brand-dark">🌊 TideLift</span>
      <span class="text-xs text-gray-400 font-mono hidden sm:block">surplus → cans → community</span>
    </a>
    <nav class="flex items-center gap-1">
      {#each NAV as item}
        <a href={item.href}
          class="px-3 py-1.5 text-sm rounded-lg transition-colors
            {$page.url.pathname === item.href
              ? 'bg-brand-dark text-white'
              : 'text-gray-600 hover:bg-gray-100'}">
          {item.label}
        </a>
      {/each}
    </nav>
  </header>

  <AgentBanner />

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
    <slot />
  </main>

  <footer class="text-center text-xs text-gray-300 py-4">
    TideLift • Agent recommends. You decide. • TATinc.us
  </footer>
</div>
