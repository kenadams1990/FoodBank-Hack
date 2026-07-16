# TideLift AI — Architecture

## Agent Pipeline

| Stage | Agent | Output |
|-------|-------|--------|
| Forecast | `forecast.ts` | SurplusAlert + buy window |
| Procure | `procure.ts` | Scored RFQ + discount draft |
| Can | `canning.ts` | Co-pack slot + staging plan |
| Route | `route.ts` | Equity-aware delivery plan |
| Brief | `analyst.ts` | NL summary for any team member |

## Sequence Diagram

```
Fishery Feed → [Forecast Agent]
                    ↓ SurplusAlert
             [Procure Agent] → RFQ → Fishery/Cannery
                    ↓ CanningJob
             [Canning Agent] → Co-pack booking
                    ↓ Staged inventory
             [Route Agent] → Delivery plan by neighborhood need
                    ↓
             [Analyst Agent] → NL brief to dashboard
```

## Human-in-the-Loop Rule
> **Agent recommends. You decide.** Every negotiation draft, routing plan, and production slot requires explicit human approval before execution.

## Stack
- **Frontend**: SvelteKit
- **Agents**: TypeScript (LangChain / Vercel AI SDK)
- **Data**: Mock surplus feed (Monterey/San Diego style) → swap real API
- **Routing**: OpenStreetMap + EV truck constraints
