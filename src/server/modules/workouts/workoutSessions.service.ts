import "server-only"

import type { Json } from "@/lib/supabase/database.types"
import { createAdminClient } from "@/lib/supabase/admin"
import { WORKOUT_SET_PROTOCOL } from "@/lib/workouts/setProtocol"
import type {
  SessionExerciseSnapshot,
  SessionSetPrevious,
  WorkoutSessionDto,
  WorkoutSessionSetDto,
  WorkoutSessionSetStatus,
  WorkoutSessionStatus,
} from "@/lib/workouts/session.types"
import { computeSessionMetrics } from "@/lib/workouts/sessionMetrics"
import type { CompleteWorkoutSessionInput, PatchWorkoutSessionSetInput } from "@/lib/validations/workoutSessions"

import { WorkoutService } from "./workouts.service"

export class SessionInProgressError extends Error {
  readonly sessionId: string

  constructor(sessionId: string) {
    super("Session already in progress")
    this.name = "SessionInProgressError"
    this.sessionId = sessionId
  }
}

type SessionRow = {
  id: string
  workout_id: string
  status: string
  started_at: string
  finished_at: string | null
  calories: number | null
  avg_heart_rate: number | null
  workout_name: string
  exercises_snapshot: Json
}

type SetRow = {
  exercise_id: string
  exercise_index: number
  slot: number
  status: string
  weight_kg: number | string | null
  reps: number | null
}

function parseKg(value: number | string | null): number | null {
  if (value === null) return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseSnapshot(value: Json): SessionExerciseSnapshot[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const row = item as Record<string, unknown>
    const muscle = row.muscleGroup
    if (!muscle || typeof muscle !== "object") return []
    const group = muscle as Record<string, unknown>
    if (
      typeof row.exerciseIndex !== "number" ||
      typeof row.exerciseId !== "string" ||
      typeof row.name !== "string"
    ) {
      return []
    }
    return [
      {
        exerciseIndex: row.exerciseIndex,
        exerciseId: row.exerciseId,
        name: row.name,
        thumbnailUrl:
          typeof row.thumbnailUrl === "string" ? row.thumbnailUrl : null,
        gifUrl: typeof row.gifUrl === "string" ? row.gifUrl : null,
        muscleGroup: {
          id: String(group.id ?? ""),
          slug: String(group.slug ?? ""),
          name: String(group.name ?? ""),
          iconSvg: typeof group.iconSvg === "string" ? group.iconSvg : null,
        },
      },
    ]
  })
}

function toSetStatus(value: string): WorkoutSessionSetStatus {
  if (value === "completed" || value === "skipped" || value === "pending") {
    return value
  }
  return "pending"
}

function toSlot(value: number): 1 | 2 | 3 | 4 | 5 | 6 {
  if (value >= 1 && value <= 6) {
    return value as 1 | 2 | 3 | 4 | 5 | 6
  }
  return 1
}

async function findInProgress(
  supabase: ReturnType<typeof createAdminClient>
): Promise<{ id: string; workout_id: string } | null> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("id, workout_id")
    .eq("status", "in_progress")
    .maybeSingle()

  if (error) {
    throw new Error("Unable to get active session", { cause: error })
  }
  return data
}

async function loadPreviousByExercise(
  supabase: ReturnType<typeof createAdminClient>,
  exerciseIds: string[],
  excludeSessionId: string
): Promise<Map<string, SessionSetPrevious>> {
  const previous = new Map<string, SessionSetPrevious>()
  if (exerciseIds.length === 0) return previous

  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .select("id, finished_at")
    .eq("status", "completed")
    .neq("id", excludeSessionId)
    .order("finished_at", { ascending: false })
    .limit(50)

  if (sessionsError) {
    throw new Error("Unable to load previous sets", { cause: sessionsError })
  }

  const sessionIds = (sessions ?? []).map((row) => row.id)
  if (sessionIds.length === 0) return previous

  const { data: setRows, error: setsError } = await supabase
    .from("workout_session_sets")
    .select("exercise_id, slot, weight_kg, reps, session_id")
    .in("exercise_id", exerciseIds)
    .in("session_id", sessionIds)
    .eq("status", "completed")

  if (setsError) {
    throw new Error("Unable to load previous sets", { cause: setsError })
  }

  const sessionOrder = new Map(sessionIds.map((id, index) => [id, index]))
  const ranked = [...(setRows ?? [])].sort((a, b) => {
    return (sessionOrder.get(a.session_id) ?? 99) - (sessionOrder.get(b.session_id) ?? 99)
  })

  for (const row of ranked) {
    const key = `${row.exercise_id}:${row.slot}`
    if (previous.has(key)) continue
    const kg = parseKg(row.weight_kg)
    if (kg === null || row.reps === null) continue
    previous.set(key, { weightKg: kg, reps: row.reps })
  }

  return previous
}

