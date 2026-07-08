# Burley's Closet — Software Plan
### From donated garment to shipped package: the operating system for a $20k/month vintage big & tall resale business

Version 1.0 — July 8, 2026. Built on the four research reports in [`../research/`](../research/README.md).

---

## 1. The goal, translated into operational math

$20k/month revenue at a realistic $35–45 average sale price for vintage big & tall means roughly:

| Metric | Target |
|---|---|
| Sales per month | ~450–570 (≈ 15–19 shipped packages/day) |
| Active listings needed | ~2,000–3,500 (good vintage sells through at ~15–25%/month) |
| New listings per day to sustain | ~25–35 |
| Time budget per item (intake → live on both platforms) | **≤ 5 minutes of human touch time** |

That last number is the design constraint that matters most. Every feature in this plan exists to either (a) push per-item touch time down, (b) prevent the account-killing mistakes (double-sells, late shipments, misgraded items), or (c) make the money legible (profit per item, taxes, what to source more of).

**The software's identity: a conveyor belt with three human touchpoints** — photograph it, approve the AI-drafted listing, pack it. Everything between those points is automated.

---

## 2. Reality checks on the described workflow

Your scenario is right in shape. Four details need adjusting to match how the platforms actually work (all sourced in the research docs):

1. **"Auto upscale photos" → actually auto-*process* photos.** The iPhone 12 Pro Max shoots 12 MP (4032×3024) — already 2.5× larger than eBay's recommended 1600px. No upscaling needed. What IS needed: HEIC→JPEG conversion, auto-crop to **1:1 for eBay** and **3:4 portrait for Poshmark** (their 2025–26 requirement), background cleanup on the cover shot, ordering (cover, back, brand tag, size tag, fabric tag, flaws), and compression under the 12 MB/24-photo eBay and 16-photo Poshmark limits. The software does all of this on upload.

2. **Google Lens → built-in AI vision.** Google Lens has no usable API and means manual app-switching per item. Instead the software sends your photos to a vision model (Claude API) that identifies brand/era/garment type/fabric from the tag photos, drafts the 80-char title, full description, item specifics, and flags authenticity concerns — in one automatic step, tuned with vintage-menswear prompts (union tags, single-stitch, talon zippers, etc.). Pricing suggestions come from eBay sold-comp lookups plus the AI's assessment. You review and edit instead of researching from scratch. (Keep Google Lens as a manual fallback for mystery items.)

3. **"Posted on Poshmark and eBay" happens two different ways.** eBay: fully automatic via official APIs — one click, listing goes live. Poshmark: **no public API exists**; the software pre-fills Poshmark's own listing form through a companion Chrome extension while you're logged in, and you press Publish. This human-in-the-loop design is deliberate — it's how all commercial tools work and it's what keeps your Poshmark account safe (their ToS bans bots; 2025 saw suspension waves).

