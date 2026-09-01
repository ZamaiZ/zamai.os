import type { Metadata } from "next"
import { Suspense } from "react"

import type { CatalogExercise, CatalogMuscleGroup } from "@/components/exercises/shared/types"
import { WorkoutsCatalogSkeleton } from "@/components/workouts/WorkoutsCatalogSkeleton"
import { WorkoutsWorkspace } from "@/components/workouts/WorkoutsWorkspace"
import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import type { PlanWorkout } from "@/components/workouts/shared/types"
import { ExerciseService } from "@/server/modules/exercises"
import { WorkoutService } from "@/server/modules/workouts"

export const metadata: Metadata = {
  title: workoutsCatalogCopy.title,
}

export default async function WorkoutPlansPage() {
  const [workouts, muscleGroups, exercises] = await Promise.all([
    WorkoutService.listWorkouts(),
    ExerciseService.listMuscleGroups(),
    ExerciseService.listExercises(),
  ])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-6 sm:px-8 md:py-8 lg:px-12">
      <Suspense fallback={<WorkoutsCatalogSkeleton />}>
        <WorkoutsWorkspace
          workouts={workouts as PlanWorkout[]}
          muscleGroups={muscleGroups as CatalogMuscleGroup[]}
          catalogExercises={exercises as CatalogExercise[]}
        />
      </Suspense>
    </div>
  )
}
