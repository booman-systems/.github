-- Lock all tables to the service role only. The app is server-side and uses
-- the service key (which bypasses RLS); the anon/publishable key gets no
-- access. When user auth is added later, add explicit policies per role.
alter table public.bins enable row level security;
alter table public.items enable row level security;
alter table public.photos enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;
alter table public.delist_jobs enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.events enable row level security;
