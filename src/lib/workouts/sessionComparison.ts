import type {
  SessionExerciseComparison,
  SessionSetComparison,
  SessionSetSnapshot,
  SessionSetTrend,
  SessionComparison,
  WorkoutSessionDto,
  WorkoutSessionSetDto,
} from "@/lib/workouts/session.types"
import {
  computeExerciseMetrics,
  setVolumeKg,
} from "@/lib/workouts/sessionMetrics"
import { resolveWeightReference } from "@/lib/workouts/weightReferences"

function setKey(exerciseIndex: number, slot: number) {
  return `${exerciseIndex}:${slot}`
}

function toSnapshot(
  set: Pick<WorkoutSessionSetDto, "status" | "weightKg" | "reps">
): SessionSetSnapshot | null {
  if (set.status !== "completed" || set.weightKg === null || set.reps === null) {
    return null
  }
  return {
    weightKg: set.weightKg,
    reps: set.reps,
    volumeKg: setVolumeKg(set),
  }
}

function percentDelta(current: number, baseline: number): number | null {
  if (baseline === 0) return current === 0 ? 0 : null
  return ((current - baseline) / baseline) * 100
}

function trendForSet(input: {
  currentStatus: WorkoutSessionSetDto["status"]
  current: SessionSetSnapshot | null
  baseline: SessionSetSnapshot | null
}): SessionSetTrend {
  if (input.currentStatus === "skipped") return "skipped"
  if (!input.current && !input.baseline) return "missing"
  if (input.current && !input.baseline) return "new"
  if (!input.current && input.baseline) return "missing"
  if (!input.current || !input.baseline) return "missing"

  const volumeDelta = input.current.volumeKg - input.baseline.volumeKg
  if (volumeDelta > 0) return "up"
  if (volumeDelta < 0) return "down"
  if (input.current.weightKg !== input.baseline.weightKg) return "same"
  if (input.current.reps !== input.baseline.reps) {
    return input.current.reps > input.baseline.reps ? "up" : "down"
  }
  return "same"
}

function compareSet(
  slot: WorkoutSessionSetDto["slot"],
  currentSet: WorkoutSessionSetDto | undefined,
  baselineSet: WorkoutSessionSetDto | undefined
): SessionSetComparison {
  const current = currentSet ? toSnapshot(currentSet) : null
  const baseline = baselineSet ? toSnapshot(baselineSet) : null
  const status = currentSet?.status ?? "pending"
  const trend = trendForSet({
    currentStatus: status,
    current,
    baseline,
  })

  const delta =
    current && baseline
      ? {
          weightKg: current.weightKg - baseline.weightKg,
          reps: current.reps - baseline.reps,
          volumeKg: current.volumeKg - baseline.volumeKg,
          volumePercent: percentDelta(current.volumeKg, baseline.volumeKg),
        }
      : null

  return { slot, current, baseline, delta, trend }
}

export function compareSessions(input: {
  current: WorkoutSessionDto
  baseline: WorkoutSessionDto | null
}): SessionComparison {
  const currentMetrics = input.current.metrics
  const baselineMetrics = input.baseline?.metrics ?? null
  const currentSets = new Map(
    input.current.sets.map((set) => [setKey(set.exerciseIndex, set.slot), set])
  )
  const baselineSets = new Map(
    (input.baseline?.sets ?? []).map((set) => [
      setKey(set.exerciseIndex, set.slot),
      set,
    ])
  )

  const exercises: SessionExerciseComparison[] = input.current.exercises.map(
    (exercise) => {
      const currentExerciseSets = input.current.sets.filter(
        (set) => set.exerciseIndex === exercise.exerciseIndex
      )
      const slots = [...new Set(currentExerciseSets.map((set) => set.slot))].sort(
        (a, b) => a - b
      )
      const sets = slots.map((slot) =>
        compareSet(
          slot,
          currentSets.get(setKey(exercise.exerciseIndex, slot)),
          baselineSets.get(setKey(exercise.exerciseIndex, slot))
        )
      )
      const currentVolumeKg = computeExerciseMetrics({
        exerciseIndex: exercise.exerciseIndex,
        sets: currentExerciseSets,
      }).volumeKg
      const baselineExerciseSets = (input.baseline?.sets ?? []).filter(
        (set) => set.exerciseIndex === exercise.exerciseIndex
      )
      const baselineVolumeKg =
        input.baseline === null
          ? null
          : computeExerciseMetrics({
              exerciseIndex: exercise.exerciseIndex,
              sets: baselineExerciseSets,
            }).volumeKg

      return {
        exerciseIndex: exercise.exerciseIndex,
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        thumbnailUrl: exercise.thumbnailUrl,
        gifUrl: exercise.gifUrl,
        muscleGroup: exercise.muscleGroup,
        currentVolumeKg,
        baselineVolumeKg,
        volumeDeltaKg:
          baselineVolumeKg === null ? null : currentVolumeKg - baselineVolumeKg,
        sets,
      }
    }
  )

  const delta =
    baselineMetrics === null
      ? null
      : {
          volumeKg: currentMetrics.volumeKg - baselineMetrics.volumeKg,
          volumePercent: percentDelta(
            currentMetrics.volumeKg,
            baselineMetrics.volumeKg
          ),
          durationSeconds:
            currentMetrics.durationSeconds === null ||
            baselineMetrics.durationSeconds === null
              ? null
              : currentMetrics.durationSeconds - baselineMetrics.durationSeconds,
          averageLoadKg:
            currentMetrics.averageLoadKg === null ||
            baselineMetrics.averageLoadKg === null
              ? null
              : currentMetrics.averageLoadKg - baselineMetrics.averageLoadKg,
          completedSets:
            currentMetrics.completedSets - baselineMetrics.completedSets,
        }

  return {
    baseline: input.baseline
      ? {
          sessionId: input.baseline.id,
          finishedAt: input.baseline.finishedAt ?? input.baseline.startedAt,
          metrics: baselineMetrics!,
        }
      : null,
    current: {
      sessionId: input.current.id,
      finishedAt: input.current.finishedAt,
      metrics: currentMetrics,
    },
    delta,
    weightReference: resolveWeightReference(currentMetrics.volumeKg),
    exercises,
  }
}
