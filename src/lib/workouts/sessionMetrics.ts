import type {
  WorkoutSessionExerciseMetrics,
  WorkoutSessionMetrics,
  WorkoutSessionSetDto,
} from "@/lib/workouts/session.types"

export function setVolumeKg(
  set: Pick<WorkoutSessionSetDto, "status" | "weightKg" | "reps">
): number {
  if (set.status !== "completed") return 0
  return (set.weightKg ?? 0) * (set.reps ?? 0)
}

export function computeSessionMetrics(input: {
  sets: Pick<
    WorkoutSessionSetDto,
    "status" | "weightKg" | "reps" | "exerciseIndex"
  >[]
  exerciseCount: number
  startedAt: string
  finishedAt: string | null
}): WorkoutSessionMetrics {
  const completed = input.sets.filter((set) => set.status === "completed")
  const volumeKg = completed.reduce((sum, set) => sum + setVolumeKg(set), 0)
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

export function computeExerciseMetrics(input: {
  exerciseIndex: number
  sets: Pick<WorkoutSessionSetDto, "status" | "weightKg" | "reps" | "slot">[]
}): WorkoutSessionExerciseMetrics {
  const completed = input.sets.filter((set) => set.status === "completed")
  const volumeKg = completed.reduce((sum, set) => sum + setVolumeKg(set), 0)
  let bestSet: WorkoutSessionExerciseMetrics["bestSet"] = null
  for (const set of completed) {
    const volume = setVolumeKg(set)
    if (
      !bestSet ||
      volume > bestSet.volumeKg ||
      (volume === bestSet.volumeKg && (set.weightKg ?? 0) > bestSet.weightKg)
    ) {
      bestSet = {
        slot: set.slot,
        weightKg: set.weightKg ?? 0,
        reps: set.reps ?? 0,
        volumeKg: volume,
      }
    }
  }

  return {
    exerciseIndex: input.exerciseIndex,
    volumeKg,
    completedSets: completed.length,
    plannedSets: input.sets.length,
    bestSet,
  }
}
