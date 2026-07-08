# Burley's Closet — App

Inventory and cross-listing system for a vintage men's big & tall resale
business. See [`../plan/software-plan.md`](../plan/software-plan.md) for the
full design and [`../research/`](../research/README.md) for platform research.

## Status: Phase 1 (inventory + intake + photo pipeline)

Working now:
- **Dashboard** — pipeline counts per stage, red banner when a delist is pending
- **Mobile intake form** — acquisition (donated/purchased + COGS), bin-encoded
  SKU generation, required measurements per garment type, six-tier condition
  grading, flaw list, weight capture with Poshmark 5 lb overweight flag,
  policy guardrails (used underwear/socks blocked, cleaned-confirmation gate)
- **Photo pipeline** — `POST /api/photos/process`: HEIC→JPEG, master + 1:1
  eBay crop (1600px) + 3:4 Poshmark portrait crop, stored in Supabase storage
- **Database schema** — full state machine enforced by Postgres triggers
  (an item can never be listed and sold at the same time), delist-job table,
  money ledger, event audit log

Not yet built (next phases): photo capture UI, AI listing drafts, eBay API
publishing, Poshmark extension, sale sync, packing queue, dashboards.

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

## Key invariants (enforced in `supabase/migrations/0001_init.sql`)

- `items.status` transitions are validated by trigger; illegal jumps throw.
- A listing cannot be `QUEUED`/`ACTIVE` while its item is sold/shipped.
- Every status change is appended to `events` (audit log).
- SKUs are `BIN-###`, generated atomically by the `next_sku()` function.
- All fee percentages live in `src/lib/config/fees.ts` — config, not code.
