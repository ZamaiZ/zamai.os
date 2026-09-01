export type WorkoutRow = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type WorkoutExerciseRow = {
  id: string
  workout_id: string
  exercise_id: string
  sort_order: number
}

export type WorkoutMuscleGroupDto = {
  id: string
  slug: string
  name: string
  iconSvg: string | null
}

export type WorkoutCatalogExerciseDto = {
  id: string
  name: string
  slug: string
  equipment: string | null
  thumbnailUrl: string | null
  gifUrl: string | null
  muscleGroup: WorkoutMuscleGroupDto
}

export type WorkoutExerciseDto = {
  id: string
  sortOrder: number
  exercise: WorkoutCatalogExerciseDto
}

export type WorkoutDto = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  activeSessionId: string | null
  exercises: WorkoutExerciseDto[]
}
