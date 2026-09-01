"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import type { EquipmentOption } from "@/components/exercises/shared/equipmentField"
import type { GifFileValue } from "@/components/exercises/ExerciseFormDialog/gifFileUpload"
import { CheckIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import { Spinner } from "@/components/primitives/spinner"

import { BulkExerciseEditor } from "./bulkExerciseEditor"
import { CreationShell } from "./creationShell"
import {
  createEmptyDraft,
  isDraftReady,
  revokeDraftGif,
  type CreationMode,
  type DraftExercise,
} from "./drafts"
import { SingleExerciseForm } from "./singleExerciseForm"
import { submitExerciseDraft } from "./submitExercise"

type ExerciseCreationFlowProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions?: Array<string | null | undefined>
  catalogExercises?: CatalogExercise[]
}

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

function subscribeMobileChange(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  mediaQuery.addEventListener("change", onStoreChange)
  return () => mediaQuery.removeEventListener("change", onStoreChange)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function getServerMobileSnapshot() {
  return false
}

export function ExerciseCreationFlow({
  open,
  onOpenChange,
  muscleGroups,
  equipmentOptions = [],
  catalogExercises = [],
}: ExerciseCreationFlowProps) {
  const router = useRouter()
  const isMobile = React.useSyncExternalStore(
    subscribeMobileChange,
    getMobileSnapshot,
    getServerMobileSnapshot
  )

  const [mode, setMode] = React.useState<CreationMode>("single")
  const [drafts, setDrafts] = React.useState<DraftExercise[]>(() => [
    createEmptyDraft(),
  ])
  const [applyGroup, setApplyGroup] =
    React.useState<CatalogMuscleGroup | null>(null)
  const [applyEquipment, setApplyEquipment] =
    React.useState<EquipmentOption | null>(null)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [limitMessage, setLimitMessage] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [progress, setProgress] = React.useState<{
    current: number
    total: number
  } | null>(null)
  const draftsRef = React.useRef(drafts)
  draftsRef.current = drafts

  React.useEffect(() => {
    if (open) return
    for (const draft of draftsRef.current) {
      revokeDraftGif(draft)
    }
    setMode("single")
    setDrafts([createEmptyDraft()])
    setApplyGroup(null)
    setApplyEquipment(null)
    setExpandedId(null)
    setError(null)
    setLimitMessage(null)
    setPending(false)
    setProgress(null)
  }, [open])

  const singleDraft = drafts[0] ?? createEmptyDraft()

  function patchSingle(patch: Partial<DraftExercise>) {
    setDrafts((current) => {
      const first = current[0] ?? createEmptyDraft()
      return [{ ...first, ...patch }]
    })
  }

  function handleGifChange(value: GifFileValue | null) {
    setDrafts((current) => {
      const first = current[0] ?? createEmptyDraft()
      if (first.gif?.previewUrl !== value?.previewUrl) {
        revokeDraftGif(first)
      }
      return [
        {
          ...first,
          gif: value,
          gifStatus: value?.file && value.thumbnailBlob ? "ready" : value ? "ready" : "empty",
          submitError: undefined,
        },
      ]
    })
  }

  function handleModeChange(next: CreationMode) {
    if (next === "single" && drafts.length > 1) return
    setMode(next)
    if (next === "bulk") {
      const first = drafts[0]
      if (
        drafts.length === 1 &&
        first &&
        !first.name.trim() &&
        !first.gif &&
        first.gifStatus === "empty"
      ) {
        setDrafts([])
      }
    }
    if (next === "single" && drafts.length === 0) {
      setDrafts([createEmptyDraft()])
    }
  }

  function firstIncompleteId() {
    return (
      drafts.find((draft) => !isDraftReady(draft, drafts, catalogExercises))
        ?.clientId ?? null
    )
  }

  function reviewIncomplete() {
    const id = firstIncompleteId()
    if (!id) return
    setExpandedId(id)
    const node = document.getElementById(`draft-${id}`)
    node?.scrollIntoView({ block: "center", behavior: "smooth" })
  }

  async function submitSingle() {
    setError(null)
    if (!isDraftReady(singleDraft, drafts, catalogExercises)) {
      if (!singleDraft.muscleGroup) {
        setError(exercisesCatalogCopy.newExerciseGroupRequired)
        return
      }
      if (!singleDraft.gif?.file) {
        setError(exercisesCatalogCopy.newExerciseGifRequired)
        return
      }
      if (singleDraft.gif.file && !singleDraft.gif.thumbnailBlob) {
        setError(exercisesCatalogCopy.newExerciseGifDecodeError)
        return
      }
      setError(exercisesCatalogCopy.bulkNameConflict)
      return
    }
    setPending(true)
    const result = await submitExerciseDraft(singleDraft)
    if (!result.ok) {
      setError(result.error)
      setPending(false)
      return
    }
    onOpenChange(false)
    router.refresh()
  }

  async function submitBulk() {
    setError(null)
    const ready = drafts.filter((draft) =>
      isDraftReady(draft, drafts, catalogExercises)
    )
    if (ready.length === 0 || ready.length !== drafts.length) {
      reviewIncomplete()
      return
    }

    setPending(true)
    setProgress({ current: 0, total: ready.length })
    const failedIds = new Set<string>()

    for (let index = 0; index < ready.length; index += 1) {
      const draft = ready[index]!
      setProgress({ current: index + 1, total: ready.length })
      const result = await submitExerciseDraft(draft)
      if (result.ok) {
        revokeDraftGif(draft)
        setDrafts((current) =>
          current.filter((item) => item.clientId !== draft.clientId)
        )
      } else {
        failedIds.add(draft.clientId)
        setDrafts((current) =>
          current.map((item) =>
            item.clientId === draft.clientId
              ? { ...item, submitError: result.error }
              : item
          )
        )
      }
    }

    setPending(false)
    setProgress(null)
    router.refresh()

    if (failedIds.size === 0) {
      onOpenChange(false)
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (mode === "single") {
      await submitSingle()
      return
    }
    await submitBulk()
  }

  const readyCount = drafts.filter((draft) =>
    isDraftReady(draft, drafts, catalogExercises)
  ).length
  const incompleteCount = drafts.length - readyCount
  const canSubmitSingle = isDraftReady(singleDraft, drafts, catalogExercises)
  const canSubmitBulk =
    drafts.length > 0 && incompleteCount === 0 && readyCount > 0
  const canSubmit = mode === "single" ? canSubmitSingle : canSubmitBulk

  const submitLabel =
    mode === "single"
      ? exercisesCatalogCopy.newExerciseSubmit
      : exercisesCatalogCopy.bulkCreateSubmit(readyCount)

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={pending}
      >
        {exercisesCatalogCopy.newExerciseCancel}
      </Button>
      <div className="ms-auto flex min-w-0 items-center gap-2">
        {mode === "bulk" && incompleteCount > 0 && !pending ? (
          <>
            <p className="hidden max-w-40 truncate text-xs text-amber-700 sm:block dark:text-amber-400">
              {exercisesCatalogCopy.bulkNeedsAttention(incompleteCount)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reviewIncomplete}
            >
              {exercisesCatalogCopy.bulkReview}
            </Button>
          </>
        ) : null}
        <Button
          type="submit"
          form="exercise-creation-form"
          disabled={pending || !canSubmit}
          className="shrink-0"
        >
          {pending ? (
            <>
              <Spinner data-icon="inline-start" className="size-4" />
              {mode === "bulk" && progress
                ? exercisesCatalogCopy.bulkCreating(
                    progress.current,
                    progress.total
                  )
                : exercisesCatalogCopy.newExerciseSaving}
            </>
          ) : (
            <>
              <CheckIcon data-icon="inline-start" aria-hidden />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </>
  )

  return (
    <CreationShell
      open={open}
      onOpenChange={(next) => {
        if (pending && !next) return
        onOpenChange(next)
      }}
      isMobile={isMobile}
      mode={mode}
      onModeChange={handleModeChange}
      canSwitchToSingle={drafts.length <= 1}
      pending={pending}
      footer={footer}
    >
      <form
        id="exercise-creation-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
        aria-busy={pending}
      >
        {mode === "single" ? (
          <SingleExerciseForm
            draft={singleDraft}
            muscleGroups={muscleGroups}
            equipmentOptions={equipmentOptions}
            pending={pending}
            onChange={patchSingle}
            onGifChange={handleGifChange}
            onGifError={setError}
          />
        ) : (
          <BulkExerciseEditor
            drafts={drafts}
            catalog={catalogExercises}
            muscleGroups={muscleGroups}
            equipmentOptions={equipmentOptions}
            isMobile={isMobile}
            pending={pending}
            expandedId={expandedId}
            onExpandedIdChange={setExpandedId}
            onDraftsChange={setDrafts}
            applyGroup={applyGroup}
            applyEquipment={applyEquipment}
            onApplyGroupChange={setApplyGroup}
            onApplyEquipmentChange={setApplyEquipment}
            limitMessage={limitMessage}
            onLimitMessage={setLimitMessage}
          />
        )}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </CreationShell>
  )
}
