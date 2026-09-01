"use client"

import { EquipmentField } from "@/components/exercises/shared/equipmentField"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { MuscleGroupField } from "@/components/exercises/shared/muscleGroupField"
import { parseEquipmentLabel } from "@/components/exercises/shared/equipmentMeta"
import type { CatalogMuscleGroup } from "@/components/exercises/shared/types"
import {
  CopyIcon,
  RefreshCwIcon,
  TagIcon,
  TrashIcon,
} from "@/components/icons"
import { Button } from "@/components/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { cn } from "@/lib/utils"

import { DraftGifThumb, DraftStatusIcon, MoreHorizontalIcon } from "./draftGifThumb"
import type { DraftExercise } from "./drafts"
import { isDraftReady } from "./drafts"

type BulkExerciseRowProps = {
  draft: DraftExercise
  drafts: DraftExercise[]
  catalogNames: import("@/components/exercises/shared/types").CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
  editing: boolean
  pending: boolean
  onSelect: () => void
  onChange: (patch: Partial<DraftExercise>) => void
  onDuplicate: () => void
  onReplaceGif: () => void
  onRemove: () => void
}

export function BulkExerciseRow({
  draft,
  drafts,
  catalogNames,
  muscleGroups,
  equipmentOptions,
  editing,
  pending,
  onSelect,
  onChange,
  onDuplicate,
  onReplaceGif,
  onRemove,
}: BulkExerciseRowProps) {
  const ready = isDraftReady(draft, drafts, catalogNames)
  const meta = [
    draft.muscleGroup?.name,
    draft.equipment
      ? parseEquipmentLabel(draft.equipment.value)
      : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div
      id={`draft-${draft.clientId}`}
      className={cn(
        "rounded-2xl border border-transparent px-2 py-2 transition-colors",
        "hover:bg-muted/40",
        editing && "border-border/80 bg-muted/30"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-start"
          onClick={onSelect}
          disabled={pending}
        >
          <DraftGifThumb draft={draft} />
          {editing ? (
            <div className="min-w-0 flex-1" onClick={(event) => event.stopPropagation()}>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <TagIcon aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  value={draft.name}
                  onChange={(event) =>
                    onChange({ name: event.target.value, submitError: undefined })
                  }
                  maxLength={120}
                  placeholder={exercisesCatalogCopy.newExerciseNamePlaceholder}
                  disabled={pending}
                  autoFocus
                />
              </InputGroup>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {draft.name || exercisesCatalogCopy.newExerciseNamePlaceholder}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {meta || "—"}
              </p>
              {draft.submitError ? (
                <p className="truncate text-xs text-destructive">
                  {draft.submitError}
                </p>
              ) : null}
            </div>
          )}
        </button>
        <DraftStatusIcon
          ready={ready}
          processing={draft.gifStatus === "processing"}
        />
        <RowMenu
          pending={pending}
          onDuplicate={onDuplicate}
          onReplaceGif={onReplaceGif}
          onRemove={onRemove}
        />
      </div>
      {editing ? (
        <div
          className="mt-3 grid gap-3 ps-14 sm:grid-cols-2"
          onClick={(event) => event.stopPropagation()}
        >
          <MuscleGroupField
            id={`bulk-row-group-${draft.clientId}`}
            muscleGroups={muscleGroups}
            value={draft.muscleGroup}
            onChange={(muscleGroup) =>
              onChange({ muscleGroup, submitError: undefined })
            }
            hideLabel
            disabled={pending}
          />
          <EquipmentField
            id={`bulk-row-equipment-${draft.clientId}`}
            equipmentOptions={equipmentOptions}
            value={draft.equipment}
            onChange={(equipment) =>
              onChange({ equipment, submitError: undefined })
            }
            hideLabel
            disabled={pending}
          />
        </div>
      ) : null}
    </div>
  )
}

function RowMenu({
  pending,
  onDuplicate,
  onReplaceGif,
  onRemove,
}: {
  pending: boolean
  onDuplicate: () => void
  onReplaceGif: () => void
  onRemove: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label={exercisesCatalogCopy.bulkOpenRowMenu}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onDuplicate} disabled={pending}>
            <CopyIcon aria-hidden />
            {exercisesCatalogCopy.bulkDuplicate}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onReplaceGif} disabled={pending}>
            <RefreshCwIcon aria-hidden />
            {exercisesCatalogCopy.bulkReplaceGif}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onRemove}
            disabled={pending}
            variant="destructive"
          >
            <TrashIcon aria-hidden />
            {exercisesCatalogCopy.bulkRemove}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
