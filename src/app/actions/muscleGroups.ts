"use server"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import {
  createMuscleGroupSchema,
  updateMuscleGroupSchema,
} from "@/lib/validations/exercises"
import {
  ExerciseService,
  type MuscleGroupDto,
} from "@/server/modules/exercises"

export type MuscleGroupMutationResult =
  | { ok: true; muscleGroup: MuscleGroupDto }
  | { ok: false; error: string }

/** @deprecated Prefer MuscleGroupMutationResult */
export type CreateMuscleGroupResult = MuscleGroupMutationResult

function mapMuscleGroupError(error: unknown, fallback: string): string {
  const message =
    error instanceof Error ? error.message : "Unable to mutate muscle group"

  if (message.includes("already exists")) {
    return "Já existe um grupo com este nome."
  }
  if (message.includes("not found")) {
    return "Grupo muscular não encontrado."
  }
  if (message.includes("SVG") || message.includes("icon")) {
    return "SVG inválido. Envie um arquivo .svg simples."
  }

  return fallback
}

export async function createMuscleGroupAction(input: {
  name: string
  iconSvg: string
}): Promise<MuscleGroupMutationResult> {
  await requireAuthenticatedUser()

  const parsed = createMuscleGroupSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos para o grupo muscular." }
  }

  try {
    const muscleGroup = await ExerciseService.createMuscleGroup({
      name: parsed.data.name,
      iconSvgRaw: parsed.data.iconSvg,
    })
    return { ok: true, muscleGroup }
  } catch (error) {
    return {
      ok: false,
      error: mapMuscleGroupError(
        error,
        "Não foi possível criar o grupo muscular."
      ),
    }
  }
}

export async function updateMuscleGroupAction(input: {
  id: string
  name: string
  iconSvg: string
}): Promise<MuscleGroupMutationResult> {
  await requireAuthenticatedUser()

  const parsed = updateMuscleGroupSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos para o grupo muscular." }
  }

  try {
    const muscleGroup = await ExerciseService.updateMuscleGroup({
      id: parsed.data.id,
      name: parsed.data.name,
      iconSvgRaw: parsed.data.iconSvg,
    })
    return { ok: true, muscleGroup }
  } catch (error) {
    return {
      ok: false,
      error: mapMuscleGroupError(
        error,
        "Não foi possível atualizar o grupo muscular."
      ),
    }
  }
}
