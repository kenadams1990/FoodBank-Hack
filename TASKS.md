# TASKS.md — TideLift AI (FoodBank-Hack)

Stable reference: `CLAUDE.md`. This file is the moving state — roadmap + append-only Session Log.
Hackathon: AISCO "AI Supply Chain Observatory", Food Banks + AI. Judging July 17 2026, Capgemini.

## Roadmap

- [x] Scaffold repo: `apps/web` (SvelteKit dashboard), `apps/agents` (5 agent modules), `packages/shared`
- [x] Add Vitest test suite for `apps/agents`
- [x] Convert to a real pnpm workspace (`pnpm-workspace.yaml`, `packageManager` pin, CI via pnpm)
- [x] Make `packages/shared` a real workspace package (`@tidelift/shared`, barrel `index.ts`)
- [x] Expand shared types to cover all 7 hackathon themes (`HubState`, `SupplyForecast`, `ProcurementDraft`,
      `ProductionPlan`, `DeliveryPlanRow`, `ShiftBrief`) — fishery/canning demoted to "one supported stream"
- [x] Build out `route.ts` as the flagship equity-routing agent (urgency scoring, perishability priority,
      driver-difficulty notes, `replanAfterDrop`, realistic ACCFB-area mock agencies)
- [x] Add `docs/ACCFB_NUMBERS.md` — quantified problem/solution sourcing, ACCFB-specific
- [x] Add CI (`.github/workflows/ci.yml`): agent tests + dashboard build on push/PR to main
- [ ] Verify `docs/ACCFB_NUMBERS.md` §3 figures against accfb.org (annual report / impact page) — currently
      blocked/TODO, don't present as confirmed until sourced
- [ ] Bring `forecast.ts`, `procure.ts`, `canning.ts`, `analyst.ts` up to the same maturity level as
      `route.ts` (quantified `reason` fields, theme-explicit framing, less fishery-narrow)
- [ ] Wire `apps/web` dashboard to real `@tidelift/shared` / agent output (replace
      `apps/web/src/lib/mockSurplusFeed.ts`) — `apps/web/src/lib/hubTypes.ts` is the bridge, not yet consumed
      by any route/component
- [ ] Reconcile `docs/PITCH.md` / `docs/DEMO_SCRIPT.md` narrative with the widened (all-7-themes) scope —
      they still read fishery/canning-first

## Session Log

### 2026-07-15 — Sonnet 5
- Ran `/init`: wrote the initial `CLAUDE.md` documenting the (at-the-time) unwired `apps/web` /
  `apps/agents` split and the npm/pnpm package-manager mismatch.
- Set up Vitest for `apps/agents` (no test tooling existed before): `package.json`, `vitest.config.ts`
  (explicit `include`, `@shared` alias), 6 test files / 17 tests against the actual agent modules and
  `packages/shared/src/mockData.ts` (`MOCK_SURPLUS_EVENTS`) — skipped a patch's mismatched import example
  (`SURPLUS_LOTS`/`QUOTES`/etc.) that didn't match this repo's real exports.
- Committed + pushed directly to `main` (no feature branch): `5e8f01a`.
- Wrote a Sonnet→Opus handoff prompt (via `next-session` skill) to audit the project against the real
  hackathon judging materials the user had just added locally (AISCO deck + ACCFB challenge docs), flagging
  that the fishery/canning pitch might not map cleanly to the official 7 themes or the "quantify + name a
  specific food bank" judging bar.

### 2026-07-16 — Sonnet 5 (between-session changes + wrap-up)
- Between this and the prior entry, substantial work landed in the working tree (not authored by this
  session — inferred from the diff at wrap-up time, consistent with the Opus audit handoff above): the repo
  became a real pnpm workspace, `@tidelift/shared` became a real package, shared types were expanded to cover
  all 7 themes with fishery/canning explicitly reframed as one optional stream, `route.ts` was rebuilt into
  the flagship equity-routing agent, `docs/ACCFB_NUMBERS.md` was added, CI was added, and tests were updated
  to match (26 tests, up from 17).
- Session-end wrap-up: reinstalled the workspace via `pnpm` (removed stray `npm`-created `node_modules`/
  `package-lock.json` from the earlier session — `pnpm-lock.yaml` is now the tracked lockfile per the new
  `.gitignore`), ran `pnpm approve-builds` for esbuild/svelte-preprocess, and verified both
  `pnpm --filter agents test` (26 passed) and `pnpm --filter web build`.
- **Found and fixed a real, pre-existing bug**: `apps/web/src/routes/+layout.svelte` used Svelte 5 rune/
  snippet syntax (`$props()`, `{@render children?.()}`) despite the app pinning `svelte@^4.2.0` — present
  since the original scaffold commit (`b8ade81`), never caught because nobody had run `pnpm build` before.
  Fixed to Svelte 4 idioms (`<slot />`). This would have broken the CI build step that was just added.
- Rewrote `CLAUDE.md` to match current state (pnpm workspace, `@tidelift/shared`, all-7-themes framing,
  `route.ts` as reference implementation, Svelte-version gotcha).
- Created this `TASKS.md` (none existed before).

**Next up:** verify ACCFB §3 figures; bring `forecast`/`procure`/`canning`/`analyst` up to `route.ts`'s bar;
wire the dashboard to real agent output; reconcile pitch docs with the widened scope. Judging is July 17.
