import { CATALOG_SORT_DEFAULT } from "./constants"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
  CatalogSort,
  CatalogViewMode,
  ExercisesCatalogTab,
  MuscleGroupWithCount,
} from "./types"

export function parseCatalogTab(value: string | null): ExercisesCatalogTab {
  return value === "groups" ? "groups" : "exercises"
}

export function parseViewMode(value: string | null): CatalogViewMode {
  return value === "list" ? "list" : "grid"
}

export function parseCatalogSort(value: string | null): CatalogSort {
  if (value === "name-desc" || value === "muscle-group") return value
  return CATALOG_SORT_DEFAULT
}

export function serializeCatalogSort(sort: CatalogSort): string | null {
  return sort === CATALOG_SORT_DEFAULT ? null : sort
}

export function parseMuscleGroupsParam(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
}

export function serializeMuscleGroupsParam(slugs: string[]): string | null {
  const cleaned = slugs.map((slug) => slug.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned.join(",") : null
}

export function parseEquipmentParam(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function serializeEquipmentParam(values: string[]): string | null {
  const cleaned = values.map((item) => item.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned.join(",") : null
}

export function filterExercises(
  exercises: CatalogExercise[],
  options: {
    q: string
    muscleGroups: string[]
    equipment: string[]
  }
): CatalogExercise[] {
  const query = options.q.trim().toLowerCase()
  const selectedGroups = new Set(
    options.muscleGroups.map((slug) => slug.trim()).filter(Boolean)
  )
  const selectedEquipment = new Set(
    options.equipment.map((item) => item.trim().toLowerCase()).filter(Boolean)
  )

  return exercises.filter((exercise) => {
    if (
      selectedGroups.size > 0 &&
      !selectedGroups.has(exercise.muscleGroup.slug)
    ) {
      return false
    }

    if (selectedEquipment.size > 0) {
      const equipment = exercise.equipment?.trim().toLowerCase() ?? ""
      if (!equipment || !selectedEquipment.has(equipment)) {
        return false
      }
    }

    if (!query) {
      return true
    }

    const haystack = [
      exercise.name,
      exercise.sourceName,
      exercise.equipment,
      exercise.target,
      exercise.muscleGroup.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function sortExercises(
  exercises: CatalogExercise[],
  sort: CatalogSort
): CatalogExercise[] {
  const sorted = [...exercises]

  sorted.sort((a, b) => {
    if (sort === "muscle-group") {
      const byGroup = a.muscleGroup.name.localeCompare(b.muscleGroup.name, "pt")
      if (byGroup !== 0) return byGroup
      return a.name.localeCompare(b.name, "pt")
    }

    const byName = a.name.localeCompare(b.name, "pt")
    return sort === "name-desc" ? -byName : byName
  })

  return sorted
}

export function buildMuscleGroupsWithCount(
  muscleGroups: CatalogMuscleGroup[],
  exercises: CatalogExercise[],
  q: string
): MuscleGroupWithCount[] {
  const query = q.trim().toLowerCase()

  return muscleGroups
    .map((group) => ({
      ...group,
      exerciseCount: exercises.filter(
        (exercise) => exercise.muscleGroup.slug === group.slug
      ).length,
    }))
    .filter((group) => {
      if (!query) return true
      return group.name.toLowerCase().includes(query)
    })
}
