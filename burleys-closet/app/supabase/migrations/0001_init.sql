-- Burley's Closet — initial schema
-- The inventory state machine is enforced here, not just in app code:
-- a bug in the UI must never be able to double-sell an item.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────

create type item_status as enum (
  'INTAKE',              -- entered, needs photos
  'PHOTOGRAPHED',        -- photos processed, awaiting AI draft
  'DRAFTED',             -- AI draft ready, awaiting human review
  'REVIEW',              -- human reviewing/editing
  'LISTED',              -- live on >=1 platform (see listings table for where)
  'SOLD_PENDING_DELIST', -- sold on one platform, delist job open on the other
  'SOLD',                -- sold, all other listings confirmed down
  'PACKED',              -- packaged, label printed
  'SHIPPED',             -- carrier acceptance
  'COMPLETE',            -- delivered/funds released
  'RETURN_OPEN',         -- buyer opened a return case
  'RETURNED',            -- item back in hand (may relist -> INTAKE)
  'DONATED_OUT',         -- exited inventory without sale
  'LIQUIDATED'           -- bulk-sold/scrapped
);

create type acquisition_type as enum ('DONATED', 'PURCHASED');

create type garment_type as enum (
  'TSHIRT', 'CASUAL_SHIRT', 'DRESS_SHIRT', 'POLO', 'SWEATER', 'SWEATSHIRT_HOODIE',
  'JACKET_COAT', 'VEST', 'SUIT_JACKET_BLAZER', 'SUIT',
  'JEANS', 'PANTS', 'SHORTS', 'OVERALLS_COVERALLS',
  'HAT', 'BELT', 'OTHER_ACCESSORY'
);

-- eBay's six condition values for clothing (Feb 2025 scheme). Poshmark's
-- condition selector maps from these in app code.
create type condition_grade as enum (
  'NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'NEW_WITH_IMPERFECTIONS',
  'PREOWNED_EXCELLENT', 'PREOWNED_GOOD', 'PREOWNED_FAIR'
);

create type size_type as enum ('REGULAR', 'BIG_AND_TALL', 'TALL');

create type platform as enum ('EBAY', 'POSHMARK');

create type listing_state as enum (
  'QUEUED',      -- ready to publish (Poshmark: waiting for extension session)
  'ACTIVE',      -- live
  'ENDED',       -- ended without sale (stale refresh, manual end)
  'SOLD',        -- sold on this platform
  'DELISTED'     -- pulled because it sold on the other platform
);

create type order_state as enum (
  'NEW', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETE',
  'RETURN_OPEN', 'REFUNDED', 'CANCELLED_BUYER', 'CANCELLED_SELLER'
);

create type ledger_kind as enum (
  'SALE', 'PLATFORM_FEE', 'SHIPPING_LABEL', 'SHIPPING_UPGRADE', 'PACKAGING',
  'COGS', 'REFUND', 'PAYOUT', 'AD_FEE', 'SUBSCRIPTION', 'SUPPLY', 'OTHER'
);

-- ── Bins (physical storage) ──────────────────────────────────────────────

create table bins (
  code text primary key,                    -- e.g. 'B07'
  description text,
  next_seq integer not null default 1,      -- feeds SKU generation
  created_at timestamptz not null default now()
);

-- ── Items ────────────────────────────────────────────────────────────────

create table items (
  sku text primary key,                     -- 'B07-013' — encodes bin + seq
  bin_code text not null references bins(code),
  status item_status not null default 'INTAKE',

  -- acquisition
  acquisition acquisition_type not null,
  acquisition_cost_cents integer not null default 0
    check (acquisition_cost_cents >= 0),    -- 0 for donations
  acquisition_source text,                  -- donor name / store / estate sale
  acquired_on date not null default current_date,
  lot_id uuid,                              -- groups items bought as one lot

  -- garment facts
  brand text,
  garment_type garment_type not null,
  department text not null default 'Men',
  tag_size text,                            -- what the label says
  standard_size text,                       -- eBay standardized value (2XL, 3XLT...)
  size_type size_type not null default 'BIG_AND_TALL',
  color text,
  material text,
  decade text,                              -- '1990s', '1980s', 'Y2K', null = not vintage
  country_of_origin text,
  measurements jsonb not null default '{}', -- keys validated in app by garment type
  condition condition_grade,
  flaws jsonb not null default '[]',        -- [{type, location, note, photo_index}]
  cleaned_confirmed boolean not null default false, -- eBay used-clothing policy
  authenticity_flag boolean not null default false, -- needs review (hype brands, fur, etc.)

  -- shipping inputs
  weight_oz integer,                        -- packed weight estimate
  over_poshmark_limit boolean generated always as (weight_oz > 80) stored,

  -- money snapshot (denormalized for quick P&L; ledger is source of truth)
  sold_platform platform,
  sold_price_cents integer,
  net_profit_cents integer,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_status_idx on items(status);
create index items_brand_idx on items(brand);

-- ── Photos ───────────────────────────────────────────────────────────────

create table photos (
  id uuid primary key default gen_random_uuid(),
  item_sku text not null references items(sku) on delete cascade,
  kind text not null default 'detail',      -- cover|back|brand_tag|size_tag|fabric_tag|flaw|detail
  sort integer not null default 0,
  master_path text not null,                -- storage path, original (largest) JPEG
  ebay_path text,                           -- 1:1 crop, <=1600px
  poshmark_path text,                       -- 3:4 crop
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index photos_item_idx on photos(item_sku);

-- ── Listings (one row per platform per item) ─────────────────────────────

create table listings (
  id uuid primary key default gen_random_uuid(),
  item_sku text not null references items(sku) on delete cascade,
  platform platform not null,
  state listing_state not null default 'QUEUED',
  external_id text,                         -- eBay listing ID / Poshmark listing URL slug
  title text not null,
  description text,
  specifics jsonb not null default '{}',    -- eBay aspects / Poshmark category+color+size
  price_cents integer not null check (price_cents > 0),
  offer_floor_cents integer,                -- auto-decline below this
  auto_accept_cents integer,                -- auto-accept at/above this
  price_last_changed_at timestamptz not null default now(), -- 14-day markdown eligibility
  listed_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (item_sku, platform)
);

create index listings_state_idx on listings(state);

-- ── Orders ───────────────────────────────────────────────────────────────

create table orders (
  id uuid primary key default gen_random_uuid(),
  platform platform not null,
  external_order_id text not null,
  item_sku text not null references items(sku),
  state order_state not null default 'NEW',
  sale_price_cents integer not null,
  shipping_charged_cents integer not null default 0,
  tax_cents integer not null default 0,
  platform_fee_cents integer,
  label_cost_cents integer,
  buyer_handle text,                        -- platform username (repeat-buyer tracking)
  ship_by timestamptz,                      -- drives packing-queue urgency
  sold_at timestamptz not null default now(),
  shipped_at timestamptz,
  tracking_number text,
  carrier text,
  created_at timestamptz not null default now(),
  unique (platform, external_order_id)
);

create index orders_state_idx on orders(state);
create index orders_ship_by_idx on orders(ship_by);

-- ── Delist jobs (the double-sell firewall) ───────────────────────────────

create table delist_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  item_sku text not null references items(sku),
  target_platform platform not null,        -- where the item must come DOWN
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,                 -- null = STILL AT RISK, keep alarming
  escalation_level integer not null default 0
);

create index delist_jobs_open_idx on delist_jobs(confirmed_at) where confirmed_at is null;

-- ── Ledger (money source of truth; Schedule C rolls up from here) ────────

create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  kind ledger_kind not null,
  amount_cents integer not null,            -- positive = money in, negative = out
  platform platform,
  item_sku text references items(sku),
  order_id uuid references orders(id),
  occurred_on date not null default current_date,
  memo text,
  created_at timestamptz not null default now()
);

