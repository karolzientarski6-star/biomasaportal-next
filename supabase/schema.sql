create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  display_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.classified_categories (
  id bigserial primary key,
  wp_term_id bigint unique,
  name text not null,
  slug text not null unique,
  parent_id bigint references public.classified_categories (id),
  created_at timestamptz not null default now()
);

create table if not exists public.classifieds (
  id uuid primary key default gen_random_uuid(),
  wp_post_id bigint unique,
  owner_id uuid references public.profiles (id),
  title text not null,
  slug text not null unique,
  description_html text not null,
  price numeric(12,2),
  location text,
  contact_email text,
  contact_phone text,
  moderation_status text not null default 'pending',
  publication_mode text not null default 'with_account',
  payment_status text not null default 'unpaid',
  featured boolean not null default false,
  featured_until timestamptz,
  expires_at timestamptz,
  views_count integer not null default 0,
  source text not null default 'migration',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classified_category_links (
  classified_id uuid not null references public.classifieds (id) on delete cascade,
  category_id bigint not null references public.classified_categories (id) on delete cascade,
  primary key (classified_id, category_id)
);

create table if not exists public.classified_images (
  id bigserial primary key,
  classified_id uuid not null references public.classifieds (id) on delete cascade,
  storage_path text not null,
  alt text,
  position integer not null default 0
);

create table if not exists public.classified_view_events (
  id bigserial primary key,
  classified_id uuid not null references public.classifieds (id) on delete cascade,
  viewer_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.classified_categories enable row level security;
alter table public.classifieds enable row level security;
alter table public.classified_category_links enable row level security;
alter table public.classified_images enable row level security;
alter table public.classified_view_events enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop policy if exists "public classified categories are readable" on public.classified_categories;
create policy "public classified categories are readable"
on public.classified_categories
for select
to anon, authenticated
using (true);

drop policy if exists "public classifieds are readable" on public.classifieds;
create policy "public classifieds are readable"
on public.classifieds
for select
to anon, authenticated
using (true);

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users manage own classifieds" on public.classifieds;
create policy "users manage own classifieds"
on public.classifieds
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "public category links are readable" on public.classified_category_links;
create policy "public category links are readable"
on public.classified_category_links
for select
to anon, authenticated
using (true);

drop policy if exists "users manage own category links" on public.classified_category_links;
create policy "users manage own category links"
on public.classified_category_links
for all
to authenticated
using (
  exists (
    select 1
    from public.classifieds
    where classifieds.id = classified_category_links.classified_id
      and classifieds.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.classifieds
    where classifieds.id = classified_category_links.classified_id
      and classifieds.owner_id = auth.uid()
  )
);

drop policy if exists "public images are readable" on public.classified_images;
create policy "public images are readable"
on public.classified_images
for select
to anon, authenticated
using (true);

drop policy if exists "users manage own images" on public.classified_images;
create policy "users manage own images"
on public.classified_images
for all
to authenticated
using (
  exists (
    select 1
    from public.classifieds
    where classifieds.id = classified_images.classified_id
      and classifieds.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.classifieds
    where classifieds.id = classified_images.classified_id
      and classifieds.owner_id = auth.uid()
  )
);

drop policy if exists "users insert view events" on public.classified_view_events;
create policy "users insert view events"
on public.classified_view_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "owners view own analytics" on public.classified_view_events;
create policy "owners view own analytics"
on public.classified_view_events
for select
to authenticated
using (
  exists (
    select 1
    from public.classifieds
    where classifieds.id = classified_view_events.classified_id
      and classifieds.owner_id = auth.uid()
  )
);
