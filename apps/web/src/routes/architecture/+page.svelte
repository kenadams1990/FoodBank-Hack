<svelte:head>
  <title>TIDELIFT · Architecture</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <div class="mb-6">
    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-brand/70 mb-1">Reference</p>
    <h1 class="font-display text-2xl font-bold text-ink">How the pipeline actually runs</h1>
    <p class="text-sm text-ink/50 mt-1">
      What each agent does, and exactly where Cloudflare sits — for anyone who wants to check under the
      hood before (or instead of) watching the demo.
    </p>
  </div>

  <div class="flex flex-col gap-6">
    <img
      src="/media/guided-demo/images/agent-pipeline-reference.png"
      alt="TideLift agent reference: all 9 steps of the live demo, from on-vessel CV dispatch through overflow disposition, each tagged with its source file and function"
      class="w-full rounded-xl border border-ink/10 shadow-sm"
    />
    <img
      src="/media/guided-demo/images/architecture-cloudflare-1.png"
      alt="Where Cloudflare sits in TideLift's infrastructure: browser requests flow through Cloudflare Pages to deterministic agent functions, with Workers AI and Cloudflare KV as the only two Cloudflare-dependent steps"
      class="w-full rounded-xl border border-ink/10 shadow-sm"
    />
    <img
      src="/media/guided-demo/images/architecture-cloudflare-2.png"
      alt="Each of the 9 pipeline steps tagged as edge-only, Workers AI narration, or Cloudflare KV persistence, with a summary box answering what the stack is if a judge asks"
      class="w-full rounded-xl border border-ink/10 shadow-sm"
    />
  </div>

  <div class="mt-6 flex gap-3 flex-wrap">
    <a href="/intake" class="font-mono text-xs font-semibold bg-impact text-white px-4 py-2 rounded-lg hover:bg-ink transition-colors">
      Open prototype →
    </a>
    <a href="/guided-demo" class="font-mono text-xs font-semibold bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-deep transition-colors">
      Watch guided demo →
    </a>
  </div>
</div>
