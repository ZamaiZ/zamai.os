"use server"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import {
  workoutIdParamSchema,
  workoutMutationSchema,
} from "@/lib/validations/workouts"
import {
  WorkoutService,
  type WorkoutDto,
} from "@/server/modules/workouts"

export type WorkoutMutationResult =
  | { ok: true; workout: WorkoutDto }
  | { ok: false; error: string }

export type WorkoutDeleteResult = { ok: true } | { ok: false; error: string }

function mapWorkoutError(error: unknown, fallback: string): string {
  const message =
    error instanceof Error ? error.message : "Unable to mutate workout"

  if (message.includes("Workout not found")) {
    return "Treino não encontrado."
  }
  if (message.includes("Exercise not found")) {
    return "Exercício não encontrado."
  }
  if (message.includes("at least one exercise")) {
    return "Adicione pelo menos um exercício."
  }
  if (message.includes("Workout has sessions")) {
    return "Este treino já tem sessões e não pode ser excluído."
  }
  if (message.includes("name must be")) {
    return "Nome inválido para o treino."
  }

  return fallback
}

export async function createWorkoutAction(input: {
  name: string
  exerciseIds: string[]
}): Promise<WorkoutMutationResult> {
  await requireAuthenticatedUser()

  const parsed = workoutMutationSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos para o treino." }
  }

  try {
    const workout = await WorkoutService.createWorkout(parsed.data)
    return { ok: true, workout }
  } catch (error) {
    return {
      ok: false,
      error: mapWorkoutError(error, "Não foi possível criar o treino."),
    }
  }
}

export async function updateWorkoutAction(input: {
  id: string
  name: string
  exerciseIds: string[]
}): Promise<WorkoutMutationResult> {
  await requireAuthenticatedUser()

  const parsedId = workoutIdParamSchema.safeParse({ id: input.id })
  const parsed = workoutMutationSchema.safeParse({
    name: input.name,
    exerciseIds: input.exerciseIds,
  })
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: "Dados inválidos para o treino." }
  }

  try {
    const workout = await WorkoutService.updateWorkout({
      id: parsedId.data.id,
      name: parsed.data.name,
      exerciseIds: parsed.data.exerciseIds,
    })
    return { ok: true, workout }
  } catch (error) {
    return {
      ok: false,
      error: mapWorkoutError(error, "Não foi possível atualizar o treino."),
    }
  }
}

export async function deleteWorkoutAction(
  id: string
): Promise<WorkoutDeleteResult> {
  await requireAuthenticatedUser()

  const parsedId = workoutIdParamSchema.safeParse({ id })
  if (!parsedId.success) {
    return { ok: false, error: "Treino não encontrado." }
  }

  try {
    await WorkoutService.deleteWorkout(parsedId.data.id)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: mapWorkoutError(error, "Não foi possível excluir o treino."),
    }
  }
}
