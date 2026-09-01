"use client"

import * as React from "react"

import {
  GifFileUpload,
  processGifFile,
} from "@/components/exercises/ExerciseFormDialog/gifFileUpload"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import type { EquipmentOption } from "@/components/exercises/shared/equipmentField"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { PlusIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"

import { ApplyToAllBar } from "./applyToAllBar"
import { BulkExerciseCard } from "./bulkExerciseCard"
import { BulkExerciseRow } from "./bulkExerciseRow"
import {
  createDraftFromFileName,
  createEmptyDraft,
  MAX_BULK_DRAFTS,
  revokeDraftGif,
  type DraftExercise,
  isDraftReady,
} from "./drafts"
import { mapWithConcurrency } from "./submitExercise"

type BulkExerciseEditorProps = {
  drafts: DraftExercise[]
  catalog: CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
  isMobile: boolean
  pending: boolean
  expandedId: string | null
  onExpandedIdChange: (id: string | null) => void
  onDraftsChange: React.Dispatch<React.SetStateAction<DraftExercise[]>>
  applyGroup: CatalogMuscleGroup | null
  applyEquipment: EquipmentOption | null
  onApplyGroupChange: (group: CatalogMuscleGroup | null) => void
  onApplyEquipmentChange: (equipment: EquipmentOption | null) => void
  limitMessage: string | null
  onLimitMessage: (message: string | null) => void
}

export function BulkExerciseEditor({
  drafts,
  catalog,
  muscleGroups,
  equipmentOptions,
  isMobile,
  pending,
  expandedId,
  onExpandedIdChange,
  onDraftsChange,
  applyGroup,
  applyEquipment,
  onApplyGroupChange,
  onApplyEquipmentChange,
  limitMessage,
  onLimitMessage,
}: BulkExerciseEditorProps) {
  const replaceInputRef = React.useRef<HTMLInputElement>(null)
  const replaceTargetRef = React.useRef<string | null>(null)

  const readyCount = drafts.filter((draft) =>
    isDraftReady(draft, drafts, catalog)
  ).length

  function patchDraft(clientId: string, patch: Partial<DraftExercise>) {
    onDraftsChange((current) =>
      current.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item
      )
    )
  }

  async function ingestFiles(files: File[]) {
    onLimitMessage(null)
    let pairs: Array<{ draft: DraftExercise; file: File }> = []
    onDraftsChange((current) => {
      const remaining = MAX_BULK_DRAFTS - current.length
      if (remaining <= 0) {
        onLimitMessage(exercisesCatalogCopy.bulkLimitReached)
        return current
      }
      const accepted = files.slice(0, remaining)
      if (files.length > remaining) {
        onLimitMessage(exercisesCatalogCopy.bulkLimitReached)
      }
      const created = accepted.map((file) =>
        createDraftFromFileName(file.name, {
          muscleGroup: applyGroup,
          equipment: applyEquipment,
        })
      )
      pairs = created.map((draft, index) => ({
        draft,
        file: accepted[index]!,
      }))
      return [...current, ...created]
    })
    await mapWithConcurrency(pairs, 3, async ({ draft, file }) => {
      const result = await processGifFile(file)
      onDraftsChange((current) =>
        current.map((item) => {
          if (item.clientId !== draft.clientId) return item
          if (!result.ok) {
            return {
              ...item,
              gif: null,
              gifStatus: "invalid",
              submitError: result.error,
            }
          }
          return {
            ...item,
            gif: result.value,
            gifStatus: "ready",
            submitError: undefined,
          }
        })
      )
    })
  }

  function addEmpty() {
    onLimitMessage(null)
    if (drafts.length >= MAX_BULK_DRAFTS) {
      onLimitMessage(exercisesCatalogCopy.bulkLimitReached)
      return
    }
    const next = createEmptyDraft({
      muscleGroup: applyGroup,
      equipment: applyEquipment,
    })
    onDraftsChange((current) => [...current, next])
    onExpandedIdChange(next.clientId)
  }

  function duplicateDraft(draft: DraftExercise) {
    if (drafts.length >= MAX_BULK_DRAFTS) {
      onLimitMessage(exercisesCatalogCopy.bulkLimitReached)
      return
    }
    const copy: DraftExercise = {
      ...createEmptyDraft({
        muscleGroup: draft.muscleGroup,
        equipment: draft.equipment,
      }),
      name: draft.name ? `${draft.name} cópia` : "",
      gif: draft.gif
        ? {
            ...draft.gif,
            previewUrl: draft.gif.file
              ? URL.createObjectURL(draft.gif.file)
              : draft.gif.previewUrl,
          }
        : null,
      gifStatus: draft.gifStatus === "ready" ? "ready" : draft.gifStatus,
    }
    onDraftsChange((current) => [...current, copy])
  }

  function removeDraft(clientId: string) {
    onDraftsChange((current) => {
      const target = current.find((item) => item.clientId === clientId)
      if (target) revokeDraftGif(target)
      return current.filter((item) => item.clientId !== clientId)
    })
    if (expandedId === clientId) onExpandedIdChange(null)
  }

  function openReplace(clientId: string) {
    replaceTargetRef.current = clientId
    replaceInputRef.current?.click()
  }

  async function onReplaceFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const clientId = replaceTargetRef.current
    event.target.value = ""
    if (!file || !clientId) return
    patchDraft(clientId, { gifStatus: "processing", submitError: undefined })
    const result = await processGifFile(file)
    onDraftsChange((current) =>
      current.map((item) => {
        if (item.clientId !== clientId) return item
        revokeDraftGif(item)
        if (!result.ok) {
          return {
            ...item,
            gif: null,
            gifStatus: "invalid",
            submitError: result.error,
          }
        }
        return {
          ...item,
          gif: result.value,
          gifStatus: "ready",
          submitError: undefined,
        }
      })
    )
  }

  const hasDrafts = drafts.some(
    (draft) => draft.gif !== null || draft.gifStatus !== "empty"
  )

  return (
    <div className="flex flex-col gap-5">
      <input
        ref={replaceInputRef}
        type="file"
        accept=".gif,image/gif"
        className="sr-only"
        onChange={(event) => void onReplaceFile(event)}
      />
      <GifFileUpload
        id="bulk-gifs"
        value={null}
        onChange={() => undefined}
        onFiles={(files) => void ingestFiles(files)}
        multiple
        compact={hasDrafts}
        hideHelp
        dropTitle={
          hasDrafts
            ? exercisesCatalogCopy.bulkGifAddMore
            : isMobile
              ? exercisesCatalogCopy.bulkGifDropTitleMobile
              : exercisesCatalogCopy.bulkGifDropTitle
        }
        dropHint={
          isMobile
            ? exercisesCatalogCopy.bulkGifDropHintMobile
            : exercisesCatalogCopy.bulkGifDropHint
        }
        disabled={pending}
      />

      <ApplyToAllBar
        muscleGroups={muscleGroups}
        equipmentOptions={equipmentOptions}
        group={applyGroup}
        equipment={applyEquipment}
        onGroupChange={(group) => {
          onApplyGroupChange(group)
          onDraftsChange((current) =>
            current.map((item) => ({
              ...item,
              muscleGroup: group,
              submitError: undefined,
            }))
          )
        }}
        onEquipmentChange={(equipment) => {
          onApplyEquipmentChange(equipment)
          onDraftsChange((current) =>
            current.map((item) => ({
              ...item,
              equipment,
              submitError: undefined,
            }))
          )
        }}
        disabled={pending}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">
            {exercisesCatalogCopy.bulkExercisesHeading}
          </p>
          <p className="text-xs text-muted-foreground">
            {exercisesCatalogCopy.bulkSummary(
              drafts.length,
              readyCount,
              drafts.length - readyCount
            )}
          </p>
        </div>

        {isMobile ? (
          <div className="flex flex-col gap-2">
            {drafts.map((draft) => (
              <BulkExerciseCard
                key={draft.clientId}
                draft={draft}
                drafts={drafts}
                catalog={catalog}
                muscleGroups={muscleGroups}
                equipmentOptions={equipmentOptions}
                expanded={expandedId === draft.clientId}
                pending={pending}
                onToggle={() =>
                  onExpandedIdChange(
                    expandedId === draft.clientId ? null : draft.clientId
                  )
                }
                onChange={(patch) => patchDraft(draft.clientId, patch)}
                onReplaceGif={() => openReplace(draft.clientId)}
                onRemove={() => removeDraft(draft.clientId)}
              />
            ))}
          </div>
        ) : drafts.length > 0 ? (
          <div className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/70">
            {drafts.map((draft) => (
              <BulkExerciseRow
                key={draft.clientId}
                draft={draft}
                drafts={drafts}
                catalogNames={catalog}
                muscleGroups={muscleGroups}
                equipmentOptions={equipmentOptions}
                editing={expandedId === draft.clientId}
                pending={pending}
                onSelect={() =>
                  onExpandedIdChange(
                    expandedId === draft.clientId ? null : draft.clientId
                  )
                }
                onChange={(patch) => patchDraft(draft.clientId, patch)}
                onDuplicate={() => duplicateDraft(draft)}
                onReplaceGif={() => openReplace(draft.clientId)}
                onRemove={() => removeDraft(draft.clientId)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {limitMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {limitMessage}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={addEmpty}
        disabled={pending || drafts.length >= MAX_BULK_DRAFTS}
      >
        <PlusIcon data-icon="inline-start" aria-hidden />
        {exercisesCatalogCopy.bulkAddExercise}
      </Button>
    </div>
  )
}
