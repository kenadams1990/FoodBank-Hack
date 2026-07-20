<script lang="ts">
  // Native dark reference — replaces the earlier light-background PNG renders
  // (agent-pipeline-reference.png / architecture-cloudflare-*.png) so the page
  // matches the Tide palette. Content mirrors those renders: what each agent
  // does + exactly where Cloudflare sits, ordered like the guided demo.
  const steps = [
    {
      n: 1,
      title: 'On-vessel CV → dispatch decision',
      src: 'intake.ts · evaluateCatchLog',
      tag: 'edge only',
      tone: 'neutral',
      body: 'Counts, sizes, and grades the catch by camera before the boat reaches the dock. Recommends cold transport once the lot clears the 500 lb minimum; below ~70% CV confidence it still dispatches but flags a dockside recheck. A pure function on the catch log — no network call, no state.',
    },
    {
      n: 2,
      title: 'Dockside sort — barcoded bins + thermal QA',
      src: 'intake.ts · sortAtDock',
      tag: 'edge only',
      tone: 'neutral',
      body: 'Splits the catch into barcoded reusable bins, each with its own thermal-cam surface-temp reading. Anything above 4°C is flagged and held for a person to check — never silently passed through. Deterministic, seeded by catch id, so the same input always produces the same bins.',
    },
    {
      n: 3,
      title: 'Opportunity score',
      src: 'scorer.ts · scoreLot',
      tag: 'Workers AI',
      tone: 'warn',
      body: 'Scores the lot 0–100 from discount vs. market, days to expiry, lot size, and food-bank demand match. The breakdown is math; a Workers AI call turns it into one plain sentence, with a deterministic template fallback if the model is slow — so the score is never invented and the step can never hang the demo.',
    },
    {
      n: 4,
      title: 'Procurement counter-offer',
      src: 'procure.ts · draftProcurement',
      tag: 'Workers AI',
      tone: 'warn',
      body: 'Drafts a price 5% under the best open quote, floored at 60% of market, and writes the actual outreach email. Price and minimum order are computed math; the email copy is a Workers AI call with the same timeout and fallback. Nothing sends until an operator approves it.',
    },
    {
      n: 5,
      title: 'Facility match',
      src: 'canning.ts · matchFacilities',
      tag: 'edge only',
      tone: 'neutral',
      body: 'Ranks canning facilities by species compatibility, open capacity, certifications, and cost per can — a visible, scored list from static seed data, not a single black-box pick.',
    },
    {
      n: 6,
      title: 'Delivery routing → ACCFB',
      src: 'route.ts · planDelivery / planEquityDelivery',
      tag: 'edge only',
      tone: 'neutral',
      body: 'Allocates cases to food banks by urgency — protein gap, cold-storage access, and how narrow the pickup window is — not by miles. Urgency-weighted and computed in place; can rebuild the whole day in one call if a truck drops or an agency cancels.',
    },
    {
      n: 7,
      title: 'Operator approval',
      src: 'approvals.ts',
      tag: 'KV · live app only',
      tone: 'accent',
      body: 'Every draft above sits as PENDING until a person approves or rejects it. In the live dashboard and audit pages this is where state persists — each approval and its audit entry is written to Cloudflare KV so it survives across page loads. The guided demo keeps its own copy in memory, so the showcase resets cleanly on every visit.',
    },
    {
      n: 8,
      title: 'Perishable rescue',
      src: 'perishable.ts',
      tag: 'edge only',
      tone: 'neutral',
      body: "Reuses step 6's urgency scoring to redirect at-risk lots before they spoil — no separate Cloudflare dependency.",
    },
    {
      n: 9,
      title: 'Overflow disposition',
      src: 'overflow.ts',
      tag: 'edge only',
      tone: 'neutral',
      body: "Ranks backup destinations from the same static seed data when a primary route can't take the full lot.",
    },
  ];

  const chipClass: Record<string, string> = {
    neutral: 'chip-neutral',
    warn: 'chip-warn',
    accent: 'chip-warn',
  };
</script>

<svelte:head>
  <title>TIDELIFT · Architecture</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <div class="mb-8">
    <p class="tl-label mb-1">Reference</p>
    <h1 class="font-display text-3xl font-bold text-foam">How the pipeline actually runs</h1>
    <p class="text-sm text-mist mt-2 leading-relaxed max-w-2xl">
      What each agent does, and exactly where Cloudflare sits — for anyone who wants to check under the
      hood before (or instead of) watching the demo.
    </p>
  </div>

  <!-- Section framing -->
  <div class="tl-panel bg-ink p-6 mb-8">
    <p class="tl-label mb-2">TideLift AI — agent reference</p>
    <h2 class="font-display text-2xl font-bold text-foam mb-2">What each agent actually does</h2>
    <p class="font-mono text-sm text-mist leading-relaxed">
      One catch, nine drafts, one rule: the agent recommends, you decide. Every step below is a real
      function call on one real catch log — <span class="text-foam">F/V Morning Star, dock to ACCFB</span> —
      not a scripted narrative.
    </p>
  </div>

  <!-- Steps -->
  <ol class="flex flex-col">
    {#each steps as step, i}
      <li class="flex gap-4">
        <!-- Rail + number -->
        <div class="flex flex-col items-center shrink-0">
          <span class="w-8 h-8 rounded-full border border-line-strong flex items-center justify-center
                       font-mono text-sm text-mist bg-deep-tide">{step.n}</span>
          {#if i < steps.length - 1}
            <span class="w-px flex-1 bg-line my-1"></span>
          {/if}
        </div>

        <!-- Content -->
        <div class="tl-panel p-5 mb-4 flex-1 min-w-0">
          <div class="flex items-start justify-between gap-4 flex-wrap mb-2">
            <h3 class="font-display font-bold text-lg text-foam">{step.title}</h3>
            <span class="font-mono text-[11px] text-foam/35 whitespace-nowrap mt-1">{step.src}</span>
          </div>
          <p class="font-mono text-[13px] text-mist leading-relaxed mb-3">{step.body}</p>
          <span class={chipClass[step.tone]}>{step.tag}</span>
        </div>
      </li>
    {/each}
  </ol>

  <!-- Stack callout — warm dark panel, matches the intake exception style -->
  <div class="rounded-sm border p-5 mt-2 mb-8"
       style="background: var(--surface-error); border-color: rgba(232,101,74,.35);">
    <p class="font-display font-bold text-foam text-lg mb-2">If a judge asks “what's your stack”</p>
    <p class="font-mono text-[13px] text-mist leading-relaxed">
      Cloudflare Pages runs the whole app at the edge — no separate backend server. Workers AI only ever
      writes the sentence explaining a number that's <span class="text-foam">already been computed</span>,
      with an 8-second timeout and a deterministic fallback, so a model hiccup can never break a live demo.
      Cloudflare KV is the one durable store behind the operational app — a single JSON record holding every
      lot, approval, shipment, and audit entry.
    </p>
  </div>

  <div class="flex gap-3 flex-wrap">
    <a href="/intake" class="font-mono text-xs font-semibold bg-salmon text-ink px-4 py-2 rounded-sm hover:bg-salmon-hi transition-colors">
      Open prototype →
    </a>
    <a href="/guided-demo" class="font-mono text-xs font-semibold bg-raised text-foam border border-line px-4 py-2 rounded-sm hover:bg-white/5 transition-colors">
      Watch guided demo →
    </a>
  </div>
</div>
