create table public.muscle_groups (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        not null unique,
  name        text        not null check (char_length(name) between 1 and 80),
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create table public.exercises (
  id                  uuid        primary key default gen_random_uuid(),
  muscle_group_id     uuid        not null references public.muscle_groups(id) on delete restrict,
  name                text        not null check (char_length(name) between 1 and 120),
  slug                text        not null unique,
  source_exercise_id  text        check (
    source_exercise_id is null
    or source_exercise_id ~ '^[0-9]{4}$'
  ),
  source_name         text        check (
    source_name is null
    or char_length(source_name) between 1 and 200
  ),
  equipment           text        check (
    equipment is null
    or char_length(equipment) between 1 and 80
  ),
  target              text        check (
    target is null
    or char_length(target) between 1 and 80
  ),
  thumbnail_path      text        check (
    thumbnail_path is null
    or char_length(thumbnail_path) between 1 and 500
  ),
  gif_path            text        check (
    gif_path is null
    or char_length(gif_path) between 1 and 500
  ),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index exercises_source_exercise_id_uidx
  on public.exercises (source_exercise_id)
  where source_exercise_id is not null;

create index exercises_muscle_group_id_idx
  on public.exercises (muscle_group_id);

alter table public.muscle_groups enable row level security;
alter table public.exercises enable row level security;

revoke all on table public.muscle_groups from public, anon, authenticated;
revoke all on table public.exercises from public, anon, authenticated;

grant select on table public.muscle_groups to authenticated;
grant select on table public.exercises to authenticated;

create policy muscle_groups_select_authenticated
  on public.muscle_groups
  for select
  to authenticated
  using (true);

create policy exercises_select_authenticated
  on public.exercises
  for select
  to authenticated
  using (true);

insert into public.muscle_groups (slug, name, sort_order)
values
  ('biceps', 'Bíceps', 10),
  ('costas', 'Costas', 20),
  ('ombro', 'Ombro', 30),
  ('peito', 'Peito', 40),
  ('posterior_gluteo', 'Posterior / Glúteo', 50),
  ('quadriceps', 'Quadríceps', 60),
  ('triceps', 'Tríceps', 70),
  ('panturrilha', 'Panturrilha', 80),
  ('abdutores', 'Abdutores', 90),
  ('adutores', 'Adutores', 100);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-media',
  'exercise-media',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
)
on conflict (id) do nothing;

create policy exercise_media_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'exercise-media');

create policy exercise_media_authenticated_read
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'exercise-media');
