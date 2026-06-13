# Gridiron Match — Football Recruiting Profile Engine

A single self-contained `index.html` app. An athlete enters their **position + combine
measurables**, and the engine projects the **recruiting tier** they currently profile for,
shows a metric-by-metric breakdown, and tells them exactly what to improve to climb.

> Open `index.html` in any browser — no build step, no dependencies.

## What it does

1. **Inputs:** position, height, weight, speed (40-yd dash *or* 100m time), and optional bench/squat.
2. **100m → 40 conversion:** if a 100m time is entered, it's converted to a 40-yd estimate
   using the published reference chart (10.3s → 4.23, … 11.8s → 4.81, interpolated).
3. **Tier projection:** each measurable is compared to position benchmarks across 4 tiers, then
   blended into an overall projection (speed weighted highest):
   - **FBS Power 5**
   - **FBS Group of 5 / High FCS**
   - **Low FCS / High D2 / High NAIA**
   - **Low D2 / NAIA / Division III**
   - *(below all → Developmental / JUCO route)*
4. **Gap analysis:** "How to climb a tier" lists the exact deltas to the next level up.
5. **Context:** position-specific traits recruiters watch + the "more than measurables"
   factors (film, production, competition, coachability, academics).

## Data sources

Benchmarks are transcribed from published position-by-position recruiting references
(height / weight / 40-yd / bench / squat per tier, for QB, RB, WR, TE, OL, DL, LB, DB).
All data lives in the `POS`, `TIERS`, and `CONV` structures at the top of the inline script.

## Named-schools phase (extension point)

V1 recommends a **tier**, not individual programs. The code is structured to plug a real
named-school dataset in later — see the `SCHOOLS` object in `index.html`:

```js
const SCHOOLS = {
  P5:  [{ name:'Example State', conf:'SEC' }, ...],
  G5:  [...], D2H: [...], D3: [...]
};
```

Populate it (optionally key by position/region/academic fit) and the results screen
automatically lists real programs in place of the tier-level guidance placeholder.

## Deploying

Static file — drop it on Vercel, Cloudflare Pages, GitHub Pages, or any static host.
