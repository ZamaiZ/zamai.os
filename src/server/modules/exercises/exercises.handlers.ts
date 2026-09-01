import { json, badRequest } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"
import {
  EXERCISE_GIF_MAX_BYTES,
  EXERCISE_THUMBNAIL_MAX_BYTES,
  exerciseIdParamSchema,
  exerciseMutationFieldsSchema,
  listExercisesQuerySchema,
} from "@/lib/validations/exercises"

import { ExerciseService } from "./exercises.service"

export const listMuscleGroupsHandler: ApiHandler = async () => {
  const muscleGroups = await ExerciseService.listMuscleGroups()
  return json({ muscleGroups })
}

export const listExercisesHandler: ApiHandler = async (ctx) => {
  const url = new URL(ctx.request.url)
  const parsed = listExercisesQuerySchema.safeParse({
    muscleGroup: url.searchParams.get("muscleGroup") ?? undefined,
  })

  if (!parsed.success) {
    return json({ error: "Invalid query" }, { status: 400 })
  }

  const exercises = await ExerciseService.listExercises({
    muscleGroupSlug: parsed.data.muscleGroup,
  })
  return json({ exercises })
}

export const getExerciseHandler: ApiHandler = async (ctx) => {
  const parsed = exerciseIdParamSchema.safeParse({ id: ctx.params.id })

  if (!parsed.success) {
    return json({ error: "Invalid exercise id" }, { status: 400 })
  }

  const exercise = await ExerciseService.getExerciseById(parsed.data.id)
  if (!exercise) {
    return json({ error: "Not found" }, { status: 404 })
  }

  return json({ exercise })
}

export const createExerciseHandler: ApiHandler = async (ctx) => {
  const form = await readFormData(ctx.request)
  if (!form) {
    return badRequest("Invalid form data")
  }

  const fields = parseExerciseFields(form)
  if (!fields.ok) {
    return json({ error: fields.error }, { status: 400 })
  }

  const media = parseExerciseMedia(form, { required: true })
  if (!media.ok) {
    return json({ error: media.error }, { status: 400 })
  }

  try {
    const files = await buffersFromFiles(media.gif, media.thumbnail)
    const exercise = await ExerciseService.createExercise({
      name: fields.data.name,
      muscleGroupId: fields.data.muscleGroupId,
      equipment: fields.data.equipment,
      gif: files.gif,
      thumbnail: files.thumbnail,
    })
    return json({ exercise }, { status: 201 })
  } catch (error) {
    return mapExerciseMutationError(error)
  }
}

export const updateExerciseHandler: ApiHandler = async (ctx) => {
  const parsedId = exerciseIdParamSchema.safeParse({ id: ctx.params.id })
  if (!parsedId.success) {
    return json({ error: "Invalid exercise id" }, { status: 400 })
  }

  const form = await readFormData(ctx.request)
  if (!form) {
    return badRequest("Invalid form data")
  }

  const fields = parseExerciseFields(form)
  if (!fields.ok) {
    return json({ error: fields.error }, { status: 400 })
  }

  const hasGif =
    form.get("gif") instanceof File && (form.get("gif") as File).size > 0
  const media = hasGif
    ? parseExerciseMedia(form, { required: true })
    : ({ ok: true as const, gif: undefined, thumbnail: undefined } as const)

  if (!media.ok) {
    return json({ error: media.error }, { status: 400 })
  }

  try {
    const files =
      media.gif && media.thumbnail
        ? await buffersFromFiles(media.gif, media.thumbnail)
        : { gif: undefined, thumbnail: undefined }

    const exercise = await ExerciseService.updateExercise({
      id: parsedId.data.id,
      name: fields.data.name,
      muscleGroupId: fields.data.muscleGroupId,
      equipment: fields.data.equipment,
      gif: files.gif,
      thumbnail: files.thumbnail,
    })
    return json({ exercise })
  } catch (error) {
    return mapExerciseMutationError(error)
  }
}

async function readFormData(request: Request): Promise<FormData | null> {
  try {
    return await request.formData()
  } catch {
    return null
  }
}

function parseExerciseFields(form: FormData) {
  const parsed = exerciseMutationFieldsSchema.safeParse({
    name: String(form.get("name") ?? ""),
    muscleGroupId: String(form.get("muscleGroupId") ?? ""),
    equipment: String(form.get("equipment") ?? "").trim() || undefined,
  })

  if (!parsed.success) {
    return { ok: false as const, error: "Dados inválidos para o exercício." }
  }

  return { ok: true as const, data: parsed.data }
}

function parseExerciseMedia(
  form: FormData,
  options: { required: boolean }
):
  | { ok: true; gif: File; thumbnail: File }
  | { ok: false; error: string } {
  const gif = form.get("gif")
  const thumbnail = form.get("thumbnail")

  if (!(gif instanceof File) || gif.size === 0) {
    return {
      ok: false,
      error: options.required ? "Envie um arquivo GIF." : "GIF inválido.",
    }
  }

  if (!(thumbnail instanceof File) || thumbnail.size === 0) {
    return { ok: false, error: "A miniatura do GIF é obrigatória." }
  }

  const gifName = gif.name.toLowerCase()
  const gifType = gif.type.toLowerCase()
  if (!gifName.endsWith(".gif") && gifType !== "image/gif") {
    return { ok: false, error: "Selecione um arquivo .gif válido." }
  }

  if (gif.size > EXERCISE_GIF_MAX_BYTES) {
    return { ok: false, error: "O GIF deve ter no máximo 5MB." }
  }

  const thumbType = thumbnail.type.toLowerCase()
  if (thumbType !== "image/jpeg" && thumbType !== "image/jpg") {
    return { ok: false, error: "A miniatura deve ser JPEG." }
  }

  if (thumbnail.size > EXERCISE_THUMBNAIL_MAX_BYTES) {
    return { ok: false, error: "A miniatura gerada é grande demais." }
  }

  return { ok: true, gif, thumbnail }
}

async function buffersFromFiles(gif: File, thumbnail: File) {
  const [gifBuffer, thumbBuffer] = await Promise.all([
    gif.arrayBuffer(),
    thumbnail.arrayBuffer(),
  ])

  return {
    gif: Buffer.from(gifBuffer),
    thumbnail: Buffer.from(thumbBuffer),
  }
}

function mapExerciseMutationError(error: unknown): Response {
  const message = error instanceof Error ? error.message : ""

  if (message.includes("already exists")) {
    return json({ error: "Já existe um exercício com este nome." }, { status: 409 })
  }
  if (message.includes("Muscle group not found")) {
    return json({ error: "Grupo muscular não encontrado." }, { status: 400 })
  }
  if (message.includes("Exercise not found")) {
    return json({ error: "Exercício não encontrado." }, { status: 404 })
  }
  if (message.includes("Invalid media") || message.includes("media")) {
    return json({ error: "Mídia inválida. Envie um GIF válido." }, { status: 400 })
  }

  return json({ error: "Não foi possível salvar o exercício." }, { status: 500 })
}
