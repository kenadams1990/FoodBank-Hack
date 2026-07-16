# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TideLift AI — a hackathon entry (AISCO "AI Supply Chain Observatory" Hackathon, Food Banks + AI, judged
July 17 2026 at Capgemini) for an "Operations Intelligence Hub": one multi-agent system over a food bank's
**internal** supply chain — forecast inbound supply, score vendors, plan production, route deliveries by
equity/need, and brief any team member in natural language. Every agent produces a draft/recommendation and
never an execution — **"Agent recommends. You decide."** is a load-bearing product rule, not UI flavor; keep
it in agent docstrings, `reason` fields, and dashboard copy.

**The project targets a specific, named food bank: Alameda County Community Food Bank (ACCFB).** One of the
hackathon judges, Daniel Rodriguez, is ACCFB's own Director of Warehouse & Transportation Operations — the
organizers explicitly reward solutions built for a specific food bank with a quantified problem/solution, not
a generic pitch. `docs/ACCFB_NUMBERS.md` tracks what's sourced (from the official AISCO challenge doc) vs.
still-to-verify (from accfb.org) — don't present unverified figures as confirmed.

**Surplus local-fishery catch → shelf-stable canning is one supported inbound-supply stream, not the whole
product.** The hub's shared types (`packages/shared/src/types.ts`) now model all 7 hackathon themes
(forecast, procurement, production/repack, equity routing, agency need, NL briefing); fishery/canning
(`SurplusAlert`/`CanningJob`) is a first-class but optional stream the forecast/procure agents can handle.
Don't re-narrow the pitch back down to "canned fish" — that was an earlier, narrower framing this repo has
moved past. See `docs/PITCH.md`, `docs/ARCHITECTURE.md`, `docs/DEMO_SCRIPT.md`, and the 3 files at repo root
(`AISCO Hackathon Deck 2026 - SHARE.pdf`, `Alameda County Food Bank - Hackathon Challenge Themes.docx`,
`Alameda County Food Bank - The Build List.docx`) for the judging criteria and theme list driving scope.

## Repo layout & current state

```
apps/web         SvelteKit 4 + Tailwind dashboard
apps/agents      TypeScript agent logic (forecast, procure, canning, route, analyst) + Vitest suite
packages/shared  @tidelift/shared — real pnpm workspace package: shared types + mock data
docs/            Pitch, architecture, demo script, ACCFB quantification notes
```

This is a **real pnpm workspace** (`pnpm-workspace.yaml`, root `package.json` has `"packageManager":
"pnpm@11.0.9"`). Use `pnpm`, not `npm` — an earlier state of this repo had an npm/pnpm mismatch; that's
resolved now. If `pnpm install` reports `ERR_PNPM_IGNORED_BUILDS` (esbuild / svelte-preprocess), run
`pnpm approve-builds` — needed once per fresh clone/node_modules wipe.

`apps/agents` and `apps/web` still don't share runtime code — the dashboard reads from
`apps/web/src/lib/mockSurplusFeed.ts` (its own local types/mock data), not from the agents. `apps/web/src/lib/
hubTypes.ts` re-exports the real `@tidelift/shared` hub types as a first step toward wiring the dashboard to
the actual agents — treat replacing `mockSurplusFeed.ts` with real agent output as the natural next increment,
not yet done.

## Commands

```bash
pnpm install                 # from repo root — resolves all 4 workspace packages
pnpm --filter agents test    # vitest run __tests__ (apps/agents)
pnpm --filter web dev        # vite dev — dashboard
pnpm --filter web build      # vite build
pnpm --filter web check      # svelte-kit sync && svelte-check
pnpm test / pnpm build       # root scripts, same as above via --filter
```
CI (`.github/workflows/ci.yml`) runs agent tests + dashboard build on push/PR to `main` via pnpm — keep both
green before pushing.

**Svelte version gotcha:** `apps/web` pins `svelte@^4.2.0` (Svelte 4, not 5) — don't use Svelte 5 rune/snippet
syntax (`$props()`, `{@render ...}`, `{@render children?.()}`) in `.svelte` files; it parses fine in the
editor but fails at build time with `Unexpected character '@'`. Use Svelte 4 idioms (`export let`, `<slot />`).
`apps/web/src/routes/+layout.svelte` shipped with Svelte 5 syntax from the original scaffold commit and was
silently broken until this was caught by actually running `pnpm build` — always build, don't just eyeball
`.svelte` files.

## Architecture — agent pipeline (`apps/agents/`)

```
Inbound supply → forecast.ts (SurplusAlert + buy signal; Theme 1 "See It Coming")
              → procure.ts (RFQ draft, discount negotiation; Theme 1)
              → canning.ts (co-pack slot booking + staging plan → CanningJob; Theme 3 "Production Is Manufacturing")
              → route.ts  (equity-aware delivery plan; Theme 4 "Equity With a Truck Attached" — the flagship agent)
              → analyst.ts (NL brief wrapping the pipeline; Theme 6 "Every Team Member an Analyst")
```

All agents import types/mock data from `@tidelift/shared` (the workspace package, `packages/shared/src/
index.ts` barrel — import from `'@tidelift/shared'`, not deep relative paths).

**`route.ts` is the most developed agent and the reference implementation for the others.** It exports
`planEquityDelivery` (blended urgency score: 0.5 protein-gap + 0.3 perishability + 0.2 access-window
tightness — documented, deliberate defaults, *not* tuned against real ACCFB data yet) and `replanAfterDrop`
(Theme 4's "rebuild the day in minutes when a truck goes down or an agency cancels"). Every row carries a
`reason` string and a `driverLoadNote` that's difficulty-aware, not a raw stop count — mirror this pattern
(quantified `reason` + human-in-the-loop framing) when building out `forecast.ts`/`procure.ts`/`canning.ts`/
`analyst.ts` further, which are still on the older, simpler fishery-specific implementation.

`mockAgencyNeeds` in `route.ts` models 6 realistic Alameda County neighborhoods (East Oakland, Fruitvale, San
Leandro, Hayward, Newark, West Oakland) with a mix of perishable and non-perishable capacity — keep new mock
data geographically/operationally consistent with ACCFB's actual service area per `docs/ACCFB_NUMBERS.md`.

## Dashboard (`apps/web/`)

Routes: `/` and `/mock-run`. Components in `src/lib/components/`: `AgentBanner`, `AgentStatusPanel`,
`SurplusCard`, `DeliveryPlanTable`. Currently wired to `src/lib/mockSurplusFeed.ts`, a self-contained mock
implementation predating `@tidelift/shared` — `src/lib/hubTypes.ts` is the (currently unused) bridge for
migrating the dashboard onto real agent types.
