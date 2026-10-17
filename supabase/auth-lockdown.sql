-- Run once in the Supabase SQL editor (Project → SQL Editor → New query),
-- AFTER you have created the admin user and turned off sign-ups
-- (see "Authentication" in the README).
--
-- Why this exists: the anon key is shipped to every browser, so the login page
-- on its own only hides the UI — anyone could still query the jobs/companies
-- tables straight through Supabase's REST API. This makes the database itself
-- refuse anyone who isn't signed in.
--
--   jobs, companies  Every existing policy is dropped and replaced with
--                    "signed-in users only", limited to what the app actually
--                    does (read/add/update jobs, read/add companies).
--   subscribers      Table privileges are also revoked from anon and
--                    authenticated, so the email list is reachable only with
--                    the server-side service-role key, which the app uses solely
--                    behind the admin check in /admin/subscribers.
--
-- Safe to re-run. If you have other tables the anon key can reach, lock them
-- down the same way.

do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public' and tablename in ('jobs', 'companies')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table public.jobs enable row level security;
alter table public.companies enable row level security;

revoke all on public.jobs, public.companies from anon, authenticated;
grant select, insert, update on public.jobs to authenticated;
grant select, insert on public.companies to authenticated;

create policy "Signed-in users can read jobs"
  on public.jobs for select to authenticated using (true);
create policy "Signed-in users can add jobs"
  on public.jobs for insert to authenticated with check (true);
create policy "Signed-in users can update jobs"
  on public.jobs for update to authenticated using (true) with check (true);

create policy "Signed-in users can read companies"
  on public.companies for select to authenticated using (true);
create policy "Signed-in users can add companies"
  on public.companies for insert to authenticated with check (true);

-- Email list: service role only (RLS stays on, still no policies).
alter table public.subscribers enable row level security;
revoke all on public.subscribers from anon, authenticated;
