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

### 2026-07-16 (demo day) — Fable 5 orchestrating Sonnet subagents
- **Scope pivot (team decision):** all-in on the fish concept; onsite advisors said focus on ONE segment —
  vessel → pickup/processing. Sourced from the team Slack (`#hackathon-food-banks`, `#ideas`).
- Merged the team's PR #4 full-stack build (Docker, API routes, approvals/pipeline/scorer stack), keeping
  the pnpm-workspace migration; took theirs on all product-code conflicts.
- **Fixed PR #4's broken build:** added the missing shared types (SurplusLot, Supplier, CanningFacility,
  FoodBank, Quote, Approval, Shipment, AuditEvent), implemented `planDelivery` in route.ts, fixed a
  type-reexport that broke the web build, rewrote 3 stale test files. 45/45 → green.
- **Shipped the advisor-priority segment:** `apps/agents/intake.ts` (on-vessel CV metrics drive dispatch
  before the truck rolls; dockside sort into barcoded bins; thermal-cam QA flags > 4°C) + 12 tests
  (57/57 total) + `/api/intake` + `/intake` dashboard page with nav. Page + tests built by Sonnet
  subagents to spec.
- **README revised** (Sonnet subagent): human-in-the-loop framing throughout ("Agent recommends. You
  decide."), vessel→processing build-focus section, corrected pnpm quick start.
- **CI greened** (Sonnet subagent): two stacked config bugs — `pnpm/action-setup` `version: 11` conflicting
  with the `packageManager` pin (drop the workflow input when packageManager is pinned), and pnpm@11
  requiring Node ≥22.13 while CI ran Node 20 (bumped to 22). ci.yml only, 2 commits.
**Next up (pre-judging):** rehearse the demo flow (/intake → approvals → logistics → audit); update
docs/DEMO_SCRIPT.md for the intake-first story; verify ACCFB §3 figures if time allows.

### 2026-07-17 (judging day) — live-session sync from team Slack
- **Deck finalized and in use for judging:** `TideLift_Present.pptx` (10 slides) — team is presenting live at
  Capgemini as this entry is written; the guided-demo webpage (`tidelift.tatinc.us/guided-demo`) is the
  chosen live centerpiece, hyperlinked directly from Slide 7.
- **Added a resilience fallback:** the screen-recorded walkthrough
  (`apps/web/static/media/guided-demo/videos/Webpage-demo.mov`) is now committed to the repo and linked as a
  second, offline-safe hyperlink on Slide 7 ("Watch the screen-recording (backup video)"), in case the live
  site is unreachable mid-pitch.
- **CV hero shot confirmed live AI, not a mockup:** Ragul's trained fish-scan model (boxes each fish with
  count/size/species from a real catch photo) is in hand, along with the training dataset source
  ([Zenodo record 6475675](https://zenodo.org/records/6475675)). This is the pipeline's strongest live-demo
  moment and should stay framed that way in any future narration or write-up.
- **Framing locked for the parts that aren't built yet:** vessel-at-sea, physical sort/conveyor, and
  autonomous cold-room processing are presented honestly as roadmap, not implemented — "the catch scan is
  live AI, the rest is our roadmap" tests better with judges than overclaiming.
- **Acknowledgments finalized:** team roster, plus Hassan (Community Manager, San Ramon Valley Islamic
  Center, who connects surplus seafood to families through the Solano and Contra Costa County food banks),
  Alameda County Community Food Bank, and the AISCO organizers.
- **Planned next (non-blocking for today's pitch):** a post-presentation polish pass — run the finalized deck
  and team notes through Claude for a review, then hand a scoped follow-up prompt to Fable 5 to generate a
  small set of supporting images/video for the deck's marketing-style beats (vessel → CV scan → dock sort →
  processing → delivery). Tracked as roadmap polish, not a dependency of the live judging round.

### 2026-07-17 (post-presentation) — interactive working-prototype pass
- **Made Vessel Intake a real, hands-on human-in-the-loop flow** (`feat/working-prototype`). `/intake` now
  runs the actual agent pipeline on a logged catch on demand — score → procurement counter-offer → facility
  match → equity route → overflow — persists a PENDING approval, and lets an operator Approve/Reject. Approve
  advances the lot to `PROCUREMENT_CONFIRMED` and schedules an ACCFB shipment; sub-500 lb catches take an
  honest HOLD path. Every decision is written to the audit trail.
- **New server backbone:** `apps/web/src/lib/server/intakePipeline.ts` + `/api/intake/run` and
  `/api/intake/approve`, routing every mutation through the KV-backed store (`store.ts`) so a run is visible
  across Audit and Approvals — reconciling the store with the agent-module approval arrays used previously.
- **Honesty labeling:** on-vessel computer-vision counts and thermal readings are badged "Simulated — trained
  fish-scan model is roadmap" on `/intake` and the guided demo; scoring/procurement/routing is the real agent
  logic.
  Agent output matches the deck ($1,008 saved vs market, 1,700 lbs cleared).
- **Dashboard preserved** as the deck-aligned overview (38,400 lbs → 32,000 meals); the hands-on prototype is
  surfaced as its own labeled entry point ("Run the pipeline yourself") alongside the guided-demo link, not a
  replacement for either.
- Verified end-to-end against a live dev server (run → approve → persisted shipment → audit) and in-browser;
  agent tests 89/89 green, web build clean. Not yet deployed — the live judging site is intentionally left
  untouched.
- **Next:** real computer-vision hero. The trained fish-scan model (`best.pt`, YOLO weights) is in hand but
  runs off-Cloudflare; wiring a photo→inference endpoint (e.g. a hosted Space) into `/intake` is the follow-up
  so on-vessel CV becomes live rather than simulated.

### 2026-07-18 — Sonnet 5 (brand identity + team Slack setup, no code changes)

**No repo code touched this session** — working tree stayed clean apart from one stray untracked screenshot
(`apps/web/static/media/guided-demo/videos/Screenshot 2026-07-17 at 11.59.49PM.png`, not created by this
session, left as-is for Ken to triage). All work below is external deliverables + team infra, not commits.

- **Built TideLift's brand identity** via Pika's `build-a-brand` skill (full brand book mode): 3 direction
  boards → Ken picked "Control Tower" layout/logo/type + "Tideline" board's color palette, merged → full
  15-page brand guidelines PDF → full brand kit zip (logo assets, 12 icons, fonts, design tokens, AI
  prompts). All saved to `~/Desktop`, **not committed to the repo**. See [[tidelift-brand-identity]] memory
  for the full palette/type spec and file locations — start there if the dashboard's visual design is ever
  revisited.
- **Diagnosed and worked around a real Pika `html_to_pdf` bug**: multi-photo pages embed images at source
  resolution instead of CSS display size, causing both silent 300s timeouts and hard `PDF_OUTPUT_TOO_LARGE`
  rejections. Fixed by downsampling source photos before referencing them, and for the final assembly, by
  rendering each page individually via the (reliable) `html_to_png` and merging locally with Pillow instead of
  fighting the PDF export path further. Wrote a detailed engineering report for Pika's team
  (`~/Desktop/pika-html-to-pdf-engineering-report-2026-07-17.md`, not in repo). See
  [[pika-html-to-pdf-image-embedding-bug]] memory for the reusable fix pattern.
- **Set up team Slack infrastructure:** `TAT Agent` bot (bot user `tat_agent`, `chat:write`+`files:write`,
  token in 1Password) verified working; posted the brand guidelines PDF + kit to `#images-videos`. Per Ken's
  request to separate FoodBank-Hack from the rest of the `tat-inc` workspace, created private
  `#foodbank-hack` channel (7 members invited). **Flagged, not yet resolved:** Pragnaya Priyadarshini
  (recorded elsewhere as having withdrawn from the project 2026-07-16) was still in the `#images-videos`
  roster and got invited to `#foodbank-hack` along with everyone else — needs Ken to confirm whether to
  remove her. Also pending: Ken manually converting `#images-videos`, `#github-project-codebase`, and
  `#hackathon-food-banks` from public to private (Slack's API can't do this on a non-Enterprise-Grid
  workspace — UI-only action). Full state in [[hackathon-context]] memory, "Slack workspace restructuring"
  section.

**Next up:** resolve the Pragnaya channel-membership question; Ken to manually convert the 3 remaining public
channels to private; otherwise the standing roadmap is unchanged (verify ACCFB §3 figures, bring
forecast/procure/canning/analyst up to route.ts's bar, wire the dashboard to real agent output, real CV
inference endpoint for `/intake`).
