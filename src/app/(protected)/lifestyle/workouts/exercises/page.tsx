import type { Metadata } from "next"

import { ExercisesCatalog } from "@/components/exercises/ExercisesCatalog"
import { ExercisesPageActions } from "@/components/exercises/ExercisesPageActions"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { ExerciseService } from "@/server/modules/exercises"

export const metadata: Metadata = {
  title: exercisesCatalogCopy.title,
}

export default async function ExercisesPage() {
  const [muscleGroups, exercises] = await Promise.all([
    ExerciseService.listMuscleGroups(),
    ExerciseService.listExercises(),
  ])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-6 sm:px-8 md:py-8 lg:px-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
            {exercisesCatalogCopy.eyebrow}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-balance">
            {exercisesCatalogCopy.title}
          </h1>
        </div>

        <ExercisesPageActions
          muscleGroups={muscleGroups}
          equipmentOptions={exercises.map((exercise) => exercise.equipment)}
          catalogExercises={exercises}
        />
      </section>

      <div className="mt-6">
        <ExercisesCatalog
          exercises={exercises}
          muscleGroups={muscleGroups}
        />
      </div>
    </div>
  )
}
