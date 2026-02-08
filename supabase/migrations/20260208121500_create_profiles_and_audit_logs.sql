create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text not null unique,
  phone text unique,
  name text,
  date_of_birth date,
  avatar_url text,
  username text,
  interested_courses text,
  role text not null default 'student',
  total_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('student', 'teacher', 'admin'))
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_clerk_user_id_idx on public.profiles (clerk_user_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  performed_by_admin_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_target_user_id_idx on public.audit_logs (target_user_id);
create index if not exists audit_logs_performed_by_admin_id_idx on public.audit_logs (performed_by_admin_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where clerk_user_id = auth.jwt() ->> 'sub'
      and role = 'admin'
  );
$$;

create or replace function public.seed_admin_if_none(
  p_clerk_user_id text,
  p_expected_admin_email text,
  p_user_email text
)
returns boolean
language plpgsql
security definer
as $$
declare
  admin_exists boolean;
  target_profile_id uuid;
begin
  select exists(select 1 from public.profiles where role = 'admin')
    into admin_exists;

  if admin_exists then
    return false;
  end if;

  if p_user_email is null
     or p_expected_admin_email is null
     or lower(p_user_email) <> lower(p_expected_admin_email) then
    return false;
  end if;

  update public.profiles
  set role = 'admin'
  where clerk_user_id = p_clerk_user_id
  returning id into target_profile_id;

  if target_profile_id is null then
    return false;
  end if;

  insert into public.audit_logs (action, target_user_id, performed_by_admin_id)
  values ('seed_admin', target_profile_id, target_profile_id);

  return true;
end;
$$;

alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_self"
  on public.profiles
  for select
  using (clerk_user_id = auth.jwt() ->> 'sub');

create policy "profiles_select_admin"
  on public.profiles
  for select
  using (public.is_admin());

create policy "audit_logs_select_admin"
  on public.audit_logs
  for select
  using (public.is_admin());
