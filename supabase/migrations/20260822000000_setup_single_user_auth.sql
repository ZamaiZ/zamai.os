create table public.users (
  id          uuid        primary key references auth.users(id) on delete cascade,
  name        text        not null check (char_length(name) between 2 and 100),
  email       text        not null check (char_length(email) between 3 and 254),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index users_email_normalized_idx
  on public.users (lower(email));

alter table public.users enable row level security;

create policy users_select_own
  on public.users
  for select
  to authenticated
  using (id = (select auth.uid()));

revoke all on table public.users from public, anon, authenticated;
grant select on table public.users to authenticated;

create or replace function public.enforce_single_auth_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  -- Serializes every account creation, including concurrent external calls.
  perform pg_catalog.pg_advisory_xact_lock(19490326, 1);

  if exists (
    select 1
    from auth.users
    where id <> new.id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'single_user_limit_reached';
  end if;

  if new.email is null then
    raise exception using
      errcode = '23502',
      message = 'email_required';
  end if;

  return new;
end;
$$;

create trigger enforce_single_auth_user_before_insert
  before insert on auth.users
  for each row
  execute procedure public.enforce_single_auth_user();

create or replace function public.handle_new_auth_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    left(
      coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
        split_part(new.email, '@', 1)
      ),
      100
    ),
    lower(new.email)
  );

  return new;
end;
$$;

create trigger create_public_user_after_auth_insert
  after insert on auth.users
  for each row
  execute procedure public.handle_new_auth_user();

create or replace function public.sync_public_user_email()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  if new.email is null then
    raise exception using
      errcode = '23502',
      message = 'email_required';
  end if;

  update public.users
  set email = lower(new.email), updated_at = now()
  where id = new.id;

  return new;
end;
$$;

create trigger sync_public_user_email_after_auth_update
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute procedure public.sync_public_user_email();

create table public.rate_limit_buckets (
  key          text        not null,
  window_start timestamptz not null,
  count        integer     not null default 0 check (count > 0),
  primary key (key, window_start)
);

revoke all on table public.rate_limit_buckets
  from public, anon, authenticated;

create or replace function public.check_rate_limit(
  p_key            text,
  p_window_seconds integer,
  p_max_requests   integer
)
  returns boolean
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if p_key is null
    or char_length(p_key) not between 1 and 200
    or p_window_seconds not between 1 and 86400
    or p_max_requests not between 1 and 1000
  then
    return false;
  end if;

  v_window_start := pg_catalog.to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limit_buckets (key, window_start, count)
  values (p_key, v_window_start, 1)
  on conflict (key, window_start)
  do update set count = public.rate_limit_buckets.count + 1
  returning count into v_count;

  if random() < 0.05 then
    delete from public.rate_limit_buckets
    where window_start < now() - interval '24 hours';
  end if;

  return v_count <= p_max_requests;
end;
$$;

revoke execute on function public.enforce_single_auth_user()
  from public, anon, authenticated;
revoke execute on function public.handle_new_auth_user()
  from public, anon, authenticated;
revoke execute on function public.sync_public_user_email()
  from public, anon, authenticated;
revoke execute on function public.check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer)
  to service_role;
