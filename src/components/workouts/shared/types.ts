export type PlanMuscleGroup = {
  id: string
  slug: string
  name: string
  iconSvg: string | null
}

export type PlanCatalogExercise = {
  id: string
  name: string
  slug: string
  equipment: string | null
  thumbnailUrl: string | null
  gifUrl: string | null
  muscleGroup: PlanMuscleGroup
}

export type PlanWorkoutExercise = {
  id: string
  sortOrder: number
  exercise: PlanCatalogExercise
}

export type PlanWorkout = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  activeSessionId: string | null
  exercises: PlanWorkoutExercise[]
}

export type EditorDraftExercise = {
  clientId: string
  exercise: PlanCatalogExercise
}
