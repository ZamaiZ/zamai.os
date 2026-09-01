import type { DraftExercise } from "./drafts"

export async function submitExerciseDraft(
  draft: DraftExercise
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!draft.muscleGroup || !draft.gif?.file || !draft.gif.thumbnailBlob) {
    return { ok: false, error: "Dados incompletos." }
  }

  const form = new FormData()
  form.set("name", draft.name.trim())
  form.set("muscleGroupId", draft.muscleGroup.id)
  if (draft.equipment?.value) {
    form.set("equipment", draft.equipment.value)
  }
  form.set("gif", draft.gif.file)
  form.set(
    "thumbnail",
    new File(
      [draft.gif.thumbnailBlob],
      `${draft.gif.fileName.replace(/\.gif$/i, "")}.jpg`,
      { type: "image/jpeg" }
    )
  )

  try {
    const response = await fetch("/api/exercises", {
      method: "POST",
      body: form,
      credentials: "same-origin",
    })
    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error ?? "Não foi possível salvar o exercício.",
      }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: "Não foi possível salvar o exercício." }
  }
}

export async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  if (items.length === 0) return
  const queue = [...items]
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift()
        if (!item) return
        await worker(item)
      }
    }
  )
  await Promise.all(workers)
}
