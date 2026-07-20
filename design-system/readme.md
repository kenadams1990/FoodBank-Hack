# TideLift Design System

**TideLift** is the AI supply-chain control tower that turns surplus catch into food bank meals — every agent recommends, a human always decides. Built at the AISCO Hackathon 2026 (Food Banks + AI, hosted by AOI) for the Alameda County Community Food Bank's Operations Intelligence Hub build list.

The product is a **multi-agent Operations Intelligence Hub**: specialized agents (Intake, Forecast, Procurement, Canning Ops, Equity Router, Analyst) draft every step from on-vessel catch to food bank shelf — scoring lots, drafting procurement terms, matching canning facilities, routing deliveries. Nothing executes until an operator clicks approve; every decision is logged to an audit trail. Tagline: **"Command the catch. Never touch the truck."** Motto: **"Agent recommends. You decide."**

## Sources
- `uploads/tidelift-brand-guidelines.pdf` — 15-page brand book (extracted page images in `extracted/brand-pdf/`). **Authoritative for brand.**
- GitHub repo: https://github.com/kenadams1990/FoodBank-Hack — SvelteKit product code (also mounted locally as `FoodBank-Hack/`). Explore it for deeper context on agent logic and screen structure.
- `uploads/TideLift_Present.pptx` — hackathon pitch deck (text + media extracted to `extracted/pptx/`).
- Live demo: https://tidelift.tatinc.us (guided demo at `/guided-demo`, working prototype at `/intake`).

**Palette note:** the shipped hackathon app uses an older light/teal scheme (Archivo + IBM Plex Sans, teal `#0E7C86`). The brand guidelines supersede it with the dark "control tower" Tide palette used throughout this system. Legacy values are preserved as `--legacy-*` tokens in `tokens/colors.css`.

## CONTENT FUNDAMENTALS

**Voice:** Precise · Calm · Evidentiary · Quietly Fast · Human-Respecting. Reference brands: Linear (typographic restraint), Palantir (command-center gravity, data as hero), Stripe (trust-building clarity).

**Rules & patterns:**
- Lead with real numbers — lbs, meals, °C, $ — credibility is in specifics: *"38,400 lbs of surplus salmon. One human approval. 32,000 meals to ACCFB."*
- Every recommendation ships with its reasoning; copy always names the human decision point: *"Every recommendation ships with its reasoning. Nothing executes without your approval."*
- Buttons are verb-first, sentence case, calm: "Review recommendation", "View audit trail", "Open prototype", "Watch demo". One salmon CTA per screen.
- Error states state facts + next action, never alarm: *"Dispatch paused — sensor reported 4.6°C on lot 0043. Confirm before proceeding."*
- Labels/captions are ALL-CAPS mono with wide tracking (0.28em): "AVAILABLE SURPLUS", "AGENT ACTIVITY".
- Numbers always in IBM Plex Mono tabular figures — they read as verified data.
- Headlines never run past two lines; cut the sentence instead.
- Honesty labeling: simulated data is explicitly tagged ("Simulated — trained fish-scan model is roadmap").
- Direct address "you"; the agent is third person ("the agent drafts, you approve").
- **Forbidden:** "revolutionary", "game-changing", "seamless", "AI-powered" as a standalone claim, "disrupt", exclamation points in product UI, "simply"/"just" (never minimize real operational complexity). No emoji in product UI (the repo README uses them, the brand does not).

## VISUAL FOUNDATIONS

