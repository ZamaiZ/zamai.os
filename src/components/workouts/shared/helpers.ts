import type { CatalogExercise, CatalogMuscleGroup } from "@/components/exercises/shared/types"

import type { PlanCatalogExercise } from "./types"

export function uniqueMuscleGroups(exercises: PlanCatalogExercise[]) {
  const seen = new Set<string>()
  const groups: PlanCatalogExercise["muscleGroup"][] = []

  for (const exercise of exercises) {
    const slug = exercise.muscleGroup.slug
    if (seen.has(slug)) continue
    seen.add(slug)
    groups.push(exercise.muscleGroup)
  }

  return groups
}

export function sequencePreview(
  exercises: PlanCatalogExercise[],
  limit = 3
): string {
  const names = exercises.slice(0, limit).map((exercise) => exercise.name)
  if (exercises.length <= limit) return names.join(" → ")
  return `${names.join(" → ")}…`
}

export function catalogToPlanExercise(
  exercise: CatalogExercise,
  muscleGroups: CatalogMuscleGroup[]
): PlanCatalogExercise {
  const group = muscleGroups.find((item) => item.id === exercise.muscleGroup.id)

  return {
    id: exercise.id,
    name: exercise.name,
    slug: exercise.slug,
    equipment: exercise.equipment,
    thumbnailUrl: exercise.thumbnailUrl,
    gifUrl: exercise.gifUrl,
    muscleGroup: {
      id: exercise.muscleGroup.id,
      slug: exercise.muscleGroup.slug,
      name: exercise.muscleGroup.name,
      iconSvg: group?.iconSvg ?? null,
    },
  }
}
