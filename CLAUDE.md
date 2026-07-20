# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TideLift AI — a hackathon entry (AISCO "AI Supply Chain Observatory" Hackathon, Food Banks + AI, judged
July 17 2026 at Capgemini): surplus seafood from local fishing vessels and aquafarms → cold-chain pickup →
canning/processing → food banks. Every agent produces a draft/recommendation and never an execution —
**"Agent recommends. You decide."** is a load-bearing product rule, not UI flavor; keep it in agent
docstrings, `reason` fields, and dashboard copy.

**Current build focus (per onsite hackathon advisors): the vessel → pickup → processing segment.** On-vessel
CV catch metrics drive the purchase/dispatch decision before the truck rolls; dockside CV + thermal-cam QA
sort catch into barcoded reusable bins; chem/microbiological QA runs before and after processing. This is
`apps/agents/intake.ts` + the `/intake` dashboard page — the flagship of the current milestone. The
downstream agents (scorer, procurement drafts, facility matching, delivery routing, approvals/audit) are
built and green but secondary to this segment.

**The project targets a specific, named food bank: Alameda County Community Food Bank (ACCFB).** One of the
hackathon judges, Daniel Rodriguez, is ACCFB's own Director of Warehouse & Transportation Operations — the
organizers explicitly reward solutions built for a specific food bank with a quantified problem/solution, not
a generic pitch. `docs/ACCFB_NUMBERS.md` tracks what's sourced (from the official AISCO challenge doc) vs.
still-to-verify (from accfb.org) — don't present unverified figures as confirmed.

**This repo is public with investors and judges reading it.** Everything committed — issues, commit messages,
TASKS.md, docs — must read as outward-facing and professional: no internal team/personnel notes, no
process drama. Scope changes are framed as deliberate roadmap focus. See `README.md`, `docs/PITCH.md`,
`docs/DEMO_SCRIPT.md`, and the 3 organizer files at repo root for the judging criteria driving scope.

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
Vessel/farm catch log → intake.ts   (on-vessel CV → dispatch draft; dockside sort into barcoded bins,
                                     thermal QA flags > 4°C — the current-milestone flagship)
Surplus lot           → scorer.ts   (0–100 opportunity score: discount/urgency/size/demand, with rationale)
                      → procure.ts  (counter-offer draft vs open quotes, 60%-of-market floor)
                      → canning.ts  (ranked facility matches: species compat, slots, certs, cost)
                      → route.ts    (planDelivery: case allocation across food banks;
                                     planEquityDelivery/replanAfterDrop: lbs-level equity routing)
                      → analyst.ts  (NL operations brief)
pipeline.ts orchestrates score → procure → canning → delivery, emitting a PENDING Approval per step
(approvals.ts) — nothing executes without an operator; every resolution is written to the audit log.
```

All agents import types/mock data from `@tidelift/shared` (the workspace package barrel — import from
`'@tidelift/shared'`, not deep relative paths). Every agent output carries a human-readable `reason`/
`rationale` — preserve that pattern in anything new. Weights and thresholds (urgency blend in route.ts,
score bands in scorer.ts, 4°C cold-chain max in intake.ts) are documented, deliberate defaults — not tuned
against real ACCFB data yet.

Mock data (`packages/shared/src/mockData.ts`) models a realistic Pacific-coast scenario (5 suppliers, 8
lots, 3 facilities, 6 food banks incl. ACCFB) — keep new mock data geographically/operationally consistent
with ACCFB's service area per `docs/ACCFB_NUMBERS.md`.

## Dashboard (`apps/web/`)

**Design system:** the app runs the dark **Tide "Control Tower"** palette live (as of 2026-07-20) — Slate
Ink page, Deep Tide panels, Salmon as the single per-screen signal; Space Grotesk (display) + IBM Plex Mono
(body/data). Tokens + component classes live in `src/app.css` (component classes in `@layer components` so
Tailwind utility overrides win); the Tailwind palette is in `tailwind.config.js` (old light/teal values kept
as `legacy-*`). Full brand spec + reusable components in `design-system/` and memory [[tidelift-brand-identity]].
Contrast rule of thumb on the dark theme: use the `-hi` semantic text variants (`text-success-hi`,
`text-danger-hi`), not the base `text-ok`/`text-alert` (too dark on dark). No emoji or exclamation points in
product UI.

SvelteKit 4 + Tailwind. Pages: `/` (dashboard), `/intake` (vessel intake — demo centerpiece), `/logistics`
(lot kanban), `/partners`, `/audit` (approval/audit trail), `/lots/[id]`, `/mock-run` (scripted demo).
API routes under `src/routes/api/` (lots, approvals, shipments, recommendations, intake, audit) serve from
`src/lib/store.ts`, an in-memory store seeded from `@tidelift/shared` mock data. The web app reaches agent
logic through the `$agents` vite alias (see `vite.config.js`) and shared types through `$shared` — API
routes call agents server-side; pages fetch from the API.
