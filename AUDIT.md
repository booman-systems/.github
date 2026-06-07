# BOOMAN SYSTEMS — STANDING AUDIT LOG
Last updated: 2026-06-07
Audit branch: `claude/booman-systems-audit-bo1s3`

---

## AUDIT ROUND 1 — 2026-06-07

---

### 1. modeos130/130-mode-v3

#### 1A. Admin field consolidation — `is_admin` vs `role = 'admin'`
- **Finding:** Two redundant admin fields exist: `is_admin` (boolean) and `role` (text = 'admin'). The canonical check `isAdminProfile()` in `utils/adminAccess.ts` already checks both via `profile?.is_admin || profile?.role === 'admin'`. However, two outliers checked only `role`:
  - `utils/adminRole.ts` — returned raw `role` string instead of using `isAdminProfile()`
  - `app/api/splits/invite/route.ts` — had inline role-only check
  - `app/AuthContext.tsx` — had redundant double-check `isAdmin || Boolean(profile?.is_admin)` where `isAdmin` already included `is_admin`
- **Fix applied:** ✅ 2026-06-07 — `utils/adminRole.ts` updated to check both fields; `splits/invite` updated to use `requireAdmin` from `utils/requireAdmin.ts`; `AuthContext.tsx` simplified.
- **DB data:** Not changed. Only code-level reads standardized.

#### 1B. Supabase `.error` check audit
- **Finding:** Multiple `supabase.from()` calls missing error handling:
  - `app/api/webhooks/stripe/route.ts` — ~10 DB writes (profile upserts, credits, purchases, split_transfers) had no error check; silent failures could cause subscription desync
  - `app/api/secure-download/route.ts` — track lookup queries and download log inserts missing error checks
  - `app/api/checkout/beat/route.ts` — 2 missing checks (purchases insert, second products select)
  - `app/api/create-checkout-session/route.ts` — 2 missing checks (products selects in cart mapping)
  - `app/api/splits/onboard/route.ts` — 1 missing check (product_splits update)
  - `app/api/splits/verify/route.ts` — 2 missing checks (products and inviter profile selects)
  - `app/api/free-download/route.ts` — 1 missing check (products select)
- **Fix applied:** ✅ 2026-06-07 — Error destructuring and handling added to all critical paths in the commit to `claude/booman-systems-audit-bo1s3`.

#### 1C. `app/not-found.tsx`
- **Finding:** Already exists with proper 404 styling. ✅ No action needed.

#### 1D. Stripe webhook `constructEvent` order
- **Finding:** `app/api/webhooks/stripe/route.ts` correctly calls `req.text()` first (raw body), then `stripe.webhooks.constructEvent()` before any business logic. ✅ No action needed.

#### 1E. React Error Boundaries — player and checkout
- **Finding:** `components/player/StickyAudioPlayer.tsx` and checkout components had no error boundary wrapper. An unhandled render error in the player would crash the full page.
- **Fix applied:** ✅ 2026-06-07 — `PlayerErrorBoundary` class component added to `StickyAudioPlayer.tsx`.

---

### 2. modeos130/spinbookdj

#### 2A. Supabase `.error` check audit
- **Finding:** 7 API routes missing error checks:
  - `app/api/account/delete/route.ts` — auth error unchecked; both anonymization updates unchecked; returns `success: true` on DB failure
  - `app/api/account/export/route.ts` — all 4 parallel queries (Promise.all) missing error checks; exports null on DB failure
  - `app/api/onboarding/complete/route.ts` — completion update discarded; returns `success: true` on DB failure
  - `app/api/onboarding/check-slug/route.ts` — query error unchecked; returns `{ available: true }` when DB is down
  - `app/api/client/magic-link/route.ts` — 4 admin queries + insert missing error checks
  - `app/api/calendar/feed/[token]/route.ts` — 2 admin queries missing error checks
  - `app/api/calendar/export/route.ts` — bookings query missing error check
- **Fix applied:** ✅ 2026-06-07 — All 7 files patched in one commit to `claude/booman-systems-audit-bo1s3`.