function toSessionDto(
  session: SessionRow,
  setRows: SetRow[],
  previous: Map<string, SessionSetPrevious>
): WorkoutSessionDto {
  const exercises = parseSnapshot(session.exercises_snapshot)
  const sets: WorkoutSessionSetDto[] = [...setRows]
    .sort((a, b) => a.exercise_index - b.exercise_index || a.slot - b.slot)
    .map((row) => ({
      exerciseIndex: row.exercise_index,
      exerciseId: row.exercise_id,
      slot: toSlot(row.slot),
      status: toSetStatus(row.status),
      weightKg: parseKg(row.weight_kg),
      reps: row.reps,
      previous: previous.get(`${row.exercise_id}:${row.slot}`) ?? null,
    }))

  return {
    id: session.id,
    workoutId: session.workout_id,
    workoutName: session.workout_name,
    status: session.status as WorkoutSessionStatus,
    startedAt: session.started_at,
    finishedAt: session.finished_at,
    calories: session.calories,
    avgHeartRate: session.avg_heart_rate,
    exercises,
    sets,
    metrics: computeSessionMetrics({
      sets,
      exerciseCount: exercises.length,
      startedAt: session.started_at,
      finishedAt: session.finished_at,
    }),
  }
}

async function loadSessionDto(
  supabase: ReturnType<typeof createAdminClient>,
  id: string
): Promise<WorkoutSessionDto | null> {
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .select(
      "id, workout_id, status, started_at, finished_at, calories, avg_heart_rate, workout_name, exercises_snapshot"
    )
    .eq("id", id)
    .maybeSingle()

  if (sessionError) {
    throw new Error("Unable to get session", { cause: sessionError })
  }
  if (!session) return null

  const { data: setRows, error: setsError } = await supabase
    .from("workout_session_sets")
    .select("exercise_id, exercise_index, slot, status, weight_kg, reps")
    .eq("session_id", id)

  if (setsError) {
    throw new Error("Unable to get session sets", { cause: setsError })
  }

  const exerciseIds = [
    ...new Set((setRows ?? []).map((row) => row.exercise_id)),
  ]
  const previous = await loadPreviousByExercise(supabase, exerciseIds, id)
  return toSessionDto(session as SessionRow, (setRows ?? []) as SetRow[], previous)
}

export class WorkoutSessionService {
  static async getActiveSession(): Promise<{
    id: string
    workoutId: string
  } | null> {
    const supabase = createAdminClient()
    const row = await findInProgress(supabase)
    if (!row) return null
    return { id: row.id, workoutId: row.workout_id }
  }

  static async getSessionById(id: string): Promise<WorkoutSessionDto | null> {
    const supabase = createAdminClient()
    return loadSessionDto(supabase, id)
  }

  static async createSession(workoutId: string): Promise<WorkoutSessionDto> {
    const supabase = createAdminClient()
    const existing = await findInProgress(supabase)
    if (existing) {
      throw new SessionInProgressError(existing.id)
    }

    const workout = await WorkoutService.getWorkoutById(workoutId)
    if (!workout) {
      throw new Error("Workout not found")
    }
    if (workout.exercises.length < 1) {
      throw new Error("Workout requires at least one exercise")
    }

    const snapshot: SessionExerciseSnapshot[] = workout.exercises.map(
      (line, index) => ({
        exerciseIndex: index,
        exerciseId: line.exercise.id,
        name: line.exercise.name,
        thumbnailUrl: line.exercise.thumbnailUrl,
        gifUrl: line.exercise.gifUrl,
        muscleGroup: line.exercise.muscleGroup,
      })
    )

    const { data: created, error: createError } = await supabase
      .from("workout_sessions")
      .insert({
        workout_id: workoutId,
        status: "in_progress",
        workout_name: workout.name,
        exercises_snapshot: snapshot as unknown as Json,
      })
      .select("id")
      .single()

    if (createError || !created) {
      if (createError?.code === "23505") {
        const again = await findInProgress(supabase)
        if (again) throw new SessionInProgressError(again.id)
      }
      throw new Error("Unable to create session", { cause: createError })
    }

    const setRows = snapshot.flatMap((exercise) =>
      WORKOUT_SET_PROTOCOL.map((slot) => ({
        session_id: created.id,
        exercise_id: exercise.exerciseId,
        exercise_index: exercise.exerciseIndex,
        slot: slot.slot,
        status: "pending" as const,
      }))
    )

    const { error: setsError } = await supabase
      .from("workout_session_sets")
      .insert(setRows)

    if (setsError) {
      await supabase.from("workout_sessions").delete().eq("id", created.id)
      throw new Error("Unable to create session sets", { cause: setsError })
    }

    const session = await loadSessionDto(supabase, created.id)
    if (!session) {
      throw new Error("Unable to load created session")
    }
    return session
  }

