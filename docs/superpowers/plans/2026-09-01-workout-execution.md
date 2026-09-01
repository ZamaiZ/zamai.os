# Workout Execution — Implementation Plan

> Spec: `docs/superpowers/specs/2026-09-01-workout-execution-design.md`

> **For agentic workers:** Implement task-by-task in this session. No automated tests. No git unless asked.

**Goal:** Persist and run workout sessions against the six-slot protocol, with resume, rest timer, skip, and a completion summary.

**Architecture:** `WorkoutSessionService` beside `WorkoutService`. Snapshot + set rows in Postgres. App route `/lifestyle/workouts/sessions/[id]`. Mutations via server actions. Rest timer client-only.

**Tech stack:** Next.js App Router, Supabase admin client, Zod, existing primitives / `NeonGlowCard` / `motion`.

## Global Constraints

- No automated tests, lint, tsc, or build unless the user asks.
- Identifiers in English; UI copy in Portuguese.
- Client components must not import `@/server/*`.
- No substitutes, photo, volume analogy, history list, offline queue, lock-screen notifications.

## Files

- Create: `supabase/migrations/20260901020000_add_workout_sessions.sql`
- Create: `src/lib/workouts/session.types.ts`, `src/lib/workouts/sessionMetrics.ts`
- Create: `src/lib/validations/workoutSessions.ts`
- Create: `src/server/modules/workouts/workoutSessions.service.ts`, `workoutSessions.handlers.ts`
- Create: `src/app/actions/workoutSessions.ts`
- Create: session UI under `src/components/workouts/WorkoutSession*` and `src/app/(protected)/lifestyle/workouts/sessions/[id]/`
- Modify: `database.types.ts`, `setProtocol.ts`, `workouts.service.ts` / types / handlers / routes / index, catalog/card/dialog/constants

## Tasks

1. Migration + generated table types in `database.types.ts`
2. Zod + session DTO + `WorkoutSessionService` (create/snapshot/sets, previous, patch, skip, complete, discard) + list `activeSessionId` + delete blocked
3. Handlers, routes, actions
4. Session page + execution/summary/timer/skeleton
5. Start/resume CTAs + in-progress banner + delete copy for 409
6. Browser-check the gym flow
