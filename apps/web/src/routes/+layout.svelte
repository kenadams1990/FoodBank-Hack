<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';

  // Primary nav — the three Hub screens the design spec puts in the topbar.
  const primary = [
    { href: '/',       label: 'Dashboard' },
    { href: '/intake', label: 'Intake' },
    { href: '/audit',  label: 'Audit' },
  ];

  // Secondary — the rest of the platform, kept reachable in a quieter strip so
  // the hero topbar matches the pixel spec (3 items) without dropping routes.
  const secondary = [
    { href: '/logistics',    label: 'Logistics' },
    { href: '/replenish',    label: 'Replenish' },
    { href: '/partners',     label: 'Partners' },
    { href: '/guided-demo',  label: 'Guided demo' },
    { href: '/architecture', label: 'Architecture' },
  ];

  $: path = $page.url.pathname;
  const isActive = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
</script>

<div class="min-h-screen flex flex-col">
  <!-- ══ Topbar — ink band, beacon mark, salmon active pill (design spec) ══ -->
  <header class="bg-ink border-b border-line sticky top-0 z-50">
    <div class="max-w-[1180px] mx-auto px-6 h-14 flex items-center gap-5">
      <!-- Beacon mark + wordmark -->
      <a href="/" class="flex items-center gap-2.5 shrink-0 group" aria-label="TideLift home">
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
             class="text-salmon">
          <rect x="2" y="16" width="4" height="6" fill="currentColor" />
          <rect x="8" y="12" width="4" height="10" fill="currentColor" />
          <rect x="14" y="8" width="4" height="14" fill="currentColor" />
          <circle cx="16" cy="4" r="2" fill="currentColor" />
        </svg>
        <span class="font-display font-bold text-foam tracking-tight text-[15px]">TIDELIFT</span>
      </a>

      <!-- Primary nav -->
      <nav class="flex items-center gap-0.5 ml-3" aria-label="Primary">
        {#each primary as item}
          <a
            href={item.href}
            class="font-mono text-[13px] px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap
              {isActive(item.href)
                ? 'bg-salmon text-ink font-semibold'
                : 'text-foam/55 hover:text-foam hover:bg-white/5'}"
            aria-current={isActive(item.href) ? 'page' : undefined}
          >{item.label}</a>
        {/each}
      </nav>

      <!-- Tagline -->
      <span class="ml-auto hidden md:block font-mono text-[11px] text-foam/35 shrink-0">
        Agent recommends. You decide.
      </span>
    </div>

    <!-- Secondary strip — quieter, tertiary mono; keeps every route reachable -->
    <div class="border-t border-line/60">
      <div class="max-w-[1180px] mx-auto px-6 h-9 flex items-center gap-1 overflow-x-auto">
        {#each secondary as item}
          <a
            href={item.href}
            class="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-sm transition-colors whitespace-nowrap
              {isActive(item.href)
                ? 'text-salmon'
                : 'text-foam/35 hover:text-foam/70'}"
            aria-current={isActive(item.href) ? 'page' : undefined}
          >{item.label}</a>
        {/each}
      </div>
    </div>
  </header>

  <!-- ══ Page content ══ -->
  <main class="max-w-[1180px] mx-auto w-full px-6 py-8 flex-1">
    <slot />
  </main>

  <footer class="border-t border-line py-4 text-center font-mono text-[11px] text-foam/40">
    TIDELIFT · AISCO Hackathon 2026 · Agent recommends. You decide.
  </footer>
</div>
