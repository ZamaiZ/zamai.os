import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { getSupabasePublicConfig } from "@/lib/supabase/config"

import type { WorkoutDto, WorkoutRow } from "./workouts.types"

async function loadActiveSessionIdMap(
  supabase: ReturnType<typeof createAdminClient>
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("id, workout_id")
    .eq("status", "in_progress")
    .maybeSingle()

  if (error) {
    throw new Error("Unable to get active session", { cause: error })
  }

  const map = new Map<string, string>()
  if (data) {
    map.set(data.workout_id, data.id)
  }
  return map
}

const BUCKET = "exercise-media"

type NestedMuscleGroup = {
  id: string
  slug: string
  name: string
  icon_svg: string | null
}

type NestedExercise = {
  id: string
  name: string
  slug: string
  equipment: string | null
  thumbnail_path: string | null
  gif_path: string | null
  muscle_groups: NestedMuscleGroup | NestedMuscleGroup[] | null
}

type NestedWorkoutExercise = {
  id: string
  sort_order: number
  exercises: NestedExercise | NestedExercise[] | null
}

type WorkoutWithExercises = WorkoutRow & {
  workout_exercises: NestedWorkoutExercise[] | null
}

const WORKOUT_SELECT = `
  id,
  name,
  created_at,
  updated_at,
  workout_exercises (
    id,
    sort_order,
    exercises (
      id,
      name,
      slug,
      equipment,
      thumbnail_path,
      gif_path,
      muscle_groups (
        id,
        slug,
        name,
        icon_svg
      )
    )
  )
`

function publicObjectUrl(objectPath: string | null): string | null {
  if (!objectPath) return null
  const { url } = getSupabasePublicConfig()
  return `${url}/storage/v1/object/public/${BUCKET}/${objectPath}`
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function toWorkoutDto(
  row: WorkoutWithExercises,
  activeSessionId: string | null
): WorkoutDto {
  const lines = [...(row.workout_exercises ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )

  const exercises = lines.map((line) => {
    const exercise = unwrapOne(line.exercises)
    if (!exercise) {
      throw new Error("Workout exercise is missing catalog exercise")
    }

    const group = unwrapOne(exercise.muscle_groups)
    if (!group) {
      throw new Error("Exercise is missing muscle group relation")
    }

    return {
      id: line.id,
      sortOrder: line.sort_order,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        slug: exercise.slug,
        equipment: exercise.equipment,
        thumbnailUrl: publicObjectUrl(exercise.thumbnail_path),
        gifUrl: publicObjectUrl(exercise.gif_path),
        muscleGroup: {
          id: group.id,
          slug: group.slug,
          name: group.name,
          iconSvg: group.icon_svg,
        },
      },
    }
  })

  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    activeSessionId,
    exercises,
  }
}

async function assertExercisesExist(
  supabase: ReturnType<typeof createAdminClient>,
  exerciseIds: string[]
) {
  const uniqueIds = [...new Set(exerciseIds)]
  const { data, error } = await supabase
    .from("exercises")
    .select("id")
    .in("id", uniqueIds)

  if (error) {
    throw new Error("Unable to validate exercises", { cause: error })
  }

  const found = new Set((data ?? []).map((row) => row.id))
  if (uniqueIds.some((id) => !found.has(id))) {
    throw new Error("Exercise not found")
  }
}

async function replaceWorkoutExercises(
  supabase: ReturnType<typeof createAdminClient>,
  workoutId: string,
  exerciseIds: string[]
) {
  const { error: deleteError } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("workout_id", workoutId)

  if (deleteError) {
    throw new Error("Unable to replace workout exercises", {
      cause: deleteError,
    })
  }

  const { error: insertError } = await supabase.from("workout_exercises").insert(
    exerciseIds.map((exerciseId, index) => ({
      workout_id: workoutId,
      exercise_id: exerciseId,
      sort_order: index,
    }))
  )

  if (insertError) {
    throw new Error("Unable to save workout exercises", { cause: insertError })
  }
}

async function loadWorkoutById(
  supabase: ReturnType<typeof createAdminClient>,
  id: string
): Promise<WorkoutDto | null> {
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error("Unable to get workout", { cause: error })
  }

  if (!data) return null
  const active = await loadActiveSessionIdMap(supabase)
  return toWorkoutDto(data as WorkoutWithExercises, active.get(id) ?? null)
}

export class WorkoutService {
  static async listWorkouts(): Promise<WorkoutDto[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("workouts")
      .select(WORKOUT_SELECT)
      .order("updated_at", { ascending: false })

    if (error) {
      throw new Error("Unable to list workouts", { cause: error })
    }

    const active = await loadActiveSessionIdMap(supabase)
    return ((data ?? []) as WorkoutWithExercises[]).map((row) =>
      toWorkoutDto(row, active.get(row.id) ?? null)
    )
  }

  static async getWorkoutById(id: string): Promise<WorkoutDto | null> {
    const supabase = createAdminClient()
    return loadWorkoutById(supabase, id)
  }

  static async createWorkout(input: {
    name: string
    exerciseIds: string[]
  }): Promise<WorkoutDto> {
    const name = input.name.trim()
    if (!name || name.length > 80) {
      throw new Error("Workout name must be between 1 and 80 characters")
    }
    if (input.exerciseIds.length < 1) {
      throw new Error("Workout requires at least one exercise")
    }

    const supabase = createAdminClient()
    await assertExercisesExist(supabase, input.exerciseIds)

    const { data, error } = await supabase
      .from("workouts")
      .insert({ name })
      .select("id")
      .single()

    if (error || !data) {
      throw new Error("Unable to create workout", { cause: error })
    }

    await replaceWorkoutExercises(supabase, data.id, input.exerciseIds)

    const workout = await loadWorkoutById(supabase, data.id)
    if (!workout) {
      throw new Error("Unable to load created workout")
    }
    return workout
  }

  static async updateWorkout(input: {
    id: string
    name: string
    exerciseIds: string[]
  }): Promise<WorkoutDto> {
    const name = input.name.trim()
    if (!name || name.length > 80) {
      throw new Error("Workout name must be between 1 and 80 characters")
    }
    if (input.exerciseIds.length < 1) {
      throw new Error("Workout requires at least one exercise")
    }

    const supabase = createAdminClient()

    const { data: existing, error: existingError } = await supabase
      .from("workouts")
      .select("id")
      .eq("id", input.id)
      .maybeSingle()

    if (existingError) {
      throw new Error("Unable to get workout", { cause: existingError })
    }
    if (!existing) {
      throw new Error("Workout not found")
    }

    await assertExercisesExist(supabase, input.exerciseIds)

    const { error: updateError } = await supabase
      .from("workouts")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", input.id)

    if (updateError) {
      throw new Error("Unable to update workout", { cause: updateError })
    }

    await replaceWorkoutExercises(supabase, input.id, input.exerciseIds)

    const workout = await loadWorkoutById(supabase, input.id)
    if (!workout) {
      throw new Error("Unable to load updated workout")
    }
    return workout
  }

  static async deleteWorkout(id: string): Promise<void> {
    const supabase = createAdminClient()

    const { count, error: countError } = await supabase
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("workout_id", id)

    if (countError) {
      throw new Error("Unable to delete workout", { cause: countError })
    }
    if ((count ?? 0) > 0) {
      throw new Error("Workout has sessions")
    }

    const { data, error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle()

    if (error) {
      throw new Error("Unable to delete workout", { cause: error })
    }
    if (!data) {
      throw new Error("Workout not found")
    }
  }
}
