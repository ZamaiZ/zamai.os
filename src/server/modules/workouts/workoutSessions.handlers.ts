import { json } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"
import { workoutIdParamSchema } from "@/lib/validations/workouts"
import {
  completeWorkoutSessionSchema,
  patchWorkoutSessionSetSchema,
  skipWorkoutSessionExerciseSchema,
  workoutSessionIdParamSchema,
  type CompleteWorkoutSessionInput,
  type PatchWorkoutSessionSetInput,
  type SkipWorkoutSessionExerciseInput,
} from "@/lib/validations/workoutSessions"

import {
  SessionInProgressError,
  WorkoutSessionService,
} from "./workoutSessions.service"

function mapSessionError(error: unknown): Response {
  if (error instanceof SessionInProgressError) {
    return json(
      {
        error: "Já existe um treino em andamento.",
        sessionId: error.sessionId,
      },
      { status: 409 }
    )
  }

  const message = error instanceof Error ? error.message : ""

  if (message.includes("Workout not found") || message.includes("Session not found") || message.includes("Set not found")) {
    return json({ error: "Não encontrado." }, { status: 404 })
  }
  if (message.includes("not in progress")) {
    return json({ error: "Esta sessão já foi encerrada." }, { status: 409 })
  }
  if (message.includes("at least one exercise")) {
    return json(
      { error: "Adicione pelo menos um exercício." },
      { status: 400 }
    )
  }

  return json({ error: "Não foi possível atualizar a sessão." }, { status: 500 })
}

export const createWorkoutSessionHandler: ApiHandler = async (ctx) => {
  const parsed = workoutIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid workout id" }, { status: 400 })
  }

  try {
    const session = await WorkoutSessionService.createSession(parsed.data.id)
    return json({ session }, { status: 201 })
  } catch (error) {
    return mapSessionError(error)
  }
}

export const getWorkoutSessionHandler: ApiHandler = async (ctx) => {
  const parsed = workoutSessionIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid session id" }, { status: 400 })
  }

  const session = await WorkoutSessionService.getSessionById(parsed.data.id)
  if (!session) {
    return json({ error: "Not found" }, { status: 404 })
  }
  return json({ session })
}

export const patchWorkoutSessionSetHandler: ApiHandler = async (ctx) => {
  const parsed = workoutSessionIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid session id" }, { status: 400 })
  }

  const body = ctx.body as PatchWorkoutSessionSetInput
  try {
    const session = await WorkoutSessionService.patchSet(parsed.data.id, body)
    return json({ session })
  } catch (error) {
    return mapSessionError(error)
  }
}

export const skipWorkoutSessionExerciseHandler: ApiHandler = async (ctx) => {
  const parsed = workoutSessionIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid session id" }, { status: 400 })
  }

  const body = ctx.body as SkipWorkoutSessionExerciseInput
  try {
    const session = await WorkoutSessionService.skipExercise(
      parsed.data.id,
      body.exerciseIndex
    )
    return json({ session })
  } catch (error) {
    return mapSessionError(error)
  }
}

export const completeWorkoutSessionHandler: ApiHandler = async (ctx) => {
  const parsed = workoutSessionIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid session id" }, { status: 400 })
  }

  const body = ctx.body as CompleteWorkoutSessionInput
  try {
    const session = await WorkoutSessionService.completeSession(
      parsed.data.id,
      body
    )
    return json({ session })
  } catch (error) {
    return mapSessionError(error)
  }
}

export const discardWorkoutSessionHandler: ApiHandler = async (ctx) => {
  const parsed = workoutSessionIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsed.success) {
    return json({ error: "Invalid session id" }, { status: 400 })
  }

  try {
    await WorkoutSessionService.discardSession(parsed.data.id)
    return json({ ok: true })
  } catch (error) {
    return mapSessionError(error)
  }
}
