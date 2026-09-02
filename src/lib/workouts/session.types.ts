import type {
  ResolvedWeightReference,
  WeightReference,
} from "@/lib/workouts/weightReferences"

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

export type WorkoutSessionExerciseMetrics = {
  exerciseIndex: number
  volumeKg: number
  completedSets: number
  plannedSets: number
  bestSet: {
    slot: WorkoutSessionSetDto["slot"]
    weightKg: number
    reps: number
    volumeKg: number
  } | null
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

export type SessionSetTrend =
  | "up"
  | "down"
  | "same"
  | "new"
  | "missing"
  | "skipped"

export type SessionSetSnapshot = {
  weightKg: number
  reps: number
  volumeKg: number
}

export type SessionSetComparison = {
  slot: WorkoutSessionSetDto["slot"]
  current: SessionSetSnapshot | null
  baseline: SessionSetSnapshot | null
  delta: {
    weightKg: number
    reps: number
    volumeKg: number
    volumePercent: number | null
  } | null
  trend: SessionSetTrend
}

export type SessionExerciseComparison = {
  exerciseIndex: number
  exerciseId: string
  name: string
  thumbnailUrl: string | null
  gifUrl: string | null
  muscleGroup: SessionMuscleGroupSnapshot
  currentVolumeKg: number
  baselineVolumeKg: number | null
  volumeDeltaKg: number | null
  sets: SessionSetComparison[]
}

export type SessionComparisonDelta = {
  volumeKg: number
  volumePercent: number | null
  durationSeconds: number | null
  averageLoadKg: number | null
  completedSets: number
}

export type SessionComparisonBaseline = {
  sessionId: string
  finishedAt: string
  metrics: WorkoutSessionMetrics
}

export type SessionComparison = {
  baseline: SessionComparisonBaseline | null
  current: {
    sessionId: string
    finishedAt: string | null
    metrics: WorkoutSessionMetrics
  }
  delta: SessionComparisonDelta | null
  weightReference: ResolvedWeightReference
  exercises: SessionExerciseComparison[]
}

export type WorkoutSessionHistoryItem = {
  id: string
  workoutId: string
  workoutName: string
  finishedAt: string
  metrics: WorkoutSessionMetrics
  weightReference: WeightReference
  deltaVsPrevious: {
    volumeKg: number
    volumePercent: number | null
  } | null
}

export type WorkoutSessionHistoryPage = {
  items: WorkoutSessionHistoryItem[]
  hasMore: boolean
  nextCursor: { finishedAt: string; id: string } | null
}

export type WorkoutSessionDetailDto = WorkoutSessionDto & {
  comparison: SessionComparison
}
