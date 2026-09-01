export type CatalogMuscleGroup = {
  id: string
  slug: string
  name: string
  sortOrder: number
  iconSvg: string | null
}

export type CatalogExercise = {
  id: string
  name: string
  slug: string
  muscleGroup: {
    id: string
    slug: string
    name: string
  }
  sourceExerciseId: string | null
  sourceName: string | null
  equipment: string | null
  target: string | null
  thumbnailUrl: string | null
  gifUrl: string | null
}

export type ExercisesCatalogTab = "exercises" | "groups"

export type CatalogViewMode = "grid" | "list"

export type CatalogSort = "name-asc" | "name-desc" | "muscle-group"

export type ExercisesCatalogProps = {
  exercises: CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
}

export type MuscleGroupWithCount = CatalogMuscleGroup & {
  exerciseCount: number
}