  static async patchSet(
    sessionId: string,
    input: PatchWorkoutSessionSetInput
  ): Promise<WorkoutSessionDto> {
    const supabase = createAdminClient()
    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .select("id, status")
      .eq("id", sessionId)
      .maybeSingle()

    if (sessionError) {
      throw new Error("Unable to get session", { cause: sessionError })
    }
    if (!session) {
      throw new Error("Session not found")
    }
    if (session.status !== "in_progress") {
      throw new Error("Session is not in progress")
    }

    const nextStatus = input.status
    const weightKg =
      nextStatus === "skipped"
        ? null
        : (input.weightKg ?? null)
    const reps =
      nextStatus === "skipped" ? null : (input.reps ?? null)

    const { data: updated, error: updateError } = await supabase
      .from("workout_session_sets")
      .update({
        status: nextStatus,
        weight_kg: weightKg,
        reps,
      })
      .eq("session_id", sessionId)
      .eq("exercise_index", input.exerciseIndex)
      .eq("slot", input.slot)
      .select("id")
      .maybeSingle()

    if (updateError) {
      throw new Error("Unable to update set", { cause: updateError })
    }
    if (!updated) {
      throw new Error("Set not found")
    }

    const next = await loadSessionDto(supabase, sessionId)
    if (!next) throw new Error("Unable to load session")
    return next
  }

  static async skipExercise(
    sessionId: string,
    exerciseIndex: number
  ): Promise<WorkoutSessionDto> {
    const supabase = createAdminClient()
    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .select("id, status")
      .eq("id", sessionId)
      .maybeSingle()

    if (sessionError) {
      throw new Error("Unable to get session", { cause: sessionError })
    }
    if (!session) {
      throw new Error("Session not found")
    }
    if (session.status !== "in_progress") {
      throw new Error("Session is not in progress")
    }

    const { error: updateError } = await supabase
      .from("workout_session_sets")
      .update({ status: "skipped", weight_kg: null, reps: null })
      .eq("session_id", sessionId)
      .eq("exercise_index", exerciseIndex)
      .eq("status", "pending")

    if (updateError) {
      throw new Error("Unable to skip exercise", { cause: updateError })
    }

    const next = await loadSessionDto(supabase, sessionId)
    if (!next) throw new Error("Unable to load session")
    return next
  }

  static async completeSession(
    sessionId: string,
    input: CompleteWorkoutSessionInput
  ): Promise<WorkoutSessionDto> {
    const supabase = createAdminClient()
    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .select("id, status")
      .eq("id", sessionId)
      .maybeSingle()

    if (sessionError) {
      throw new Error("Unable to get session", { cause: sessionError })
    }
    if (!session) {
      throw new Error("Session not found")
    }
    if (session.status !== "in_progress") {
      throw new Error("Session is not in progress")
    }

    const { error: skipError } = await supabase
      .from("workout_session_sets")
      .update({ status: "skipped", weight_kg: null, reps: null })
      .eq("session_id", sessionId)
      .eq("status", "pending")

    if (skipError) {
      throw new Error("Unable to skip remaining sets", { cause: skipError })
    }

    const { error: completeError } = await supabase
      .from("workout_sessions")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        calories: input.calories ?? null,
        avg_heart_rate: input.avgHeartRate ?? null,
      })
      .eq("id", sessionId)
      .eq("status", "in_progress")

    if (completeError) {
      throw new Error("Unable to complete session", { cause: completeError })
    }

    const next = await loadSessionDto(supabase, sessionId)
    if (!next) throw new Error("Unable to load session")
    return next
  }

  static async discardSession(sessionId: string): Promise<void> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("status", "in_progress")
      .select("id")
      .maybeSingle()

    if (error) {
      throw new Error("Unable to discard session", { cause: error })
    }
    if (!data) {
      const { data: existing } = await supabase
        .from("workout_sessions")
        .select("id, status")
        .eq("id", sessionId)
        .maybeSingle()
      if (!existing) {
        throw new Error("Session not found")
      }
      throw new Error("Session is not in progress")
    }
  }
}
