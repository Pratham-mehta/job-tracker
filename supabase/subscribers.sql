-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Creates the table that backs the daily job-alert email subscription.
--
-- RLS is enabled with NO policies, so the public anon key (used everywhere
-- else in this app) cannot read or write this table at all. Only the
-- server-side SUPABASE_SERVICE_ROLE_KEY (used in the /api/subscribe,
-- /api/unsubscribe and /api/daily-digest routes) can touch it, since the
-- service role bypasses RLS. This keeps subscriber emails private even
-- though the rest of the app is fully public/no-auth.

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  unsubscribe_token uuid not null default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table subscribers enable row level security;
-- Intentionally no policies added: only the service role key can access this table.
