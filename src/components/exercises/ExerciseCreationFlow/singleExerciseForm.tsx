"use client"

import {
  GifFileUpload,
  type GifFileValue,
} from "@/components/exercises/ExerciseFormDialog/gifFileUpload"
import { EquipmentField } from "@/components/exercises/shared/equipmentField"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { MuscleGroupField } from "@/components/exercises/shared/muscleGroupField"
import type { CatalogMuscleGroup } from "@/components/exercises/shared/types"
import { TagIcon } from "@/components/icons"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { Label } from "@/components/primitives/label"

import type { DraftExercise } from "./drafts"

type SingleExerciseFormProps = {
  draft: DraftExercise
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
  pending: boolean
  onChange: (patch: Partial<DraftExercise>) => void
  onGifChange: (value: GifFileValue | null) => void
  onGifError: (message: string | null) => void
}

export function SingleExerciseForm({
  draft,
  muscleGroups,
  equipmentOptions,
  pending,
  onChange,
  onGifChange,
  onGifError,
}: SingleExerciseFormProps) {
  return (
    <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="create-exercise-name">
          {exercisesCatalogCopy.newExerciseNameLabel}
        </Label>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <TagIcon aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            id="create-exercise-name"
            value={draft.name}
            onChange={(event) =>
              onChange({ name: event.target.value, submitError: undefined })
            }
            maxLength={120}
            required
            autoComplete="off"
            placeholder={exercisesCatalogCopy.newExerciseNamePlaceholder}
            disabled={pending}
          />
        </InputGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MuscleGroupField
          id="create-exercise-group"
          muscleGroups={muscleGroups}
          value={draft.muscleGroup}
          onChange={(muscleGroup) =>
            onChange({ muscleGroup, submitError: undefined })
          }
          disabled={pending}
        />
        <EquipmentField
          id="create-exercise-equipment"
          equipmentOptions={equipmentOptions}
          value={draft.equipment}
          onChange={(equipment) =>
            onChange({ equipment, submitError: undefined })
          }
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="create-exercise-gif">
          {exercisesCatalogCopy.newExerciseGifLabel}
        </Label>
        <GifFileUpload
          id="create-exercise-gif"
          value={draft.gif}
          onChange={onGifChange}
          onError={onGifError}
          disabled={pending}
        />
      </div>
    </div>
  )
}