#### 2B. Storage bucket SELECT policies — `dj-avatars`, `dj-heroes`, `dj-mix-covers`
- **Finding:** `.list()` is NOT called anywhere in the codebase (only `.upload()` and `.getPublicUrl()` are used in `components/ui/FileUpload.tsx`). Storage policies are not tracked in migration files (applied via Supabase dashboard). Listing permission is not exercised by app code.
- **Action:** No listing permission needs to be removed from code. Recommend verifying dashboard policies directly and removing SELECT FOR LISTING if present.
- **Status:** ⚠️ OPEN — Requires Supabase dashboard review (policies not in version-controlled migrations).

#### 2C. Duplicate permissive policies (55 hits)
- **Finding:** RLS policies are not defined in any migration file (only 1 migration file exists: `phase_1c_bookings_and_subs.sql`, which contains no `CREATE POLICY` statements). All 55 policy hits exist in the live DB but were applied outside version control.
- **Action:** Requires running `SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE permissive = 'PERMISSIVE' ORDER BY tablename, cmd, policyname;` against the live DB to identify duplicates, then merging them.
- **Status:** ⚠️ OPEN — Cannot be resolved from code alone; requires Supabase SQL execution.

#### 2D. `app/not-found.tsx`
- **Finding:** Already exists with proper 404 page. ✅ No action needed.

---

### 3. modeos130/sondex.fm

#### 3A. Vercel production deployment status
- **Finding:** Production is READY on deployment `dpl_C2jgLEWtAvM6xtTTrCjxriwVs5rW` (SHA `93b9004`, commit "docs: add readiness audit and harden launch gate"). There are two more recent READY preview deployments from SHA `ca23474e` ("chore: complete phase 1 emergency repairs") that were not promoted to production. GitHub main is at `71f1da99` (older than both). Production is healthy — no action taken.
- **Status:** ✅ Production READY. Note: main branch appears rolled back relative to production deployment SHA. Recommend reconciling git history.

#### 3B. Supabase `.error` check audit
- **Finding:**
  - `app/api/stripe/webhook/route.ts` — 4 DB writes (upsert on checkout complete, select+update on subscription.updated, update on subscription.deleted, update on invoice.payment_failed) missing error checks. Silent failures cause subscription state desync.
  - `app/api/stats/route.ts` — fallback genre query didn't destructure `error`; produced empty genre counts silently on DB failure.
- **Fix applied:** ✅ 2026-06-07 — Both files patched in commit `f5237ef0` to `claude/booman-systems-audit-bo1s3`.

#### 3C. Stripe webhook `constructEvent` order
- **Finding:** `app/api/stripe/webhook/route.ts` correctly uses `req.text()` before `constructEvent` before any business logic. ✅ No action needed.

#### 3D. `app/not-found.tsx`
- **Finding:** Already exists with styled 404 page and vibe search chips. ✅ No action needed.

---

### 4. invoice-gen (ihateinvoices)

- **Status:** ⛔ BLOCKED — Repository not accessible in this session (not in allowed repo list). The following items are PENDING for a future audit session:
  - Stripe webhook signature verification order
  - Post-login redirect loop guard (`/dashboard` redirect from `/login`)
  - Supabase `.error` check audit
  - `app/not-found.tsx` existence check

---

## OPEN ITEMS

| # | Repo | Item | Priority | Status |
|---|------|------|----------|--------|
| 1 | spinbookdj | Storage bucket SELECT listing policies — verify and remove from Supabase dashboard | MEDIUM | OPEN |
| 2 | spinbookdj | 55 duplicate permissive RLS policies — enumerate via `pg_policies` and merge | HIGH | OPEN |
| 3 | sondex.fm | Main branch rolled back behind production SHA — reconcile git history | LOW | OPEN |
| 4 | invoice-gen | Full audit (webhook, login loop, .error, not-found) | HIGH | BLOCKED (no repo access) |

## RESOLVED ITEMS

| Date | Repo | Item |
|------|------|------|
| 2026-06-07 | 130-mode-v3 | Admin field consolidation (is_admin + role → single canonical check) |
| 2026-06-07 | 130-mode-v3 | Supabase .error checks in stripe webhook, secure-download, checkout/beat, create-checkout-session, splits/onboard, splits/verify, free-download |
| 2026-06-07 | 130-mode-v3 | React Error Boundary added to StickyAudioPlayer |
| 2026-06-07 | spinbookdj | Supabase .error checks in account/delete, account/export, onboarding/complete, onboarding/check-slug, client/magic-link, calendar/feed, calendar/export |
| 2026-06-07 | sondex.fm | Supabase .error checks in stripe webhook (subscription desync risk) and stats fallback query |
