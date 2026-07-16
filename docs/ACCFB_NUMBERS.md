# ACCFB — Quantified Problem & Solution

Sourced operational figures for **Alameda County Community Food Bank (ACCFB)**, the food bank
this project targets (judge **Daniel Rodriguez** is ACCFB's Director of Warehouse & Transportation
Operations). Use these to quantify the problem AND the solution in the pitch/deck — the organizers
explicitly reward both.

> ⚠️ **Sourcing status.** The figures in *§1* are quoted from the official **AISCO hackathon
> challenge document** ("Alameda County Food Bank – Hackathon Challenge Themes"), which describes
> ACCFB's own operation. The ACCFB-specific figures in *§3* still need corroboration from ACCFB's
> public annual report / impact page (blocked on a live web fetch at time of writing — see TODO).
> Do not present §3 numbers as verified until fetched.

## 1. ACCFB operational profile — from the AISCO challenge doc (citable now)

| Metric | Figure | Source |
|---|---|---|
| Inbound trucks received | **~20 per day** | AISCO Challenge Themes doc |
| Warehouse footprint | **100,000+ sq ft** | AISCO Challenge Themes doc |
| Food moved per year | **~60 million lbs** | AISCO Challenge Themes doc |
| Partner agencies served | **hundreds** | AISCO Challenge Themes doc |
| Fleet | **on the road every morning** (delivery fleet) | AISCO Challenge Themes doc |
| Supply character | **volatile, donated, seasonal** supply vs **persistent, predictable** need | AISCO Challenge Themes doc |

Verbatim anchor quote (challenge doc): *"Twenty inbound trucks a day. A hundred thousand plus
square feet of warehouse. A fleet on the road every morning. Sixty million pounds of food a year
moving to hundreds of partner agencies and the neighbors they serve."*

## 2. National context (citable now)

| Metric | Figure | Source |
|---|---|---|
| Americans visiting food banks | **53 million (1 in 6)** | Feeding America, 2021 (AISCO deck) |

## 3. ACCFB-specific figures — TO VERIFY (pending web fetch)

Fetch from `accfb.org` (About / Our Impact / most recent Annual Report) and fill in with source URL + date:

- [ ] Pounds of food distributed / year (corroborate the ~60M figure)
- [ ] Number of member/partner agencies (exact count)
- [ ] People / households served per year
- [ ] % fresh produce / perishable
- [ ] Annual operating budget; % food purchased vs donated
- [ ] Volunteer hours / year; repack (kit/box) volume
- [ ] Fleet size (# trucks), EV transition status
- [ ] Service area / neighborhoods with highest food insecurity (for the equity-routing demo)

## 4. Quantified problem, per hub theme (draft — tighten with §3 once verified)

- **See It Coming (forecast/procure):** with ~20 inbound trucks/day of volatile donated supply,
  a gap caught late means paying a **premium at the dock** instead of covering it ~2 weeks early.
  *Quantify:* $ premium per late-covered lb × lbs affected.
- **Production is Manufacturing:** volunteer time is the most expensive thing to waste; no-shows
  and unstaged lines burn it. *Quantify:* volunteer-hours lost/week × sessions/year.
- **Equity With a Truck Attached (route — our showcase):** distance-only routing lets perishables
  sit behind shelf-stable and misses agency access windows across **hundreds** of partners.
  *Quantify:* lbs of perishables spoiled/month; % deliveries outside usable access windows.
- **Every Team Member an Analyst:** the distance from a floor question to a data answer is measured
  in weeks. *Quantify:* analyst-request turnaround (weeks → seconds).

## TODO
Run the §3 web fetch (was blocked on a temporarily-unavailable fetch tool) and replace each `[ ]`
with a figure + source URL + access date. Flag anything ACCFB-specific that can't be sourced
publicly as "verify directly with ACCFB supply-chain team."
