-- Lights Out articles table for live Supabase publishing
-- Run this in the Supabase SQL editor

create table if not exists public.articles (
  id text primary key,
  title text not null,
  subtitle text,
  description text,
  author_name text not null default 'Lights Out Team',
  author_pic text not null default 'assets/images/authors/eya-amri.jpg',
  author_section text,
  category text not null default 'news',
  image text not null default 'assets/images/intro.png',
  seo_tags text,
  tags text,
  published_at timestamptz not null default now(),
  content text not null default ''
);

create index if not exists idx_articles_published_at
on public.articles (published_at desc);

alter table public.articles enable row level security;

create policy "Public read access"
on public.articles for select
to public
using (true);

create policy "Public insert access"
on public.articles for insert
to public
with check (true);

create policy "Public update access"
on public.articles for update
to public
using (true)
with check (true);

create policy "Public delete access"
on public.articles for delete
to public
using (true);
