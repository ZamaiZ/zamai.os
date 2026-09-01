import type { CatalogMuscleGroup } from "./types"

export type MuscleRegion = "upper" | "lower"

export const MUSCLE_REGION_LABELS: Record<MuscleRegion, string> = {
  upper: "Superior",
  lower: "Inferior",
}

export const MUSCLE_GROUP_REGION_BY_SLUG: Record<string, MuscleRegion> = {
  biceps: "upper",
  costas: "upper",
  ombro: "upper",
  peito: "upper",
  triceps: "upper",
  posterior_gluteo: "lower",
  quadriceps: "lower",
  panturrilha: "lower",
  abdutores: "lower",
  adutores: "lower",
}

export function partitionMuscleGroups(groups: CatalogMuscleGroup[]): {
  upper: CatalogMuscleGroup[]
  lower: CatalogMuscleGroup[]
} {
  const upper: CatalogMuscleGroup[] = []
  const lower: CatalogMuscleGroup[] = []

  for (const group of groups) {
    const region = MUSCLE_GROUP_REGION_BY_SLUG[group.slug] ?? "lower"
    if (region === "upper") {
      upper.push(group)
    } else {
      lower.push(group)
    }
  }

  return { upper, lower }
}
