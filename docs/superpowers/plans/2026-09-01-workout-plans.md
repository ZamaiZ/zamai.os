# Workout Plans — Implementation Plan

> Spec: `docs/superpowers/specs/2026-09-01-workout-plans-design.md`

**Goal:** Persist named workouts as ordered catalog exercises, with a list and editor matching the exercises catalog UI.

**Architecture:** New `workouts` module (service/handlers/routes), JSON API + server actions, protocol constant in `src/lib/workouts/setProtocol.ts`. UI under `src/components/workouts/` and routes under `/lifestyle/workouts/plans`.

**Tech stack:** Next.js app router, Supabase (admin client writes), Zod, existing primitives/`motion`.

**Constraints:** No automated tests. No `workout_sets`. Editor is a full page. Reorder via ↑↓.

## Tasks

1. Protocol constant + Zod + SQL migration
2. WorkoutService, handlers, routes, register, actions
3. Nav leaf Treinos
4. List page + catalog/card/skeleton/empty/delete
5. Editor + picker + `/new` and `/[id]` + protocol rail
