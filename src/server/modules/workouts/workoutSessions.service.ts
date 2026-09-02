import "server-only"

import type { Json } from "@/lib/supabase/database.types"
import { createAdminClient } from "@/lib/supabase/admin"
import { WORKOUT_SET_PROTOCOL } from "@/lib/workouts/setProtocol"
import { compareSessions } from "@/lib/workouts/sessionComparison"
import type {
  SessionExerciseSnapshot,
  SessionSetPrevious,
  WorkoutSessionDetailDto,
  WorkoutSessionDto,
  WorkoutSessionHistoryItem,
  WorkoutSessionHistoryPage,
  WorkoutSessionSetDto,
  WorkoutSessionSetStatus,
  WorkoutSessionStatus,
} from "@/lib/workouts/session.types"
import { computeSessionMetrics } from "@/lib/workouts/sessionMetrics"
import { resolveWeightReference } from "@/lib/workouts/weightReferences"
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

async function getPreviousCompletedSession(
  supabase: ReturnType<typeof createAdminClient>,
  workoutId: string,
  excludeSessionId: string,
  beforeFinishedAt: string | null
): Promise<SessionRow | null> {
  let query = supabase
    .from("workout_sessions")
    .select(
      "id, workout_id, status, started_at, finished_at, calories, avg_heart_rate, workout_name, exercises_snapshot"
    )
    .eq("workout_id", workoutId)
    .eq("status", "completed")
    .neq("id", excludeSessionId)
    .order("finished_at", { ascending: false })
    .limit(1)

  if (beforeFinishedAt) {
    query = query.lt("finished_at", beforeFinishedAt)
  }

  const { data, error } = await query
  if (error) {
    throw new Error("Unable to load previous session", { cause: error })
  }
  return ((data ?? [])[0] as SessionRow | undefined) ?? null
}

async function loadSets(
  supabase: ReturnType<typeof createAdminClient>,
  sessionId: string
): Promise<SetRow[]> {
  const { data, error } = await supabase
    .from("workout_session_sets")
    .select("exercise_id, exercise_index, slot, status, weight_kg, reps")
    .eq("session_id", sessionId)

  if (error) {
    throw new Error("Unable to get session sets", { cause: error })
  }
  return (data ?? []) as SetRow[]
}

