create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  grade_range text not null,
  age_range text,
  capacity integer not null check (capacity >= 0),
  size_tag text,
  benefit_tags text[] not null default '{}',
  short_description text,
  long_description text,
  fee_cents integer,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists classes_grade_range_idx on public.classes (grade_range);

drop trigger if exists set_classes_updated_at on public.classes;
create trigger set_classes_updated_at
before update on public.classes
for each row execute procedure public.set_updated_at();

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where clerk_user_id = auth.jwt() ->> 'sub'
      and role in ('teacher', 'admin')
  );
$$;

create or replace function public.profile_id()
returns uuid
language sql
stable
as $$
  select id
  from public.profiles
  where clerk_user_id = auth.jwt() ->> 'sub'
  limit 1;
$$;

create table if not exists public.class_requests (
  id uuid primary key default gen_random_uuid(),
  grade_range text not null,
  subject text not null,
  details text,
  preferred_class_size integer not null check (preferred_class_size between 1 and 10),
  created_by uuid not null default public.profile_id() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists class_requests_grade_range_idx on public.class_requests (grade_range);
create index if not exists class_requests_created_by_idx on public.class_requests (created_by);

alter table public.classes enable row level security;
alter table public.class_requests enable row level security;

create policy "classes_select_public"
  on public.classes
  for select
  using (true);

create policy "classes_write_staff"
  on public.classes
  for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "class_requests_insert_self"
  on public.class_requests
  for insert
  with check (created_by = public.profile_id());

create policy "class_requests_select_self"
  on public.class_requests
  for select
  using (created_by = public.profile_id());

create policy "class_requests_select_staff"
  on public.class_requests
  for select
  using (public.is_staff());
