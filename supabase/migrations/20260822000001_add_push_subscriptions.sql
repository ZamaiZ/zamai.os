create table public.push_subscriptions (
  endpoint        text        primary key check (char_length(endpoint) between 1 and 2048),
  user_id         uuid        not null references public.users(id) on delete cascade,
  p256dh          text        not null check (char_length(p256dh) between 1 and 512),
  auth            text        not null check (char_length(auth) between 1 and 512),
  expiration_time timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

revoke all on table public.push_subscriptions from public, anon, authenticated;
