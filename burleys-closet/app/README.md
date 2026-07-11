# Burley's Closet — App

Inventory and cross-listing system for a vintage men's big & tall resale
business. See [`../plan/software-plan.md`](../plan/software-plan.md) for the
full design and [`../research/`](../research/README.md) for platform research.

## Status: full pipeline built (intake → list → sell → delist → ship → books)

- **Dashboard** — pipeline counts per stage, red banner when a delist is pending
- **Mobile intake form** — acquisition (donated/purchased + COGS), bin-encoded
  SKU generation, required measurements per garment type, six-tier condition
  grading, flaw list, weight capture with Poshmark 5 lb overweight flag,
  policy guardrails (used underwear/socks blocked, cleaned-confirmation gate)
- **Photo pipeline** — camera capture on the item page → HEIC→JPEG, master +
  1:1 eBay crop (1600px) + 3:4 Poshmark portrait crop in Supabase storage
- **AI listing drafts** — Claude vision reads the photos + intake facts and
  drafts title/description/aspects/pricing for both platforms; review/edit UI
- **eBay integration** — OAuth connect (/settings), business-policy and
  ship-from-location setup, category suggestions, one-click publish via the
  Inventory API, order polling every 5 min (Vercel cron), automatic delist of
  eBay when Poshmark sells, tracking upload on ship
- **Poshmark bridge** — Chrome extension (../extension) fills the create-listing
  form (photos included) from the queue; delist task list; sale recording via
  button, extension, or the `/api/poshmark/sale-webhook` email hook
- **Packing queue** — ship-by-sorted, bin locations, packed/shipped flow,
  label cost capture
- **Money** — ledger-backed P&L (month + all-time) against the $20k goal
- **Database schema** — state machine enforced by Postgres triggers (an item
  can never be listed and sold at the same time), delist jobs, ledger, audit log

See "Go-live checklist" below for the env vars and one-time eBay setup.

## Setup

1. Create a Supabase project, then run the migration:
   ```
   supabase link --project-ref <ref>
   supabase db push          # applies supabase/migrations/0001_init.sql
   ```
   (or paste `supabase/migrations/0001_init.sql` into the SQL editor).
2. `cp .env.example .env.local` and fill in the Supabase URL + keys
   (Settings → API in the Supabase dashboard).
3. ```
   npm install
   npm run dev
   ```
4. Open on your phone (same network or deploy to Vercel) and add to home
   screen — the app is a PWA.

## Deploy

Push to a repo connected to Vercel, set the three Supabase env vars in the
Vercel project, done.

## Go-live checklist

1. **Vercel**: import the repo, set root directory to `burleys-closet/app`,
   add env vars: the three Supabase values, `APP_PASSWORD`, `EBAY_CLIENT_ID`,
   `EBAY_CLIENT_SECRET`, `EBAY_RUNAME`, `EBAY_ENV`, `ANTHROPIC_API_KEY`,
   `BRIDGE_SECRET`, `POSHMARK_WEBHOOK_SECRET`, `CRON_SECRET`
   (generate secrets: `openssl rand -hex 24`). The cron in `vercel.json`
   starts polling eBay orders automatically.
2. **eBay developer portal**: in your keyset, set the RuName's
   "Your auth accepted URL" to `https://<app>/api/ebay/callback`; complete the
   marketplace account-deletion subscribe/opt-out (one-time compliance).
3. **eBay Seller Hub**: create business policies (shipping / payment /
   returns) if you haven't — recommended: 1-day handling + 30-day free
   returns (Top Rated Plus).
4. **App /settings**: Connect eBay → Load policies → pick the three → save;
   enter ship-from address (registers your inventory location).
5. **Chrome extension**: load `../extension` unpacked, point it at the app
   URL + `BRIDGE_SECRET`.
6. Start in `EBAY_ENV=sandbox`, publish one test item end-to-end, then flip
   to `production`.

## Key invariants (enforced in `supabase/migrations/0001_init.sql`)

- `items.status` transitions are validated by trigger; illegal jumps throw.
- A listing cannot be `QUEUED`/`ACTIVE` while its item is sold/shipped.
- Every status change is appended to `events` (audit log).
- SKUs are `BIN-###`, generated atomically by the `next_sku()` function.
- All fee percentages live in `src/lib/config/fees.ts` — config, not code.
