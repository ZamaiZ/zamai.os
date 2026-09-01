import type { GifFileValue } from "@/components/exercises/ExerciseFormDialog/gifFileUpload"
import type { EquipmentOption } from "@/components/exercises/shared/equipmentField"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"

import { filenameToExerciseName } from "./filenameToExerciseName"

export const MAX_BULK_DRAFTS = 20

export type CreationMode = "single" | "bulk"

export type DraftGifStatus = "empty" | "processing" | "ready" | "invalid"

export type DraftExercise = {
  clientId: string
  name: string
  muscleGroup: CatalogMuscleGroup | null
  equipment: EquipmentOption | null
  gif: GifFileValue | null
  gifStatus: DraftGifStatus
  submitError?: string
}

export function createEmptyDraft(
  defaults?: Partial<Pick<DraftExercise, "muscleGroup" | "equipment">>
): DraftExercise {
  return {
    clientId: crypto.randomUUID(),
    name: "",
    muscleGroup: defaults?.muscleGroup ?? null,
    equipment: defaults?.equipment ?? null,
    gif: null,
    gifStatus: "empty",
  }
}

export function createDraftFromFileName(
  fileName: string,
  defaults?: Partial<Pick<DraftExercise, "muscleGroup" | "equipment">>
): DraftExercise {
  return {
    ...createEmptyDraft(defaults),
    name: filenameToExerciseName(fileName),
    gifStatus: "processing",
  }
}

export function toExerciseSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function revokeDraftGif(draft: DraftExercise) {
  const url = draft.gif?.previewUrl
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}

export function getDraftBlocker(
  draft: DraftExercise,
  drafts: DraftExercise[],
  catalog: CatalogExercise[]
): string | null {
  if (draft.gifStatus === "processing") {
    return "processing"
  }
  if (draft.gifStatus === "invalid") {
    return draft.submitError ?? "invalid-gif"
  }
  if (!draft.gif?.file || !draft.gif.thumbnailBlob) {
    return "missing-gif"
  }
  const name = draft.name.trim()
  if (!name) {
    return "missing-name"
  }
  const slug = toExerciseSlug(name)
  if (!slug) {
    return "missing-name"
  }
  if (!draft.muscleGroup) {
    return "missing-group"
  }
  const catalogConflict = catalog.some(
    (item) => item.slug === slug || item.name.trim().toLowerCase() === name.toLowerCase()
  )
  if (catalogConflict) {
    return "name-conflict"
  }
  const duplicateInBatch = drafts.some(
    (item) =>
      item.clientId !== draft.clientId &&
      toExerciseSlug(item.name.trim()) === slug
  )
  if (duplicateInBatch) {
    return "name-conflict"
  }
  if (draft.submitError) {
    return "submit-error"
  }
  return null
}

export function isDraftReady(
  draft: DraftExercise,
  drafts: DraftExercise[],
  catalog: CatalogExercise[]
): boolean {
  return getDraftBlocker(draft, drafts, catalog) === null
}
