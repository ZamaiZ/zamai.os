"use client"

import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import type { PlanWorkout } from "@/components/workouts/shared/types"
import { WorkoutExerciseRow } from "@/components/workouts/WorkoutExerciseRow"

type WorkoutViewProps = {
  workout: PlanWorkout
}

export function WorkoutView({ workout }: WorkoutViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[0.72rem] text-muted-foreground">
        {workoutsCatalogCopy.exercisesCount(workout.exercises.length)}
      </p>
      <ol className="flex flex-col gap-2.5">
        {workout.exercises.map((item, index) => (
          <li key={item.id}>
            <WorkoutExerciseRow
              index={index}
              exercise={item.exercise}
              readOnly
            />
          </li>
        ))}
      </ol>
    </div>
  )
}

export default WorkoutView
