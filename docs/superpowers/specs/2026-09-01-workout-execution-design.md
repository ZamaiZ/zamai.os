# Workout execution (sessões)

## Scope

Run a saved workout as a session: log kg/reps per protocol slot, rest timer, skip set/exercise, persist in progress, finish with optional calories and average heart rate, then a read-only summary. No substitutes, workout photo, volume analogies, session history list, offline queue, or OS notifications with the screen locked.

## Protocol

Same constant as plans (`WORKOUT_SET_PROTOCOL`): six fixed slots. Execution never adds, removes, or repeats slots. Slot 6 is skippable like any other (did / did not).

## Session lifecycle

- Start copies workout name + ordered exercise snapshot onto the session and materializes 6 × N `pending` sets.
- At most one `in_progress` session (partial unique index + 409 with existing `sessionId`).
- Each check/skip upserts immediately. Failed PATCH reverts the control; no silent retry.
- Undo check → `pending` (values kept). Skip exercise → remaining `pending` on that `exercise_index` become `skipped`.
- Finish is one step: sheet with optional calories and avg HR → remaining `pending` → `skipped` → `completed`.
- Discard deletes only `in_progress`. Completing is irreversible in this slice.
- Refresh/reopen resumes the same session URL.
- Delete plan: forbidden while any session (open or completed) exists.

## Previous

Column “Anterior” = last `completed` set for the same catalog `exercise_id` + `slot` on a `completed` session, any workout. First time = em dash. Duplicate lines in one workout share that history. Prefill **kg** from previous; reps stay empty (target lives on the SET label).

## Rest

Checking a set (not skip) starts a client timer of that slot’s `restAfterSeconds`, unless no `pending` sets remain. Skip rest allowed. On zero: short beep, `navigator.vibrate` if present, copy for next set/exercise. Timer is client-only. No rest on skipped sets. Does not wake a locked phone.

## Metrics (completed sets only)

- Volume = Σ kg × reps
- Average load = volume / Σ reps (null if no completed reps)
- Sets = completed / (exerciseCount × 6)
- Exercise counts as done if ≥ 1 completed set
- Duration = `finished_at - started_at` (wall clock, includes rest)

## Data

`workout_sessions`: `id`, `workout_id` (restrict), `status`, `started_at`, `finished_at`, `calories`, `avg_heart_rate`, `workout_name`, `exercises_snapshot` jsonb.

`workout_session_sets`: `session_id` (cascade), `exercise_id` (restrict), `exercise_index`, `slot` 1–6, `status`, `weight_kg`, `reps`. Unique `(session_id, exercise_index, slot)`.

Writes via admin client (RLS select-only for authenticated, same pattern as workouts).

## API

Authenticated routes on the workouts module (`WorkoutSessionService`):

- `POST /workouts/:id/sessions` — 201 or 409 `{ sessionId }`
- `GET /workout-sessions/:id`
- `PATCH /workout-sessions/:id/sets`
- `POST /workout-sessions/:id/skip-exercise`
- `POST /workout-sessions/:id/complete`
- `DELETE /workout-sessions/:id` — in progress only

Reads on the session page via the service; mutations via server actions. Complete requires `weightKg ≥ 0` and `reps ≥ 1`. Calories/HR optional; if sent, must be positive.

## Routes (app)

`/lifestyle/workouts/sessions/[id]` — execute if in progress, summary if completed. No new nav leaf. Start/resume from plans list and plan view dialog.

## UI

Catalog family: `max-w-6xl` lifestyle shell, eyebrow `Lifestyle · Treinos`, `NeonGlowCard`, `motion` + `useReducedMotion`, icons from `src/components/icons`. Accent = theme primary (not a foreign gym-app green).

Required states: session skeleton; CTA spinners; pending/completed/skipped rows; empty previous; fully skipped exercise (muted + badge); PATCH error toast + revert; session 404; confirm discard; confirm finish; list banner when a session is in progress.

Execution: live elapsed time, progress `n/6` per card, SET labels like `Aq 15` / `Tr 8`, numeric inputs, sticky Encerrar + Descartar, rest overlay, finish sheet. No Plano/Substitutos tabs. Summary: date in pt-BR, volume, duration, sets, exercises, average load, calories/HR if present, back to plans.

## Out of scope

Substitutes, photo, T-Rex-style analogies, history index, editing completed sessions, PWA lock-screen alerts, creating exercises from execution, duplicating workouts.
