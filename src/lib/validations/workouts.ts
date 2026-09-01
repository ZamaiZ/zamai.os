import { z } from "zod"

export const workoutIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const workoutMutationSchema = z.object({
  name: z.string().trim().min(1).max(80),
  exerciseIds: z.array(z.string().uuid()).min(1),
})

export type WorkoutMutationInput = z.infer<typeof workoutMutationSchema>
