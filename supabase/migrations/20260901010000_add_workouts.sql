create table public.workouts (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null check (char_length(name) between 1 and 80),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.workout_exercises (
  id           uuid        primary key default gen_random_uuid(),
  workout_id   uuid        not null references public.workouts(id) on delete cascade,
  exercise_id  uuid        not null references public.exercises(id) on delete restrict,
  sort_order   integer     not null check (sort_order >= 0)
);

create unique index workout_exercises_workout_id_sort_order_uidx
  on public.workout_exercises (workout_id, sort_order);

create index workout_exercises_workout_id_idx
  on public.workout_exercises (workout_id);

alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;

revoke all on table public.workouts from public, anon, authenticated;
revoke all on table public.workout_exercises from public, anon, authenticated;

grant select on table public.workouts to authenticated;
grant select on table public.workout_exercises to authenticated;

create policy workouts_select_authenticated
  on public.workouts
  for select
  to authenticated
  using (true);

create policy workout_exercises_select_authenticated
  on public.workout_exercises
  for select
  to authenticated
  using (true);
