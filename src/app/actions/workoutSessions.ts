"use server"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import { workoutIdParamSchema } from "@/lib/validations/workouts"
import {
  completeWorkoutSessionSchema,
  listSessionHistoryQuerySchema,
  patchWorkoutSessionSetSchema,
  skipWorkoutSessionExerciseSchema,
  workoutSessionIdParamSchema,
} from "@/lib/validations/workoutSessions"
import type {
  WorkoutSessionDetailDto,
  WorkoutSessionDto,
  WorkoutSessionHistoryPage,
} from "@/lib/workouts/session.types"
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

export async function getWorkoutSessionAction(
  sessionId: string
): Promise<SessionMutationResult> {
  await requireAuthenticatedUser()
  const parsedId = workoutSessionIdParamSchema.safeParse({ id: sessionId })
  if (!parsedId.success) {
    return { ok: false, error: "Sessão não encontrada." }
  }

  try {
    const session = await WorkoutSessionService.getSessionById(parsedId.data.id)
    if (!session) {
      return { ok: false, error: "Sessão não encontrada." }
    }
    return { ok: true, session }
  } catch (error) {
    return mapSessionError(error, "Não foi possível carregar a sessão.")
  }
}

export async function getWorkoutSessionDetailAction(
  sessionId: string
): Promise<
  | { ok: true; session: WorkoutSessionDetailDto }
  | { ok: false; error: string }
> {
  await requireAuthenticatedUser()
  const parsedId = workoutSessionIdParamSchema.safeParse({ id: sessionId })
  if (!parsedId.success) {
    return { ok: false, error: "Sessão não encontrada." }
  }

  try {
    const session = await WorkoutSessionService.getSessionDetail(parsedId.data.id)
    if (!session) {
      return { ok: false, error: "Sessão não encontrada." }
    }
    return { ok: true, session }
  } catch {
    return { ok: false, error: "Não foi possível carregar o resumo." }
  }
}

export async function listWorkoutSessionHistoryAction(input: {
  workoutId?: string
  cursor?: { finishedAt: string; id: string }
  limit?: number
}): Promise<
  | { ok: true; page: WorkoutSessionHistoryPage }
  | { ok: false; error: string }
> {
  await requireAuthenticatedUser()
  const parsed = listSessionHistoryQuerySchema.safeParse({
    workoutId: input.workoutId,
    limit: input.limit,
    cursorFinishedAt: input.cursor?.finishedAt,
    cursorId: input.cursor?.id,
  })
  if (!parsed.success) {
    return { ok: false, error: "Filtro de histórico inválido." }
  }

  try {
    const page = await WorkoutSessionService.listSessionHistory({
      workoutId: parsed.data.workoutId,
      limit: parsed.data.limit,
      cursor:
        parsed.data.cursorFinishedAt && parsed.data.cursorId
          ? {
              finishedAt: parsed.data.cursorFinishedAt,
              id: parsed.data.cursorId,
            }
          : undefined,
    })
    return { ok: true, page }
  } catch {
    return { ok: false, error: "Não foi possível carregar o histórico." }
  }
}
