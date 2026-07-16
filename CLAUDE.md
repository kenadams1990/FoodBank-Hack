# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TideLift AI — a hackathon entry (AI Supply Chain Hackathon 2026, Food Banks + AI, Alameda County) that turns
surplus local-fishery catch into shelf-stable canned seafood for food banks. The concept is a multi-agent
"Operations Intelligence Hub": forecast surplus → negotiate procurement → book canning → route deliveries by
equity/need → summarize in natural language. See `README.md`, `docs/PITCH.md`, `docs/ARCHITECTURE.md`, and
`docs/DEMO_SCRIPT.md` for the pitch narrative and demo flow — read these before making product/scope decisions,
since the judged themes (see README "Themes Covered") drive what's worth building next.

**Human-in-the-loop is the core product rule, not a detail**: every agent produces a draft/recommendation, never
an execution. "Agent recommends. You decide." UI copy and agent docstrings should preserve this framing.

## Repo layout & current state (read before assuming anything is wired up)

```
apps/web       SvelteKit dashboard — the only part with a real dev server
apps/agents    Standalone TypeScript agent logic (forecast, procure, canning, route, analyst)
packages/shared  Shared types + mock data intended for the agents
docs/          Pitch, architecture, demo script (source of truth for intent/narrative)
```

**`apps/web` and `apps/agents`/`packages/shared` are two separate, unwired implementations of the same idea.**
- `apps/web/src/lib/mockSurplusFeed.ts` defines its own types (`SurplusLot`, `DeliveryPlanRow`, `AgentStatus`)
  and mock data, used directly by the dashboard components/routes.
- `apps/agents/*.ts` defines a different type system (`SurplusAlert`, `CanningJob`, `AgencyNeed` in
  `packages/shared/src/types.ts`) with its own mock data, imported via relative paths
  (`../../packages/shared/src/types`) — not as an npm workspace package.
- There is no code path from `apps/agents` into `apps/web` today. Reconciling/wiring them is likely the next
  real task in this repo — don't assume the dashboard reflects the agent logic in `apps/agents/`.
- `packages/shared` has no `package.json` — it's loose source files, not a real workspace package yet.
- `apps/agents` has no `package.json`, build step, or tests — just plain `.ts` files with no runner configured.

### Package manager mismatch (gotcha)
Root `package.json` uses npm-style `"workspaces"` but its scripts (`npm run dev` → `pnpm --filter web dev`)
require **pnpm**. There is no `pnpm-workspace.yaml`. Root `node_modules/` and `package-lock.json` currently on
disk were produced by plain `npm install` (untracked, not committed). Before running anything, check which
tool actually resolves the workspace — don't assume `npm run dev` works out of the box; running commands
directly inside `apps/web` is the reliable fallback.

## Commands

Dashboard (the only part with real tooling), run from `apps/web/`:
```bash
npm install        # or from repo root if npm workspaces resolve correctly
npm run dev         # vite dev — SvelteKit dashboard
npm run build       # vite build
npm run preview     # preview production build
npm run check       # svelte-kit sync && svelte-check
```
There is no lint/test command configured anywhere in the repo yet, and no build/run command for `apps/agents`
(no package.json there — it's imported as raw TS, not compiled or tested independently).

## Architecture — intended agent pipeline (`apps/agents/`, see `docs/ARCHITECTURE.md`)

```
Fishery Feed → forecast.ts (SurplusAlert + buy window)
            → procure.ts (RFQ draft, vendor scoring/negotiation)
            → canning.ts (co-pack slot booking + staging plan → CanningJob)
            → route.ts (equity-aware delivery plan by AgencyNeed: protein gap, access windows, dietary prefs)
            → analyst.ts (NL brief wrapping all of the above for any team member)
```

Each agent file exports pure functions operating on the shared types in `packages/shared/src/types.ts`
(`SurplusAlert`, `CanningJob`, `AgencyNeed`) plus its own mock data for demo purposes (real fishery/co-packer/
food-bank APIs are meant to replace the mocks later — see inline "replace with real API" comments). Build order
per `apps/agents/README.md`: forecast → procure → canning/route → analyst (wraps everything, built last).

## Dashboard (`apps/web/`)

SvelteKit 4 + Tailwind. Routes: `/` (`+page.svelte`) and `/mock-run` (demo walkthrough page). Components in
`src/lib/components/`: `AgentBanner`, `AgentStatusPanel`, `SurplusCard`, `DeliveryPlanTable`. All dashboard logic
currently reads from `src/lib/mockSurplusFeed.ts`, not from `apps/agents`.
