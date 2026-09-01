import { json } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"
import {
  workoutIdParamSchema,
  workoutMutationSchema,
  type WorkoutMutationInput,
} from "@/lib/validations/workouts"

import { WorkoutService } from "./workouts.service"

function mapWorkoutMutationError(error: unknown): Response {
  const message = error instanceof Error ? error.message : ""

  if (message.includes("Workout not found")) {
    return json({ error: "Treino não encontrado." }, { status: 404 })
  }
  if (message.includes("Exercise not found")) {
    return json({ error: "Exercício não encontrado." }, { status: 400 })
  }
  if (message.includes("at least one exercise")) {
    return json(
      { error: "Adicione pelo menos um exercício." },
      { status: 400 }
    )
  }
  if (message.includes("Workout has sessions")) {
    return json(
      { error: "Não é possível excluir um treino que já tem sessões." },
      { status: 409 }
    )
  }
  if (message.includes("name must be")) {
    return json({ error: "Nome inválido para o treino." }, { status: 400 })
  }

  return json({ error: "Não foi possível salvar o treino." }, { status: 500 })
}

export const listWorkoutsHandler: ApiHandler = async () => {
  const workouts = await WorkoutService.listWorkouts()
  return json({ workouts })
}

export const getWorkoutHandler: ApiHandler = async (ctx) => {
  const parsed = workoutIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid workout id" }, { status: 400 })
  }

  const workout = await WorkoutService.getWorkoutById(parsed.data.id)
  if (!workout) {
    return json({ error: "Not found" }, { status: 404 })
  }

  return json({ workout })
}

export const createWorkoutHandler: ApiHandler = async (ctx) => {
  const body = ctx.body as WorkoutMutationInput
  try {
    const workout = await WorkoutService.createWorkout(body)
    return json({ workout }, { status: 201 })
  } catch (error) {
    return mapWorkoutMutationError(error)
  }
}

export const updateWorkoutHandler: ApiHandler = async (ctx) => {
  const parsedId = workoutIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsedId.success) {
    return json({ error: "Invalid workout id" }, { status: 400 })
  }

  const body = ctx.body as WorkoutMutationInput
  try {
    const workout = await WorkoutService.updateWorkout({
      id: parsedId.data.id,
      name: body.name,
      exerciseIds: body.exerciseIds,
    })
    return json({ workout })
  } catch (error) {
    return mapWorkoutMutationError(error)
  }
}

export const deleteWorkoutHandler: ApiHandler = async (ctx) => {
  const parsed = workoutIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid workout id" }, { status: 400 })
  }

  try {
    await WorkoutService.deleteWorkout(parsed.data.id)
    return json({ ok: true })
  } catch (error) {
    return mapWorkoutMutationError(error)
  }
}