create index ledger_occurred_idx on ledger_entries(occurred_on);

-- ── Events (append-only audit of every state transition) ─────────────────

create table events (
  id bigint generated always as identity primary key,
  item_sku text references items(sku),
  entity text not null,                     -- 'item' | 'listing' | 'order' | 'delist_job'
  entity_id text not null,
  from_state text,
  to_state text,
  actor text not null default 'system',
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ── State machine enforcement ────────────────────────────────────────────

create or replace function validate_item_transition()
returns trigger language plpgsql as $$
declare
  allowed boolean := false;
begin
  if old.status = new.status then
    return new;
  end if;

  allowed := case old.status
    when 'INTAKE'              then new.status in ('PHOTOGRAPHED','DONATED_OUT','LIQUIDATED')
    when 'PHOTOGRAPHED'        then new.status in ('DRAFTED','INTAKE','DONATED_OUT','LIQUIDATED')
    when 'DRAFTED'             then new.status in ('REVIEW','PHOTOGRAPHED')
    when 'REVIEW'              then new.status in ('LISTED','DRAFTED','PHOTOGRAPHED')
    when 'LISTED'              then new.status in ('SOLD_PENDING_DELIST','SOLD','REVIEW','DONATED_OUT','LIQUIDATED')
    when 'SOLD_PENDING_DELIST' then new.status in ('SOLD')
    when 'SOLD'                then new.status in ('PACKED','RETURN_OPEN')
    when 'PACKED'              then new.status in ('SHIPPED','SOLD')
    when 'SHIPPED'             then new.status in ('COMPLETE','RETURN_OPEN')
    when 'COMPLETE'            then new.status in ('RETURN_OPEN')
    when 'RETURN_OPEN'         then new.status in ('RETURNED','COMPLETE')
    when 'RETURNED'            then new.status in ('INTAKE','DONATED_OUT','LIQUIDATED')
    else false
  end;

  if not allowed then
    raise exception 'Illegal item transition % -> % for %', old.status, new.status, old.sku;
  end if;

  new.updated_at := now();

  insert into events (item_sku, entity, entity_id, from_state, to_state)
  values (old.sku, 'item', old.sku, old.status::text, new.status::text);

  return new;
end $$;

create trigger items_transition
  before update of status on items
  for each row execute function validate_item_transition();

-- An item may never have an ACTIVE/QUEUED listing while sold/shipped.
create or replace function forbid_active_listing_when_sold()
returns trigger language plpgsql as $$
declare
  s item_status;
begin
  select status into s from items where sku = new.item_sku;
  if new.state in ('QUEUED','ACTIVE')
     and s in ('SOLD_PENDING_DELIST','SOLD','PACKED','SHIPPED','COMPLETE') then
    raise exception 'Item % is % — cannot have % listing on %',
      new.item_sku, s, new.state, new.platform;
  end if;
  return new;
end $$;

create trigger listings_guard
  before insert or update on listings
  for each row execute function forbid_active_listing_when_sold();

-- ── SKU generation ───────────────────────────────────────────────────────

create or replace function next_sku(p_bin text)
returns text language plpgsql as $$
declare
  seq integer;
begin
  insert into bins (code) values (p_bin)
    on conflict (code) do nothing;
  update bins set next_seq = next_seq + 1
    where code = p_bin
    returning next_seq - 1 into seq;
  return p_bin || '-' || lpad(seq::text, 3, '0');
end $$;

-- ── Storage bucket for photos (private; served via signed URLs) ──────────

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false)
on conflict (id) do nothing;
