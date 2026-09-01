# Workout plans (montar treinos)

## Scope

Create, edit, and delete workouts as a named ordered list of catalog exercises. No execution, logs, timers, or statistics.

## Protocol (code constant, not persisted)

| Slot | Kind | Target reps | Rest after (seconds) |
|------|------|-------------|----------------------|
| 1 | warmup | 15 | 60 |
| 2 | warmup | 12 | 90 |
| 3 | work | 8 | 120 |
| 4 | work | 7 | 150 |
| 5 | work | 6 | 180 |
| 6 | work | 6 | 190 |

Shown read-only in the editor. Copy must not label slot 6 as optional. Slot 6 exists at execution later (did / did not); this slice only displays the full protocol.

## Data

- `workouts`: `id`, `name` (1–80), `created_at`, `updated_at`
- `workout_exercises`: `id`, `workout_id` (cascade), `exercise_id` (restrict), `sort_order` (>= 0), unique `(workout_id, sort_order)`
- Same `exercise_id` may appear twice in one workout
- Save requires at least one exercise
- Library list order: `updated_at` desc (no library reorder)
- No `workout_sets`, weight, notes, or dates

## Routes

| Path | Role |
|------|------|
| `/lifestyle/workouts/plans` | List |
| `/lifestyle/workouts/plans/new` | Create |
| `/lifestyle/workouts/plans/[id]` | Edit |

Catalog stays at `/lifestyle/workouts/exercises`. Navigation leaves are siblings (Exercícios / Treinos), subtitle `Lifestyle · Treinos`.

## Backend

Module `src/server/modules/workouts/`. Payload `{ name, exerciseIds }` (array order = `sort_order`). Update replaces the exercise graph. Reads via `WorkoutService` from server pages; mutations via server actions.

## UI

- List: same shell as exercises (`max-w-6xl`, eyebrow), search, cards (name, count, group chips, sequence preview), empty/skeleton, edit + delete
- Editor: full page (not exercise `CreationShell`). Name, numbered list, ↑↓ reorder, picker from catalog (no create exercise here), protocol rail on each row
- Visual language: catalog cards / `NeonGlowCard`, `motion` + `useReducedMotion`

## Out of scope

Sessions, logged weight/reps/notes, rest timers, stats, duplicate workout, program/week, creating exercises from the workout editor, persisting sets/rest in the database.
