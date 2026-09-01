create table public.workout_sessions (
  id                   uuid        primary key default gen_random_uuid(),
  workout_id           uuid        not null references public.workouts(id) on delete restrict,
  status               text        not null check (status in ('in_progress', 'completed')),
  started_at           timestamptz not null default now(),
  finished_at          timestamptz,
  calories             integer     check (calories is null or calories > 0),
  avg_heart_rate       integer     check (avg_heart_rate is null or avg_heart_rate > 0),
  workout_name         text        not null check (char_length(workout_name) between 1 and 80),
  exercises_snapshot   jsonb       not null default '[]'::jsonb,
  constraint workout_sessions_finished_ck check (
    (status = 'in_progress' and finished_at is null)
    or (status = 'completed' and finished_at is not null)
  )
);

create unique index workout_sessions_one_in_progress_uidx
  on public.workout_sessions ((true))
  where status = 'in_progress';

create index workout_sessions_workout_id_idx
  on public.workout_sessions (workout_id);

create table public.workout_session_sets (
  id               uuid           primary key default gen_random_uuid(),
  session_id       uuid           not null references public.workout_sessions(id) on delete cascade,
  exercise_id      uuid           not null references public.exercises(id) on delete restrict,
  exercise_index   integer        not null check (exercise_index >= 0),
  slot             integer        not null check (slot between 1 and 6),
  status           text           not null check (status in ('pending', 'completed', 'skipped')),
  weight_kg        numeric(6, 2)  check (weight_kg is null or weight_kg >= 0),
  reps             integer        check (reps is null or reps >= 1),
  constraint workout_session_sets_completed_ck check (
    (status = 'completed' and weight_kg is not null and reps is not null)
    or (status <> 'completed')
  )
);

create unique index workout_session_sets_session_exercise_slot_uidx
  on public.workout_session_sets (session_id, exercise_index, slot);

create index workout_session_sets_session_id_idx
  on public.workout_session_sets (session_id);

create index workout_session_sets_exercise_id_idx
  on public.workout_session_sets (exercise_id);

alter table public.workout_sessions enable row level security;
alter table public.workout_session_sets enable row level security;

revoke all on table public.workout_sessions from public, anon, authenticated;
revoke all on table public.workout_session_sets from public, anon, authenticated;

grant select on table public.workout_sessions to authenticated;
grant select on table public.workout_session_sets to authenticated;

create policy workout_sessions_select_authenticated
  on public.workout_sessions
  for select
  to authenticated
  using (true);

create policy workout_session_sets_select_authenticated
  on public.workout_session_sets
  for select
  to authenticated
  using (true);