async function loadPreviousSetsForWorkout(
  supabase: ReturnType<typeof createAdminClient>,
  workoutId: string,
  excludeSessionId: string,
  beforeFinishedAt: string | null
): Promise<Map<string, SessionSetPrevious>> {
  const previous = new Map<string, SessionSetPrevious>()
  const prior = await getPreviousCompletedSession(
    supabase,
    workoutId,
    excludeSessionId,
    beforeFinishedAt
  )
  if (!prior) return previous

  const setRows = await loadSets(supabase, prior.id)
  for (const row of setRows) {
    if (row.status !== "completed") continue
    const kg = parseKg(row.weight_kg)
    if (kg === null || row.reps === null) continue
    previous.set(`${row.exercise_index}:${row.slot}`, {
      weightKg: kg,
      reps: row.reps,
    })
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
      previous: previous.get(`${row.exercise_index}:${row.slot}`) ?? null,
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

  const setRows = await loadSets(supabase, id)
  const previous = await loadPreviousSetsForWorkout(
    supabase,
    session.workout_id,
    id,
    session.finished_at
  )
  return toSessionDto(session as SessionRow, setRows, previous)
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

  static async getSessionDetail(
    id: string
  ): Promise<WorkoutSessionDetailDto | null> {
    const supabase = createAdminClient()
    const current = await loadSessionDto(supabase, id)
    if (!current) return null

    const priorRow = await getPreviousCompletedSession(
      supabase,
      current.workoutId,
      current.id,
      current.finishedAt
    )
    const baseline = priorRow ? await loadSessionDto(supabase, priorRow.id) : null

    return {
      ...current,
      comparison: compareSessions({ current, baseline }),
    }
  }

  static async listSessionHistory(input: {
    workoutId?: string
    limit?: number
    cursor?: { finishedAt: string; id: string }
  }): Promise<WorkoutSessionHistoryPage> {
    const supabase = createAdminClient()
    const limit = input.limit ?? 20

    let query = supabase
      .from("workout_sessions")
      .select(
        "id, workout_id, status, started_at, finished_at, calories, avg_heart_rate, workout_name, exercises_snapshot"
      )
      .eq("status", "completed")
      .order("finished_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1)

    if (input.workoutId) {
      query = query.eq("workout_id", input.workoutId)
    }
    if (input.cursor) {
      const { finishedAt, id } = input.cursor
      query = query.or(
        `finished_at.lt."${finishedAt}",and(finished_at.eq."${finishedAt}",id.lt.${id})`
      )
    }

    const { data, error } = await query
    if (error) {
      throw new Error("Unable to list session history", { cause: error })
    }

    const rows = (data ?? []) as SessionRow[]
    const hasMore = rows.length > limit
    const page = hasMore ? rows.slice(0, limit) : rows
    if (page.length === 0) {
      return { items: [], hasMore: false, nextCursor: null }
    }

    const extraIds = new Set<string>()
    const oldestByWorkout = new Map<string, string>()
    for (const row of page) {
      if (!row.finished_at) continue
      const currentOldest = oldestByWorkout.get(row.workout_id)
      if (!currentOldest || row.finished_at < currentOldest) {
        oldestByWorkout.set(row.workout_id, row.finished_at)
      }
    }

    await Promise.all(
      [...oldestByWorkout.entries()].map(async ([workoutId, oldest]) => {
        const prior = await getPreviousCompletedSession(
          supabase,
          workoutId,
          page.find((row) => row.workout_id === workoutId && row.finished_at === oldest)
            ?.id ?? "",
          oldest
        )
        if (prior) extraIds.add(prior.id)
      })
    )

    const volumeIds = [...new Set([...page.map((row) => row.id), ...extraIds])]
    const { data: setRows, error: setsError } = await supabase
      .from("workout_session_sets")
      .select("session_id, status, weight_kg, reps, exercise_index")
      .in("session_id", volumeIds)
      .eq("status", "completed")

    if (setsError) {
      throw new Error("Unable to load history sets", { cause: setsError })
    }

    const volumeBySession = new Map<string, number>()
    for (const row of setRows ?? []) {
      const kg = parseKg(row.weight_kg)
      if (kg === null || row.reps === null) continue
      volumeBySession.set(
        row.session_id,
        (volumeBySession.get(row.session_id) ?? 0) + kg * row.reps
      )
    }

    const priorVolumeByWorkout = new Map<string, { finishedAt: string; volumeKg: number }[]>()
    for (const row of page) {
      if (!row.finished_at) continue
      const list = priorVolumeByWorkout.get(row.workout_id) ?? []
      list.push({
        finishedAt: row.finished_at,
        volumeKg: volumeBySession.get(row.id) ?? 0,
      })
      priorVolumeByWorkout.set(row.workout_id, list)
    }
    for (const extraId of extraIds) {
      const extra = rows.find((row) => row.id === extraId)
      if (!extra?.finished_at) continue
      const list = priorVolumeByWorkout.get(extra.workout_id) ?? []
      list.push({
        finishedAt: extra.finished_at,
        volumeKg: volumeBySession.get(extra.id) ?? 0,
      })
      priorVolumeByWorkout.set(extra.workout_id, list)
    }

    const extraRowsNeeded = [...extraIds].filter(
      (id) => !page.some((row) => row.id === id)
    )
    if (extraRowsNeeded.length > 0) {
      const { data: extras, error: extrasError } = await supabase
        .from("workout_sessions")
        .select("id, workout_id, finished_at")
        .in("id", extraRowsNeeded)

      if (extrasError) {
        throw new Error("Unable to load previous history sessions", {
          cause: extrasError,
        })
      }
      for (const extra of extras ?? []) {
        if (!extra.finished_at) continue
        const list = priorVolumeByWorkout.get(extra.workout_id) ?? []
        list.push({
          finishedAt: extra.finished_at,
          volumeKg: volumeBySession.get(extra.id) ?? 0,
        })
        priorVolumeByWorkout.set(extra.workout_id, list)
      }
    }

    const items: WorkoutSessionHistoryItem[] = page.map((row) => {
      const exercises = parseSnapshot(row.exercises_snapshot)
      const metrics = computeSessionMetrics({
        sets: (setRows ?? [])
          .filter((set) => set.session_id === row.id)
          .map((set) => ({
            status: toSetStatus(set.status),
            weightKg: parseKg(set.weight_kg),
            reps: set.reps,
            exerciseIndex: set.exercise_index,
          })),
        exerciseCount: exercises.length,
        startedAt: row.started_at,
        finishedAt: row.finished_at,
      })
      const volumeKg = volumeBySession.get(row.id) ?? metrics.volumeKg
      const candidates = (priorVolumeByWorkout.get(row.workout_id) ?? [])
        .filter(
          (item) => row.finished_at !== null && item.finishedAt < row.finished_at
        )
        .sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1))
      const prior = candidates[0] ?? null
      const volumeDelta = prior ? volumeKg - prior.volumeKg : null
      const volumePercent =
        prior && prior.volumeKg !== 0
          ? ((volumeKg - prior.volumeKg) / prior.volumeKg) * 100
          : prior && volumeKg === 0
            ? 0
            : null

      return {
        id: row.id,
        workoutId: row.workout_id,
        workoutName: row.workout_name,
        finishedAt: row.finished_at ?? row.started_at,
        metrics: { ...metrics, volumeKg },
        weightReference: resolveWeightReference(volumeKg).current,
        deltaVsPrevious:
          prior === null || volumeDelta === null
            ? null
            : { volumeKg: volumeDelta, volumePercent },
      }
    })

    const last = page[page.length - 1]!
    return {
      items,
      hasMore,
      nextCursor: hasMore
        ? { finishedAt: last.finished_at ?? last.started_at, id: last.id }
        : null,
    }
  }
}
