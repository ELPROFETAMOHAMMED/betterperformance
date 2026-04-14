create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.wallpapers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null,
  public_url text not null,
  width integer not null,
  height integer not null,
  file_size_bytes bigint,
  resolution text generated always as ((width)::text || 'x' || (height)::text) stored,
  tags text[] default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wallpapers_created_at on public.wallpapers (created_at desc);
create index if not exists idx_wallpapers_tags on public.wallpapers using gin (tags);

drop trigger if exists set_wallpapers_updated_at on public.wallpapers;
create trigger set_wallpapers_updated_at
before update on public.wallpapers
for each row
execute function public.set_updated_at();

alter table public.wallpapers enable row level security;

drop policy if exists "Authenticated users can view wallpapers" on public.wallpapers;
create policy "Authenticated users can view wallpapers"
on public.wallpapers
for select
to authenticated
using (true);

drop policy if exists "Admins can insert wallpapers" on public.wallpapers;
create policy "Admins can insert wallpapers"
on public.wallpapers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can update wallpapers" on public.wallpapers;
create policy "Admins can update wallpapers"
on public.wallpapers
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can delete wallpapers" on public.wallpapers;
create policy "Admins can delete wallpapers"
on public.wallpapers
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

insert into storage.buckets (id, name, public)
values ('wallpapers', 'wallpapers', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "Public can view wallpaper files" on storage.objects;
create policy "Public can view wallpaper files"
on storage.objects
for select
to public
using (bucket_id = 'wallpapers');

drop policy if exists "Admins can upload wallpaper files" on storage.objects;
create policy "Admins can upload wallpaper files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wallpapers'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can update wallpaper files" on storage.objects;
create policy "Admins can update wallpaper files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'wallpapers'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  bucket_id = 'wallpapers'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can delete wallpaper files" on storage.objects;
create policy "Admins can delete wallpaper files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'wallpapers'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