- **Color:** Slate Ink `#1C2B2C` page background; Deep Tide `#123B41` panels; Foam `#F1F7F5` text-on-dark and light surfaces; Salmon `#E8654A` is the *signal light* — one call to action per screen, never a wash. Extended neutrals Ink/Mist/Fog; semantic Success/Warning/Danger are muted, not neon. Error surfaces use a warm dark brown (`#3A2A22`-ish) with salmon text.
- **Type:** Space Grotesk (500/700) for display/headlines/wordmark; IBM Plex Mono (400/500/600) for *everything else* — body, data, labels, log lines. Scale: 64/40/28/19/16/13. Min product body: 14px.
- **Backgrounds:** flat dark fields with a faint 60px square grid (`rgba(foam,.05)` hairlines) — blueprint/control-room texture. No gradients, no glassmorphism, no drop shadows or glows. The system is flat and precise.
- **Cards/panels:** Deep Tide rectangles, sharp or 2px corners, no border or a 1px `rgba(241,247,245,.08)` hairline. Dense data with generous dark negative space around it.
- **Layout:** thin full-width topbar (mark + TIDELIFT compact label + section label + page numbers in mono caps); content on a visible grid. Data density with air.
- **Motion:** quiet and fast — 120–200ms ease-out fades/slides; a slow pulse for "live" dots. Nothing bouncy.
- **Hover:** slight lighten of the surface or salmon→lighter salmon (`#EF7D66`); press: darken, no shrink.
- **Imagery:** real cold-chain work photographed in available light (blue hour, overcast, warehouse fluorescent). Cool-neutral grade, visible film grain, off-center editorial framing, racially diverse cast, never models or staged smiles. Salmon stays in the UI, never graded into photos. Photos in `assets/photos/`.
- **Logo:** three ascending bars + beacon dot (`assets/logo.svg` salmon, `assets/logo-slate.svg` for light surfaces). Wordmark "TideLift" in Space Grotesk Bold, tight tracking; compact variant "TIDELIFT" all-caps mono, 0.28em tracking. Clear space = beacon-dot height. Never stretch, rotate, recolor outside the set, or add shadows. Legacy fish-eye mark preserved at `assets/legacy-fish-mark.svg`.

## ICONOGRAPHY

- **Lucide** is the icon system: 1.5px stroke, sharp corners, butt line caps, 24×24 grid. Load from CDN (`https://unpkg.com/lucide@latest`) or inline the SVG paths at `stroke-width="1.5"`. Documented set: arrow-right, arrow-down, check, close/x, plus, minus, search, user, settings, bell, menu, info — use Lucide at 1.5px for anything beyond it.
- No icon font, no emoji as icons. Unicode used sparingly for data connectors (`──●──` flow strips, `→` in metrics, `·` separators, `▶` for demo links).
- The shipped app inlines hand-drawn 1.5px-stroke SVGs (vessel, truck, thermometer, clock) — stylistically compatible with Lucide.

## Index

- `styles.css` — global CSS entry (imports everything below)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`
- `assets/` — `logo.svg`, `logo-slate.svg`, `legacy-fish-mark.svg`, `fonts/` (Space Grotesk, IBM Plex Mono), `photos/` (dockside heroes)
- `guidelines/` — foundation specimen cards (Design System tab)
- `components/core/` — Button, Chip, Readout, ImpactNumber, Logo, Label
- `components/product/` — SurplusCard, AgentActivityFeed, ApprovalActions, DeliveryPlanTable, ExceptionAlert, FlowStrip
- `ui_kits/hub/` — Operations Intelligence Hub screens (Dashboard, Vessel Intake, Audit Trail)
- `slides/` — brand slide templates (Title, Stats, Comparison, Agents, Quote)
- `extracted/` — brand-PDF page images + pitch-deck media (reference only)
- `SKILL.md` — agent-skill entry point

**Intentional additions:** `Icon` wrapper (Lucide loader) — needed to standardize the documented 1.5px stroke. Everything else maps 1:1 to a source component or a brand-book element.

**Component inventory (from sources):** brand PDF defines buttons (primary/secondary), labels, chips/badges, error panel; the codebase defines SurplusCard (catch-ticket), AgentStatusPanel, RecommendationPanel (approve/reject), DeliveryPlanTable, ExceptionAlerts, flow strip, readout chip, impact number, topbar nav.
