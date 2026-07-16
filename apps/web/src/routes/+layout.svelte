<script lang="ts">
  import '../app.css';
  import AgentBanner from '$lib/components/AgentBanner.svelte';
</script>

<div class="min-h-screen flex flex-col">
  <AgentBanner />
  <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
    <slot />
  </main>
  <footer class="text-center text-xs text-gray-400 py-4">
    TideLift AI — Surplus seafood → shelf-stable cans for food banks
  </footer>
</div>
