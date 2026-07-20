# Ops Hub UI Kit

Recreation of the TideLift Operations Intelligence Hub (SvelteKit app at `FoodBank-Hack/apps/web`, live at tidelift.tatinc.us), restyled from the shipped legacy teal palette to the brand-guideline Tide palette (see root readme "Palette note").

Screens:
- **Dashboard** — impact hero band (lbs → meals), cold-chain flow strip, available-surplus catch tickets, agent activity feed, exception alert.
- **Vessel Intake** — the flagship flow: CV catch log (labeled Simulated), dispatch recommendation, run-pipeline → 4 agent decisions → dockside sort table → operator Approve/Reject.
- **Audit Trail** — every draft and decision, logged either way.

`index.html` is interactive: nav between screens, run the intake pipeline, approve/reject. Composes `components/core` + `components/product` from the bundle; screen-only chrome (Topbar) lives here.

Not recreated (exists in the app, left out deliberately): Logistics kanban, Replenish, Partners, Guided Demo, Architecture pages.
