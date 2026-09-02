create index workout_sessions_completed_finished_idx
  on public.workout_sessions (finished_at desc)
  where status = 'completed';

create index workout_sessions_workout_finished_idx
  on public.workout_sessions (workout_id, finished_at desc)
  where status = 'completed';
