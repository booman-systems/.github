-- Key-value settings: eBay OAuth tokens, business policy IDs, merchant
-- location, and other app configuration. Service-role access only (RLS).
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;
