<script lang="ts">
  import '../app.css';
  import ExceptionAlerts from '$lib/components/ExceptionAlerts.svelte';

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/logistics', label: 'Logistics' },
    { href: '/partners', label: 'Partners' },
    { href: '/mock-run', label: 'Demo Run' },
  ];

  import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold text-teal-700">TideLift</span>
        <span class="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Agent recommends. You decide.</span>
      </div>
      <nav class="flex gap-6">
        {#each navLinks as link}
          <a
            href={link.href}
            class="text-sm font-medium transition-colors"
            class:text-teal-700={$page.url.pathname === link.href}
            class:text-gray-500={$page.url.pathname !== link.href}
          >{link.label}</a>
        {/each}
      </nav>
    </div>
  </header>

  <ExceptionAlerts />

  <main class="max-w-7xl mx-auto px-4 py-6">
    <slot />
  </main>
</div>
