"use client"

import { EquipmentField } from "@/components/exercises/shared/equipmentField"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { MuscleGroupField } from "@/components/exercises/shared/muscleGroupField"
import { parseEquipmentLabel } from "@/components/exercises/shared/equipmentMeta"
import type { CatalogExercise } from "@/components/exercises/shared/types"
import type { CatalogMuscleGroup } from "@/components/exercises/shared/types"
import { ChevronDownIcon, RefreshCwIcon, TagIcon, TrashIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { Label } from "@/components/primitives/label"
import { cn } from "@/lib/utils"

import { DraftGifThumb, DraftStatusIcon } from "./draftGifThumb"
import type { DraftExercise } from "./drafts"
import { isDraftReady } from "./drafts"

type BulkExerciseCardProps = {
  draft: DraftExercise
  drafts: DraftExercise[]
  catalog: CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
  expanded: boolean
  pending: boolean
  onToggle: () => void
  onChange: (patch: Partial<DraftExercise>) => void
  onReplaceGif: () => void
  onRemove: () => void
}

export function BulkExerciseCard({
  draft,
  drafts,
  catalog,
  muscleGroups,
  equipmentOptions,
  expanded,
  pending,
  onToggle,
  onChange,
  onReplaceGif,
  onRemove,
}: BulkExerciseCardProps) {
  const ready = isDraftReady(draft, drafts, catalog)
  const meta = [
    draft.muscleGroup?.name,
    draft.equipment ? parseEquipmentLabel(draft.equipment.value) : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div
      id={`draft-${draft.clientId}`}
      className="rounded-2xl border border-border/70 bg-card px-3 py-3"
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 text-start"
        onClick={onToggle}
        disabled={pending}
      >
        <DraftGifThumb draft={draft} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {draft.name || exercisesCatalogCopy.newExerciseNamePlaceholder}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {meta || "—"}
          </p>
          {draft.submitError ? (
            <p className="truncate text-xs text-destructive">{draft.submitError}</p>
          ) : null}
        </div>
        <DraftStatusIcon
          ready={ready}
          processing={draft.gifStatus === "processing"}
        />
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`bulk-card-name-${draft.clientId}`}>
              {exercisesCatalogCopy.newExerciseNameLabel}
            </Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <TagIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id={`bulk-card-name-${draft.clientId}`}
                value={draft.name}
                onChange={(event) =>
                  onChange({ name: event.target.value, submitError: undefined })
                }
                maxLength={120}
                disabled={pending}
              />
            </InputGroup>
          </div>
          <MuscleGroupField
            id={`bulk-card-group-${draft.clientId}`}
            muscleGroups={muscleGroups}
            value={draft.muscleGroup}
            onChange={(muscleGroup) =>
              onChange({ muscleGroup, submitError: undefined })
            }
            disabled={pending}
          />
          <EquipmentField
            id={`bulk-card-equipment-${draft.clientId}`}
            equipmentOptions={equipmentOptions}
            value={draft.equipment}
            onChange={(equipment) =>
              onChange({ equipment, submitError: undefined })
            }
            disabled={pending}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onReplaceGif}
              disabled={pending}
            >
              <RefreshCwIcon data-icon="inline-start" aria-hidden />
              {exercisesCatalogCopy.bulkReplaceGif}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-destructive"
              onClick={onRemove}
              disabled={pending}
            >
              <TrashIcon data-icon="inline-start" aria-hidden />
              {exercisesCatalogCopy.bulkRemove}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
