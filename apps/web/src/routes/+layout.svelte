<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';

  const nav = [
    { href: '/', label: 'Dashboard' },
    { href: '/intake', label: 'Intake' },
    { href: '/logistics', label: 'Logistics' },
    { href: '/partners', label: 'Partners' },
    { href: '/audit', label: 'Audit' },
    { href: '/mock-run', label: 'Demo Run' },
  ];

  $: active = $page.url.pathname;
</script>

<div class="min-h-screen bg-gray-50 font-sans">
  <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <span class="text-2xl">🐟</span>
        <span class="font-extrabold text-brand-dark text-lg tracking-tight">TideLift</span>
        <span class="text-xs text-gray-400 hidden sm:inline">Surplus → Canned → Fed</span>
      </a>
      <nav class="flex items-center gap-1">
        {#each nav as item}
          <a
            href={item.href}
            class="px-3 py-2 rounded-lg text-sm font-medium transition
              {active === item.href
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}"
          >{item.label}</a>
        {/each}
      </nav>
      <span class="text-xs text-gray-400 italic hidden md:inline">Agent recommends. You decide.</span>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8">
    <slot />
  </main>

  <footer class="border-t border-gray-100 mt-16 py-6 text-center text-xs text-gray-400">
    TideLift · AI Supply Chain Hackathon 2026 · Built by Ken Adams @ TAT Inc
  </footer>
</div>
