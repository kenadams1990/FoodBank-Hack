# 🌊 TideLift AI

> **Surplus local fisheries → shelf-stable canned seafood for food banks.**  
> A complete end-to-end AI agent platform that forecasts surplus, negotiates procurement discounts, owns the full canning logistics pipeline, and routes finished product to food banks — eliminating cold chain dependence from source to shelf.

[![Hackathon](https://img.shields.io/badge/AISCO%20Hackathon-2026-blue?style=for-the-badge)](https://github.com/kenadams1990/FoodBank-Hack)
[![Stack](https://img.shields.io/badge/Stack-SvelteKit%20%7C%20TypeScript%20%7C%20AI%20Agents-green?style=for-the-badge)](https://github.com/kenadams1990/FoodBank-Hack)
[![Focus](https://img.shields.io/badge/Focus-Alameda%20County%20Food%20Bank-orange?style=for-the-badge)](https://github.com/kenadams1990/FoodBank-Hack)

---

## The Problem We're Solving

**53 million Americans** visit food banks — 1 in 6. Yet every day, **millions of pounds of surplus seafood** from local fisheries spoil or get discarded because the cold chain is too expensive, too fragile, and too perishable to reach those who need it most.

Frozen dies. Canned travels.

The missing piece isn't the fish — it's the **complete AI agent system** that handles everything end-to-end: finding and contacting fishery suppliers (who have no web presence or public contact info), negotiating procurement discounts autonomously, securing canning facility partnerships, managing the full repack pipeline, and routing shelf-stable protein to food banks that have no supplier relationships and no budget for a supply chain team.

That's TideLift. Not a dashboard. Not a tool. A **complete operational system**.

---

## Why This Is a New Category

Most food bank tech stops at inventory management. TideLift starts *before* the fish is caught.

The original insight was simple: **frozen seafood has perishability risk** — a single power outage or logistics delay destroys the product and the relationship. The solution was to eliminate the cold chain entirely by targeting the canning step. But that created a harder problem: **no one had the supplier contacts, the canning facility relationships, or the negotiation bandwidth** to make it work at scale.

TideLift's agents solve all three — autonomously, continuously, and at a cost food banks can actually afford.

---

## How It Works

TideLift is a **multi-agent Operations Intelligence Hub** built around 5 specialized AI agents that work in concert — from harvest forecast to food bank shelf.

```
🎣 Fishery Surplus           🏭 Canning Partner           🏦 Food Bank Shelf
     │                              │                              │
     ▼                              ▼                              ▼
┌──────────┐   negotiate   ┌──────────────┐   route & track  ┌──────────────┐
│ FORECAST │──────────────▶│  PROCURE &   │─────────────────▶│   EQUITY     │
│  AGENT   │               │  CAN AGENT   │                  │  ROUTER      │
└──────────┘               └──────────────┘                  └──────────────┘
     │                                                               │
     └──────────────────── ANALYST AGENT ───────────────────────────┘
                           (NL Q&A, briefs, dashboards)
```

### The 5 Agents

| Agent | Role | Themes Covered |
|-------|------|----------------|
| 🔭 **Forecast Agent** | Reads harvest calendars + inbound history to predict surplus windows, price dips, and supply gaps 2+ weeks early | Theme 1 — See It Coming |
| 🤝 **Procurement Agent** | Finds fishery supplier contacts, autonomously negotiates volume discounts, books canning facility slots, manages POs — no Rolodex required | Theme 3 — Production Is Manufacturing |
| 🏭 **Canning Ops Agent** | Treats repack as a factory line — forecasts kit needs, stages raw material, predicts volunteer turnout, sequences the floor | Theme 3 — Production Is Manufacturing |
| 🚚 **Equity Router** | Routes finished cans on access windows + dietary need, not just miles; rebuilds routes in minutes when a truck goes down | Theme 4 — Equity With a Truck Attached |
| 📊 **Analyst Agent** | Answers plain-language questions from anyone on the team — no SQL, no tickets; briefs every lead at shift start | Theme 6 — Every Team Member an Analyst |

---

## The Full Pipeline — End to End

TideLift covers every step a human team would otherwise need to coordinate manually:

1. **Surplus detection** — Forecast Agent reads harvest calendars and flags upcoming windows
2. **Supplier outreach** — Procurement Agent finds contacts for local fisheries (no public directory needed)
3. **Discount negotiation** — Agents autonomously negotiate pricing and lock in volume commitments
4. **Canning facility booking** — Procurement Agent identifies co-packing partners and books slots
5. **Canning ops management** — Canning Ops Agent manages the floor: staging, sequencing, volunteer scheduling
6. **Finished goods routing** — Equity Router delivers to food banks by access window, dietary need, and urgency
7. **Continuous reporting** — Analyst Agent keeps every stakeholder informed in plain language

This is the pipeline that didn't exist. Food banks had no way to work with local fisheries at scale because the middle steps — contact finding, negotiation, canning logistics — required a full supply chain team. TideLift *is* that team.

---

## Alameda County Food Bank — Build List Coverage

TideLift directly addresses **Alameda County Food Bank's 35-item Operations Intelligence Hub** request across all 7 challenge themes:

### ✅ Theme 1 — See It Coming
- Produce/fish surplus forecast off harvest calendars and inbound history
- Vendor scoring on delivered vs. committed performance
- Price window flagging for purchased food before prices move

### ✅ Theme 3 — Production Is Manufacturing
- Canning line treated as a repack factory — box/kit forecasting weeks out
- Volunteer turnout prediction and no-show risk flagging
- Raw material staging generated the night before, by station, in order

### ✅ Theme 4 — Equity With a Truck Attached
- Routing on agency **access windows** and product urgency, not just miles
- EV charging schedules matched to tomorrow's routes and daytime power cap
- Route rebuild in minutes when a truck goes down or agency cancels

### ✅ Theme 5 — Need Is the Demand Signal
- Dietary preference matching: inbound seafood matched to neighborhood nutrition needs
- Pull-based replenishment replacing pre-allocation guesswork

### ✅ Theme 6 — Every Team Member an Analyst
- Natural language Q&A for drivers, receivers, and warehouse floor staff
- Shift-start briefs: what's inbound, what's at risk, what changed overnight
- Voice note → structured proposal pipeline

### ✅ Theme 7 — A Smarter Movement
- Cross-food-bank surplus matching before product ages out
- Anonymized benchmark data shared across the network

---

## Core Insight: Why Canning?

> *"Frozen has perishability — which is exactly the vulnerability we needed to eliminate."*

| | Frozen | Canned (TideLift) |
|---|---|---|
| **Cold Chain Required** | Yes — costly, fragile | ❌ None |
| **Shelf Life** | ~3–6 months | 2–5 years |
| **Distribution Reach** | Urban hubs only | Rural, remote, any pantry |
| **Waste Risk** | High (power outages, transport) | Near zero |
| **AI Negotiability** | Low — spot market | ✅ Contractable, forecastable |
| **Supplier Discovery** | Manual outreach required | ✅ Agent-automated |

Canning transforms a volatile, time-sensitive commodity into a **predictable, negotiable, distributable asset** — exactly what food bank supply chains need. And because agents handle supplier discovery and negotiation, food banks don't need existing fishery relationships to start.

---

## Tech Stack

```
Frontend:     SvelteKit (real-time dashboard, NL query interface)
Agents:       Multi-agent orchestration — forecast, procure, can, route, analyze
Backend:      TypeScript / Node.js
Data:         Harvest calendars, USDC fishery data, inbound history APIs
AI:           LLM-powered negotiation, supplier discovery, and NL Q&A layer
Infra:        Containerized, deployable on commodity cloud
```

### Repo Structure

```
/
├── apps/
│   ├── web/          # SvelteKit dashboard — live ops view + NL Q&A
│   └── agents/       # Multi-agent orchestration (forecast, procure, can, route)
├── packages/
│   └── shared/       # Types, schemas, shared utilities
└── docs/
    ├── pitch/        # Deck and one-pager
    ├── architecture/ # Agent flow diagrams
    └── demo/         # Demo script and recorded walkthrough
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run agents locally
npm run agents:dev
```

---

## The Stakes

- 🐟 **US fisheries discard millions of tons** of bycatch and surplus annually
- 🥫 **Canned seafood is one of the most requested** but least donated food bank items
- 📋 **No supplier directory exists** — food banks can't find fisheries, fisheries can't find food banks
- 🤖 **No AI system currently exists** to automate the fishery → negotiation → canning → food bank pipeline end-to-end
- 💰 **$2,500 First Prize** — AISCO Hackathon 2026 (Judging: July 17, Capgemini)

---

## Judging Criteria Alignment

| Criterion | TideLift's Answer |
|-----------|------------------|
| **Solves a real problem** | Directly from ACFB's 35-item build list + field research |
| **AI agent-driven** | 5 specialized agents with defined roles and handoffs |
| **Quantifiable impact** | Surplus fish → shelf-stable protein, cold chain eliminated, 2–5yr shelf life |
| **Human in the loop** | Agents augment staff, never replace relationships or trust |
| **Built for Alameda County** | All 7 themes addressed, ACFB operations specifically modeled |
| **Complete system** | Procurement negotiation + canning logistics + routing — not just a dashboard |

---

## Team

Built at the **AI Supply Chain Observatory Hackathon 2026** — Food Banks + AI  
Hosted by the AI Objectives Institute (AOI)  
July 15–17, 2026 | Pebblebed → Capgemini

---

*TideLift — because the tide lifts all boats, and every neighbor deserves protein on the shelf.*
