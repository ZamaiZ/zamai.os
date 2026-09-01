import type {
  WorkoutSessionMetrics,
  WorkoutSessionSetDto,
} from "@/lib/workouts/session.types"

export function computeSessionMetrics(input: {
  sets: Pick<WorkoutSessionSetDto, "status" | "weightKg" | "reps" | "exerciseIndex">[]
  exerciseCount: number
  startedAt: string
  finishedAt: string | null
}): WorkoutSessionMetrics {
  const completed = input.sets.filter((set) => set.status === "completed")
  const volumeKg = completed.reduce((sum, set) => {
    return sum + (set.weightKg ?? 0) * (set.reps ?? 0)
  }, 0)
  const totalReps = completed.reduce((sum, set) => sum + (set.reps ?? 0), 0)
  const completedExerciseIndexes = new Set(
    completed.map((set) => set.exerciseIndex)
  )
  const durationSeconds =
    input.finishedAt === null
      ? null
      : Math.max(
          0,
          Math.round(
            (Date.parse(input.finishedAt) - Date.parse(input.startedAt)) / 1000
          )
        )

  return {
    volumeKg,
    completedSets: completed.length,
    plannedSets: input.exerciseCount * 6,
    completedExercises: completedExerciseIndexes.size,
    plannedExercises: input.exerciseCount,
    averageLoadKg: totalReps > 0 ? volumeKg / totalReps : null,
    durationSeconds,
  }
}