4. **Sale notification and labels differ per platform.** Poshmark: yes, exactly as you said — email notification with the prepaid label attached; the software reads that email automatically. eBay: better than email — the software gets a **webhook within seconds** of the sale (plus a polling safety net), and the label is *purchased* (through eBay's discounted rates), not free. The moment either platform sells, the software's most important job fires: **delist from the other platform immediately** — because a double-sell cancellation permanently damages your eBay seller standing (only ~2% defect budget/year) and Poshmark restricts accounts over 3% cancellations/90 days.

---

## 3. The workflow as software (stage by stage)

### Stage 1 — Intake (~60 seconds, phone in hand)
On the phone (the app is mobile-first), for each garment:
- Tap **New Item** → acquisition type: `Donated` (COGS $0, donor noted) or `Purchased` (price, source, date). Bulk-lot purchases get a lot cost that the software allocates across items.
- The software assigns a **SKU that encodes the storage bin** (e.g. `B07-013` = bin B07, item 13) and shows it; you write it on a tag or bag.
- Enter tag size + garment type → the app shows **exactly which measurements are required** for that type (pit-to-pit/shoulder/sleeve/length for tops; waist/inseam/rise for bottoms) and won't let the item advance without them.
- **Weigh it** (with packaging estimate). Anything over 5 lb gets auto-flagged: "Poshmark overweight — seller pays $5–10 upgrade; consider eBay-only or price up."
- Guardrails fire here: used underwear/socks blocked (banned both platforms), fur/exotic/current-uniform flags, "properly cleaned" confirmation (eBay requires stating it).

### Stage 2 — Photos (~2 minutes)
- Shoot 8–14 photos in the app (or camera roll import): guided shot list — front, back, brand tag, size tag, fabric tag, each flaw close-up.
- On upload the pipeline automatically: converts HEIC→JPEG, generates the 1:1 (eBay) and 3:4 (Poshmark) crops from one master, removes/neutralizes the cover-shot background, orders the set, compresses to spec.

### Stage 3 — AI listing draft (0 seconds of your time; runs while you shoot the next item)
The vision model + comp engine produce a draft:
- Title (front-loaded: `VTG 90s Carhartt Detroit Jacket Men 3XL Big Tall Blanket Lined USA`), description with auto-inserted measurement block and flaw disclosures, eBay item specifics (Brand, Size, **Size Type = Big & Tall**, Color, Decade, Material — validated against eBay's required-aspects API, including the July 2026 standardized-size enforcement), Poshmark category/size/color mapping, condition tier mapped to both platforms' scales.
- **Price suggestion** from eBay sold comps + condition adjustment, with three numbers: list price, auto-accept offer floor, auto-decline floor. Poshmark price set ~8–15% higher for fee parity (their 20% vs eBay's ~12.35–13.25%).

### Stage 4 — Review & publish (~90 seconds)
- You see the draft side-by-side with photos, fix anything, hit **Publish**.
- eBay: API publishes instantly (Inventory API: item → offer → publish; photos via Media API).
- Poshmark: item lands in a "Ready for Poshmark" queue; at your desk, the Chrome extension fills the form from the queue, you press Poshmark's own Publish button. Batch 20 in ~10 minutes.

### Stage 5 — Live inventory management (automatic)
- Offer automation: auto-decline below floor, auto-accept above threshold, scheduled "send offer to watchers/likers" within each platform's rules.
- Aging engine: price drop suggestions at 30/60 days; at ~6 months stale (no engagement), eBay "end + Sell Similar" for a fresh listing ID. Poshmark refreshes only through sanctioned paths (no bulk delete-relist — that gets accounts suspended).
- Death-pile dashboard: items stuck in `intake`/`photographed` more than N days, daily listing quota tracking.

### Stage 6 — Sale → delist (the critical seconds, fully automatic)
- eBay sale detected via webhook (+ 2-minute polling fallback). Poshmark sale detected via its notification email hitting a software-monitored inbox (+ extension check).
- The instant either fires: item state → `SOLD`, **delist job on the other platform executes** (eBay delist = API call, seconds; Poshmark delist = extension task, alert escalates to your phone until confirmed).
- Push notification to your phone: "SOLD — $42 Carhartt 3XL — Bin B07 — pack by tomorrow."

### Stage 7 — Ship (~3 minutes per package)
- Packing queue sorted by ship-by deadline (eBay handling time = your Top Rated Plus eligibility; Poshmark hard limit 7 days, target 2).
- Poshmark: prepaid label auto-pulled from the notification email, sent to the thermal printer.
- eBay: label bought at eBay's discounted rates (v1: one tap into eBay's label page pre-filled; v2: EasyPost/Shippo API for in-app purchase), tracking auto-uploaded.
- Scan/tap SKU → bin location shown → pack, print, scan out. State → `SHIPPED`.

### Stage 8 — Money & books (automatic)
- Per-item P&L: sale price − platform fee − label − packaging − COGS = net profit, reconciled against eBay's Finances API payouts and Poshmark deposit emails.
- Running dashboards: revenue vs the $20k goal, profit by brand/category/size/source (what to source more of!), sell-through rate, defect/cancellation budget monitors, customer repeat-buyer tracking.
- Year-end: Schedule C-ready export (gross, fees, shipping, COGS). 1099-K threshold is $20k AND 200 transactions federally — you will cross it, so books must be clean from day one.

---

## 4. Architecture & stack

**Principle: boring, managed, serverless — you're running a clothing business, not a server farm.**

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js PWA (mobile-first)          Chrome Extension       │
│  intake · photos · review · queues   Poshmark form-fill,    │
│  dashboards · packing station        delist tasks, sale chk │
└──────────────┬───────────────────────────────┬──────────────┘
               │            Vercel             │
┌──────────────▼───────────────────────────────▼──────────────┐
│  API layer (Next.js routes / server actions)                │
│  ├─ eBay connector: OAuth, Inventory/Fulfillment/Media/     │
│  │    Account/Finances/Taxonomy APIs, order webhooks        │
│  ├─ Email ingest: Gmail API watcher (Poshmark sales,        │
│  │    labels, deposits)                                     │
│  ├─ AI service: Claude API vision → listing drafts,         │
│  │    comps → pricing                                       │
│  ├─ Image pipeline: sharp — HEIC→JPEG, 1:1 + 3:4 crops,     │
│  │    bg cleanup, compression                               │
│  └─ Jobs: order polling, offer automation, aging engine,    │
│     payout reconciliation (Vercel Cron / Supabase cron)     │
└──────────────────────────┬──────────────────────────────────┘
┌──────────────────────────▼──────────────────────────────────┐
│  Supabase                                                   │
│  Postgres (inventory state machine, orders, ledger)         │
│  Storage (photo masters + derivatives)                      │
│  Auth (you + future helpers, role-based)                    │
│  Realtime (live queue/dashboard updates)                    │
└─────────────────────────────────────────────────────────────┘
```

**Stack choices and why:**

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js (React + TypeScript) as a PWA**, Tailwind | One codebase serves the iPhone (camera intake, sale alerts, packing) and the desktop (review, dashboards, Poshmark queue). PWA = no App Store friction; installable on the home screen. |
| Hosting | **Vercel** | Zero-ops deploys, cron jobs, serverless functions for webhooks. (You already have an account.) |
| Database/storage/auth | **Supabase (Postgres)** | Relational integrity for the inventory state machine (this is transactional data — Postgres, not a spreadsheet), built-in file storage for photos, realtime subscriptions for live queues. (You already have an account.) |
| Images | **sharp** in serverless functions | HEIC decode, resize/crop/compress. Cover-shot background removal via a background-removal API or model. |
| AI | **Claude API (vision + text)** | Garment ID, title/description drafting, condition-language generation, price reasoning. |
| eBay | **Official Sell APIs** (Inventory, Fulfillment, Media, Account, Taxonomy, Finances) + order webhooks | Full automation, zero ToS risk. Sandbox first. |
| Poshmark | **Companion Chrome extension** (form pre-fill, delist tasks, human-speed, human-present) | Only viable path — no public API. Mirrors how Vendoo/List Perfectly work; conservative by design. |
| Sale email ingest | **Gmail API** watcher on a dedicated address | Poshmark's sale notification + prepaid label + deposit emails become structured events. |
| Labels | Phase 1: eBay UI deep-link + Poshmark email labels. Phase 2: **EasyPost or Shippo API** | Start simple; add in-app label purchase when volume justifies it. |
| Printing | Thermal printer (Rollo/Zebra) via print dialog; later PrintNode for one-tap | Standard reseller station hardware. |
| Alerts | Web push + email; SMS (Twilio) for DELIST-NOW escalations | The delist alert must be impossible to miss. |

**Hardware shopping list (non-software but required):** thermal label printer (~$180), shipping scale (~$30), poly mailers in 3 sizes + a few box sizes, garment rack/bins with printed bin labels, phone tripod + neutral backdrop or mannequin.

---

## 5. Data model (core tables)

```
items          sku (PK, encodes bin), status*, acquisition{type, cost, source, date},
               brand, garment_type, tag_size, size_type, measurements(jsonb),
               condition_grade, flaws[](type, location, photo_ref),
               weight_oz, over_5lb_flag, cleaned_confirmed, era/decade, material,
               cogs_allocated, created_at
photos         item_sku, master_url, ebay_crop_url, posh_crop_url, kind(cover/tag/flaw/...), sort
listings       item_sku, platform(ebay|poshmark), external_id, title, description,
               price, offer_floor, auto_accept, specifics(jsonb), state, listed_at, ended_at
orders         platform, external_order_id, item_sku, buyer_ref, sale_price, fees,
               label_cost, tax, sold_at, ship_by, shipped_at, tracking, state
delist_jobs    order_id, target_platform, created_at, confirmed_at, escalation_level
ledger         entry per money event (sale, fee, label, refund, payout) → Schedule C export
buyers         platform handle/hash, purchase history, sizes bought (repeat-buyer + bundle targeting)
events         append-only audit log of every state transition
```

`items.status` is a **strict state machine** — the heart of the system:

```
INTAKE → PHOTOGRAPHED → DRAFTED → REVIEW → LISTED_EBAY / LISTED_POSH / LISTED_BOTH
      → SOLD_PENDING_DELIST → SOLD → PACKED → SHIPPED → COMPLETE
      (→ RETURN_OPEN → RETURNED/RESOLVED)   (→ DONATED_OUT / LIQUIDATED)
```

Invariant enforced at the database level: an item can never be `active` on platform B while `sold/pending` on platform A.

---

## 6. Guardrails the software enforces (account protection)

- **Never cancel as out-of-stock on eBay** — the UI literally won't offer it; double-sell playbook guides the Poshmark buyer-requested-cancel script instead.
- Poshmark actions only at human speed, human present, rate-limited; no auto-share/like/follow bots; no bulk delete-relist.
- Ship-by countdown timers with escalating alerts (late shipments burn eBay Top Rated status).
- Return-request SLA timers (eBay: respond in 3 business days, refund in 2 after delivery — misses become defects).
- Defect/cancellation budget dashboard: live view of eBay defect rate vs the 0.5%/2% thresholds and Poshmark cancels vs 3%/90-days.
- All fee percentages, label rates, and thresholds stored as **config, not code** — platforms change these yearly.
- eBay developer compliance: account-deletion notification endpoint handled before first production call.

---

## 7. Build roadmap

**Phase 0 — Foundations (week 1)**
Repo, Supabase schema + state machine, Vercel deploy, eBay developer account + sandbox keys, OAuth flow stored, dedicated Gmail for platform emails, hardware ordered.

**Phase 1 — Inventory + intake + photos (weeks 2–3)** → *usable immediately as your inventory system*
Mobile intake flow (SKU/bin, COGS, measurements-by-garment-type, weight flagging, guardrails), photo upload pipeline with dual crops, item browser & death-pile view.

**Phase 2 — AI drafting + eBay publishing (weeks 4–6)** → *listing machine live; start listing to eBay for real*
Claude vision drafts, comps + pricing suggestions, eBay Taxonomy/aspect validation, one-click eBay publish (sandbox → production), review UI.

**Phase 3 — Poshmark assist + sale sync (weeks 7–9)** → *the tandem system — most valuable phase*
Chrome extension (form pre-fill from queue, delist tasks), Gmail ingest of Poshmark sale/label emails, eBay order webhooks + polling, delist engine with phone escalation, packing queue + label printing.

**Phase 4 — Money & optimization (weeks 10–12)**
Ledger + payout reconciliation (eBay Finances API + Poshmark deposit emails), P&L dashboards by brand/size/source, offer automation, aging/markdown engine, buyer/repeat-customer tracking, Schedule C export.

**Phase 5 — Scale features (ongoing, driven by real usage)**
In-app eBay label purchase (EasyPost/Shippo), eBay Promoted Listings automation (2–3% ad rate), eBay International Shipping enablement, bundle tooling for Poshmark, possibly Mercari/Depop as third channels once the two-platform loop is solid.

**You can start making money at the end of Phase 2** — eBay-only with a fast listing machine — while Phases 3–4 build out the tandem and the books.

---

## 8. Running costs (estimate)

| Item | Monthly |
|---|---|
| Vercel + Supabase (hobby/pro tiers at this scale) | $0–45 |
| Claude API (vision drafts, ~1,000 items/mo) | $15–50 |
| Background-removal API | $10–30 |
| Twilio SMS alerts | ~$5 |
| eBay Basic Store (worth it past 250 listings: FVF discount + Terapeak + markdown events) | $21.95 |
| **Software total** | **~$50–150/mo** |

(Compare: Vendoo at your volume ≈ $70–100/mo with add-ons, metered, and it still wouldn't do your intake, measurements, accounting, or big & tall logic.)

---

## 9. Open decisions (defaults chosen; change any of them)

1. **Poshmark automation posture** — Default: conservative human-in-the-loop extension (recommended). Alternative: more aggressive automation exists but risks the account.
2. **Background removal** — Default: neutral cleanup only. Alternative: full white-background product shots (slower, prettier).
3. **eBay return policy** — Default: 30-day free returns + 1-day handling to chase Top Rated Plus (10% fee discount + search boost). Alternative: buyer-paid returns (fewer returns, worse placement).
4. **Label purchasing** — Default: Phase 1 uses eBay's own label flow (best rates, auto-tracking); in-app via EasyPost later.
5. **Third marketplace** — Not now. Nail the two-platform loop first; the architecture leaves room for Mercari (has an API story) as channel #3.
