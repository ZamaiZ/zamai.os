create table public.prospect_searches (
  id                   uuid        primary key default gen_random_uuid(),
  city_query           text        not null check (char_length(city_query) between 1 and 120),
  geocoded_label       text        not null check (char_length(geocoded_label) between 1 and 200),
  included_type        text        not null check (char_length(included_type) between 1 and 80),
  viewport             jsonb       not null,
  google_result_count  integer     not null check (google_result_count >= 0),
  matched_count        integer     not null check (matched_count >= 0),
  candidates           jsonb       not null default '[]'::jsonb,
  created_at           timestamptz not null default now()
);

create table public.prospects (
  id                   uuid        primary key default gen_random_uuid(),
  google_place_id      text        not null unique check (char_length(google_place_id) between 1 and 128),
  name                 text        not null check (char_length(name) between 1 and 200),
  formatted_address    text        not null check (char_length(formatted_address) between 1 and 500),
  phone                text        check (
    phone is null
    or char_length(phone) between 1 and 40
  ),
  website_uri          text        check (
    website_uri is null
    or char_length(website_uri) between 1 and 500
  ),
  website_kind         text        not null check (
    website_kind in ('none', 'social', 'aggregator')
  ),
  google_maps_uri      text        check (
    google_maps_uri is null
    or char_length(google_maps_uri) between 1 and 500
  ),
  primary_type         text        check (
    primary_type is null
    or char_length(primary_type) between 1 and 80
  ),
  types                jsonb       not null default '[]'::jsonb,
  rating               numeric,
  user_rating_count    integer,
  photo_name           text        check (
    photo_name is null
    or char_length(photo_name) between 1 and 500
  ),
  status               text        not null default 'prospect' check (
    status in ('prospect', 'contacted', 'discarded', 'client')
  ),
  source_search_id     uuid        references public.prospect_searches(id) on delete set null,
  last_fetched_at      timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index prospects_status_idx on public.prospects (status);
create index prospects_source_search_id_idx on public.prospects (source_search_id);

alter table public.prospect_searches enable row level security;
alter table public.prospects enable row level security;

revoke all on table public.prospect_searches from public, anon, authenticated;
revoke all on table public.prospects from public, anon, authenticated;

grant select on table public.prospect_searches to authenticated;
grant select on table public.prospects to authenticated;

create policy prospect_searches_select_authenticated
  on public.prospect_searches
  for select
  to authenticated
  using (true);

create policy prospects_select_authenticated
  on public.prospects
  for select
  to authenticated
  using (true);
