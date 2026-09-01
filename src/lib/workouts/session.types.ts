export const WORKOUT_SESSION_STATUSES = ["in_progress", "completed"] as const
export type WorkoutSessionStatus = (typeof WORKOUT_SESSION_STATUSES)[number]

export const WORKOUT_SESSION_SET_STATUSES = [
  "pending",
  "completed",
  "skipped",
] as const
export type WorkoutSessionSetStatus =
  (typeof WORKOUT_SESSION_SET_STATUSES)[number]

export type SessionMuscleGroupSnapshot = {
  id: string
  slug: string
  name: string
  iconSvg: string | null
}

export type SessionExerciseSnapshot = {
  exerciseIndex: number
  exerciseId: string
  name: string
  thumbnailUrl: string | null
  gifUrl: string | null
  muscleGroup: SessionMuscleGroupSnapshot
}

export type SessionSetPrevious = {
  weightKg: number
  reps: number
}

export type WorkoutSessionSetDto = {
  exerciseIndex: number
  exerciseId: string
  slot: 1 | 2 | 3 | 4 | 5 | 6
  status: WorkoutSessionSetStatus
  weightKg: number | null
  reps: number | null
  previous: SessionSetPrevious | null
}

export type WorkoutSessionMetrics = {
  volumeKg: number
  completedSets: number
  plannedSets: number
  completedExercises: number
  plannedExercises: number
  averageLoadKg: number | null
  durationSeconds: number | null
}

export type WorkoutSessionDto = {
  id: string
  workoutId: string
  workoutName: string
  status: WorkoutSessionStatus
  startedAt: string
  finishedAt: string | null
  calories: number | null
  avgHeartRate: number | null
  exercises: SessionExerciseSnapshot[]
  sets: WorkoutSessionSetDto[]
  metrics: WorkoutSessionMetrics
}
