"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/primitives/accordion"
import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import { formatKg } from "@/lib/workouts/sessionFormat"
import type { SessionExerciseComparison } from "@/lib/workouts/session.types"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { SessionDeltaChip } from "@/components/workouts/shared/sessionDeltaChip"
import { SessionSetComparisonRow } from "./sessionSetComparisonRow"

type SessionExerciseAccordionProps = {
  exercises: SessionExerciseComparison[]
}

export function SessionExerciseAccordion({
  exercises,
}: SessionExerciseAccordionProps) {
  if (exercises.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {workoutSessionCopy.breakdownTitle}
      </p>
      <Accordion multiple>
        {exercises.map((exercise) => (
          <AccordionItem
            key={exercise.exerciseIndex}
            value={String(exercise.exerciseIndex)}
          >
            <AccordionTrigger>
              <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
                <span className="truncate font-medium">{exercise.name}</span>
                <span className="flex flex-wrap items-center gap-2 text-[0.7rem] font-normal text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MuscleGroupIcon
                      svg={exercise.muscleGroup.iconSvg}
                      className="size-3"
                    />
                    {exercise.muscleGroup.name}
                  </span>
                  <span className="tabular-nums">
                    {formatKg(exercise.currentVolumeKg, 0)} kg
                  </span>
                  {exercise.volumeDeltaKg !== null ? (
                    <SessionDeltaChip
                      volumeKg={exercise.volumeDeltaKg}
                      volumePercent={null}
                      compact
                    />
                  ) : null}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col divide-y divide-border/60">
                <li className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 pb-1 text-[0.62rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  <span>{workoutSessionCopy.colSet}</span>
                  <span>{workoutSessionCopy.colCurrent}</span>
                  <span>{workoutSessionCopy.colPrevious}</span>
                  <span className="justify-self-end">
                    {workoutSessionCopy.colDelta}
                  </span>
                </li>
                {exercise.sets.map((set) => (
                  <SessionSetComparisonRow key={set.slot} comparison={set} />
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
