<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';

  const nav = [
    { href: '/',            label: 'Dashboard' },
    { href: '/intake',      label: 'Intake' },
    { href: '/logistics',   label: 'Logistics' },
    { href: '/replenish',   label: 'Replenish' },
    { href: '/partners',    label: 'Partners' },
    { href: '/audit',       label: 'Audit' },
    { href: '/guided-demo', label: 'Guided Demo' },
    { href: '/architecture', label: 'Architecture' },
  ];

  $: active = $page.url.pathname;
</script>

<div class="min-h-screen bg-surface flex flex-col">
  <!-- ── Topbar ── -->
  <header class="bg-ink border-b border-ink/60 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

      <!-- Wordmark + SVG mark -->
      <a href="/" class="flex items-center gap-2.5 shrink-0 group">
        <svg
          width="22" height="16" viewBox="0 0 22 16" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="text-brand group-hover:text-impact transition-colors"
        >
          <path
            d="M2 8C2 8 5 2 11 2C17 2 21 8 21 8C21 8 17 14 11 14C5 14 2 8 2 8Z"
            stroke="currentColor" stroke-width="1.5" fill="none"
          />
          <circle cx="14.5" cy="7" r="1" fill="currentColor" />
          <path d="M2 8L0 5M2 8L0 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span class="font-display font-extrabold text-white tracking-tight text-base">TIDELIFT</span>
        <span class="hidden sm:block text-[10px] font-mono text-brand/80 border border-brand/30 rounded px-1.5 py-0.5 leading-none uppercase tracking-wider">cold-chain ops</span>
      </a>

      <!-- Nav -->
      <nav class="flex items-center gap-0.5 overflow-x-auto" aria-label="Main navigation">
        {#each nav as item}
          <a
            href={item.href}
            class="px-3 py-1.5 rounded text-xs font-medium font-sans transition
              whitespace-nowrap
              {active === item.href || (item.href !== '/' && active.startsWith(item.href))
                ? 'bg-brand text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10'}"
          >{item.label}</a>
        {/each}
      </nav>

      <!-- Tagline -->
      <span class="hidden lg:block text-[11px] font-mono text-white/30 italic shrink-0">
        Agent recommends. You decide.
      </span>
    </div>
  </header>

  <!-- ── Page content ── -->
  <main class="max-w-7xl mx-auto w-full px-5 py-8 flex-1">
    <slot />
  </main>

  <footer class="border-t border-line py-5 text-center text-[11px] font-mono text-ink/30">
    TIDELIFT · AI Supply Chain Hackathon 2026 · Built by Ken Adams @ TAT Inc
  </footer>
</div>
