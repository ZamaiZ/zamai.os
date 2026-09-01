export type MuscleGroupRow = {
  id: string
  slug: string
  name: string
  sort_order: number
  icon_svg: string | null
  created_at: string
}

export type ExerciseRow = {
  id: string
  muscle_group_id: string
  name: string
  slug: string
  source_exercise_id: string | null
  source_name: string | null
  equipment: string | null
  target: string | null
  thumbnail_path: string | null
  gif_path: string | null
  created_at: string
  updated_at: string
}

export type MuscleGroupDto = {
  id: string
  slug: string
  name: string
  sortOrder: number
  iconSvg: string | null
}

export type ExerciseDto = {
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
