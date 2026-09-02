-- Run this in Supabase SQL Editor
-- These policies allow the public anon key to insert/read articles for the site

alter table public.articles enable row level security;

create policy if not exists "Allow public read"
on public.articles for select
to public
using (true);

create policy if not exists "Allow public insert"
on public.articles for insert
to public
with check (true);

create policy if not exists "Allow public update"
on public.articles for update
to public
using (true)
with check (true);

create policy if not exists "Allow public delete"
on public.articles for delete
to public
using (true);
