"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { PlusIcon } from "@/components/icons"
import { buttonVariants } from "@/components/primitives/button"
import { WorkoutPlanDialog } from "@/components/workouts/WorkoutPlanDialog"
import { WorkoutsCatalog } from "@/components/workouts/WorkoutsCatalog"
import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import {
  parseWorkoutDialog,
  replaceWorkoutDialog,
  type WorkoutDialogState,
} from "@/components/workouts/shared/dialogParams"
import type { PlanWorkout } from "@/components/workouts/shared/types"
import { cn } from "@/lib/utils"

type WorkoutsWorkspaceProps = {
  workouts: PlanWorkout[]
  catalogExercises: CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
}

export function WorkoutsWorkspace({
  workouts,
  catalogExercises,
  muscleGroups,
}: WorkoutsWorkspaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dialog = parseWorkoutDialog(searchParams)

  const setDialog = React.useCallback(
    (next: WorkoutDialogState) => {
      replaceWorkoutDialog(router, pathname, searchParams, next)
    },
    [pathname, router, searchParams]
  )

  function handleSuccess() {
    setDialog({ kind: "closed" })
    router.refresh()
  }

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
            {workoutsCatalogCopy.eyebrow}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-balance">
            {workoutsCatalogCopy.title}
          </h1>
        </div>
        <button
          type="button"
          className={cn(buttonVariants({ size: "sm" }))}
          onClick={() => setDialog({ kind: "create" })}
        >
          <PlusIcon data-icon="inline-start" aria-hidden />
          {workoutsCatalogCopy.newWorkout}
        </button>
      </section>

      <div className="mt-6">
        <WorkoutsCatalog
          workouts={workouts}
          onCreate={() => setDialog({ kind: "create" })}
          onView={(id) => setDialog({ kind: "view", id })}
          onEdit={(id) => setDialog({ kind: "edit", id })}
        />
      </div>

      <WorkoutPlanDialog
        dialog={dialog}
        workouts={workouts}
        catalogExercises={catalogExercises}
        muscleGroups={muscleGroups}
        onClose={() => setDialog({ kind: "closed" })}
        onEdit={(id) => setDialog({ kind: "edit", id })}
        onSuccess={handleSuccess}
      />
    </>
  )
}
