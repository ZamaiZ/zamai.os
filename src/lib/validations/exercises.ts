import { z } from "zod"

export const listExercisesQuerySchema = z.object({
  muscleGroup: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
})

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>

export const exerciseIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const createMuscleGroupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  iconSvg: z.string().min(1).max(32_768),
})

export type CreateMuscleGroupInput = z.infer<typeof createMuscleGroupSchema>

export const updateMuscleGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  iconSvg: z.string().min(1).max(32_768),
})

export type UpdateMuscleGroupInput = z.infer<typeof updateMuscleGroupSchema>

export const exerciseMutationFieldsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  muscleGroupId: z.string().uuid(),
  equipment: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value ? value : undefined)),
})

export type ExerciseMutationFields = z.infer<typeof exerciseMutationFieldsSchema>

export const EXERCISE_GIF_MAX_BYTES = 5_242_880
export const EXERCISE_THUMBNAIL_MAX_BYTES = 512_000
