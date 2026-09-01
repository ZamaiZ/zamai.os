"use client"

import * as React from "react"

import {
  ChevronDownIcon,
  DownloadIcon,
  MuscularTorsoIcon,
  PlusIcon,
} from "@/components/icons"
import { ExerciseFormDialog } from "@/components/exercises/ExerciseFormDialog"
import { MuscleGroupFormDialog } from "@/components/exercises/MuscleGroupFormDialog"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import type { CatalogMuscleGroup } from "@/components/exercises/shared/types"
import { Button } from "@/components/primitives/button"
import { ButtonGroup } from "@/components/primitives/buttonGroup"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"

type ExercisesPageActionsProps = {
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
}

export function ExercisesPageActions({
  muscleGroups,
  equipmentOptions,
}: ExercisesPageActionsProps) {
  const [createGroupOpen, setCreateGroupOpen] = React.useState(false)
  const [createExerciseOpen, setCreateExerciseOpen] = React.useState(false)

  return (
    <>
      <ButtonGroup className="w-full shrink-0 sm:w-auto">
        <Button
          variant="default"
          size="sm"
          type="button"
          className="flex-1 sm:flex-none"
          onClick={() => setCreateExerciseOpen(true)}
        >
          <PlusIcon data-icon="inline-start" aria-hidden />
          {exercisesCatalogCopy.newExercise}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="default"
                size="icon-sm"
                aria-label={exercisesCatalogCopy.moreActions}
                className="border-s border-primary-foreground/25"
              />
            }
          >
            <ChevronDownIcon aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setCreateGroupOpen(true)}>
                <MuscularTorsoIcon aria-hidden />
                {exercisesCatalogCopy.newMuscleGroup}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DownloadIcon aria-hidden />
                {exercisesCatalogCopy.importSpreadsheet}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      <MuscleGroupFormDialog
        mode="create"
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
      />
      <ExerciseFormDialog
        mode="create"
        open={createExerciseOpen}
        onOpenChange={setCreateExerciseOpen}
        muscleGroups={muscleGroups}
        equipmentOptions={equipmentOptions}
      />
    </>
  )
}
