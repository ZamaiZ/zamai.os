"use client"

import * as React from "react"

import { ExerciseCreationFlow } from "@/components/exercises/ExerciseCreationFlow"
import { MuscleGroupFormDialog } from "@/components/exercises/MuscleGroupFormDialog"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import {
  ChevronDownIcon,
  MuscularTorsoIcon,
  PlusIcon,
} from "@/components/icons"
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
  catalogExercises?: CatalogExercise[]
}

export function ExercisesPageActions({
  muscleGroups,
  equipmentOptions,
  catalogExercises = [],
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
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      <MuscleGroupFormDialog
        mode="create"
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
      />
      <ExerciseCreationFlow
        open={createExerciseOpen}
        onOpenChange={setCreateExerciseOpen}
        muscleGroups={muscleGroups}
        equipmentOptions={equipmentOptions}
        catalogExercises={catalogExercises}
      />
    </>
  )
}
