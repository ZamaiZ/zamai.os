import { z } from "zod"

export const workoutSessionIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const workoutSessionSlotSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(6)

export const patchWorkoutSessionSetSchema = z
  .object({
    exerciseIndex: z.number().int().min(0),
    slot: workoutSessionSlotSchema,
    status: z.enum(["pending", "completed", "skipped"]),
    weightKg: z.number().min(0).optional(),
    reps: z.number().int().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "completed") {
      if (value.weightKg === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Weight is required",
          path: ["weightKg"],
        })
      }
      if (value.reps === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Reps are required",
          path: ["reps"],
        })
      }
    }
  })

export const skipWorkoutSessionExerciseSchema = z.object({
  exerciseIndex: z.number().int().min(0),
})

export const completeWorkoutSessionSchema = z.object({
  calories: z.number().int().positive().optional(),
  avgHeartRate: z.number().int().positive().optional(),
})

export type PatchWorkoutSessionSetInput = z.infer<
  typeof patchWorkoutSessionSetSchema
>
export type SkipWorkoutSessionExerciseInput = z.infer<
  typeof skipWorkoutSessionExerciseSchema
>
export type CompleteWorkoutSessionInput = z.infer<
  typeof completeWorkoutSessionSchema
>
