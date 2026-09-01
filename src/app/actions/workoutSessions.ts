"use server"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import { workoutIdParamSchema } from "@/lib/validations/workouts"
import {
  completeWorkoutSessionSchema,
  patchWorkoutSessionSetSchema,
  skipWorkoutSessionExerciseSchema,
  workoutSessionIdParamSchema,
} from "@/lib/validations/workoutSessions"
import type { WorkoutSessionDto } from "@/lib/workouts/session.types"
import {
  SessionInProgressError,
  WorkoutSessionService,
} from "@/server/modules/workouts"

export type SessionMutationResult =
  | { ok: true; session: WorkoutSessionDto }
  | { ok: false; error: string; inProgressSessionId?: string }

export type SessionDeleteResult =
  | { ok: true }
  | { ok: false; error: string }

function mapSessionError(error: unknown, fallback: string): SessionMutationResult {
  if (error instanceof SessionInProgressError) {
    return {
      ok: false,
      error: "Já existe um treino em andamento.",
      inProgressSessionId: error.sessionId,
    }
  }

  const message = error instanceof Error ? error.message : ""
  if (message.includes("Workout not found") || message.includes("Session not found")) {
    return { ok: false, error: "Sessão não encontrada." }
  }
  if (message.includes("Set not found")) {
    return { ok: false, error: "Série não encontrada." }
  }
  if (message.includes("not in progress")) {
    return { ok: false, error: "Esta sessão já foi encerrada." }
  }
  if (message.includes("at least one exercise")) {
    return { ok: false, error: "Adicione pelo menos um exercício." }
  }

  return { ok: false, error: fallback }
}

export async function startWorkoutSessionAction(
  workoutId: string
): Promise<SessionMutationResult> {
  await requireAuthenticatedUser()
  const parsed = workoutIdParamSchema.safeParse({ id: workoutId })
  if (!parsed.success) {
    return { ok: false, error: "Treino não encontrado." }
  }

  try {
    const session = await WorkoutSessionService.createSession(parsed.data.id)
    return { ok: true, session }
  } catch (error) {
    return mapSessionError(error, "Não foi possível iniciar o treino.")
  }
}

export async function patchWorkoutSessionSetAction(input: {
  sessionId: string
  exerciseIndex: number
  slot: number
  status: "pending" | "completed" | "skipped"
  weightKg?: number
  reps?: number
}): Promise<SessionMutationResult> {
  await requireAuthenticatedUser()
  const parsedId = workoutSessionIdParamSchema.safeParse({
    id: input.sessionId,
  })
  const parsed = patchWorkoutSessionSetSchema.safeParse({
    exerciseIndex: input.exerciseIndex,
    slot: input.slot,
    status: input.status,
    weightKg: input.weightKg,
    reps: input.reps,
  })
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: "Dados inválidos para a série." }
  }

  try {
    const session = await WorkoutSessionService.patchSet(
      parsedId.data.id,
      parsed.data
    )
    return { ok: true, session }
  } catch (error) {
    return mapSessionError(error, "Não foi possível salvar a série.")
  }
}

export async function skipWorkoutSessionExerciseAction(input: {
  sessionId: string
  exerciseIndex: number
}): Promise<SessionMutationResult> {
  await requireAuthenticatedUser()
  const parsedId = workoutSessionIdParamSchema.safeParse({
    id: input.sessionId,
  })
  const parsed = skipWorkoutSessionExerciseSchema.safeParse({
    exerciseIndex: input.exerciseIndex,
  })
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: "Dados inválidos." }
  }

  try {
    const session = await WorkoutSessionService.skipExercise(
      parsedId.data.id,
      parsed.data.exerciseIndex
    )
    return { ok: true, session }
  } catch (error) {
    return mapSessionError(error, "Não foi possível pular o exercício.")
  }
}

export async function completeWorkoutSessionAction(input: {
  sessionId: string
  calories?: number
  avgHeartRate?: number
}): Promise<SessionMutationResult> {
  await requireAuthenticatedUser()
  const parsedId = workoutSessionIdParamSchema.safeParse({
    id: input.sessionId,
  })
  const parsed = completeWorkoutSessionSchema.safeParse({
    calories: input.calories,
    avgHeartRate: input.avgHeartRate,
  })
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: "Dados inválidos para encerrar o treino." }
  }

  try {
    const session = await WorkoutSessionService.completeSession(
      parsedId.data.id,
      parsed.data
    )
    return { ok: true, session }
  } catch (error) {
    return mapSessionError(error, "Não foi possível encerrar o treino.")
  }
}

export async function discardWorkoutSessionAction(
  sessionId: string
): Promise<SessionDeleteResult> {
  await requireAuthenticatedUser()
  const parsedId = workoutSessionIdParamSchema.safeParse({ id: sessionId })
  if (!parsedId.success) {
    return { ok: false, error: "Sessão não encontrada." }
  }

  try {
    await WorkoutSessionService.discardSession(parsedId.data.id)
    return { ok: true }
  } catch (error) {
    const mapped = mapSessionError(error, "Não foi possível descartar o treino.")
    return { ok: false, error: mapped.error }
  }
}
