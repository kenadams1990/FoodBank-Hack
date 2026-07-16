# TideLift Agents

| File | Role |
|------|------|
| `forecast.ts` | Harvest + inbound + carrier prediction → SurplusAlert |
| `procure.ts` | RFQ generation, vendor scoring, discount negotiation drafts |
| `canning.ts` | Co-pack capacity booking + staging plan |
| `route.ts` | Urgency + access + EV-aware delivery routing |
| `analyst.ts` | NL interface over all data for any team member |

## Human-in-the-Loop
Every agent produces a **draft** or **recommendation**. Nothing executes without explicit human approval. The dashboard makes this visible on every screen.

## Build Order (Priority)
1. `forecast.ts` — highest judge signal on "See It Coming"
2. `procure.ts` — demonstrates negotiation agent capability
3. `canning.ts` + `route.ts` — complete the pipeline
4. `analyst.ts` — NL Q&A layer last (wraps all others)
