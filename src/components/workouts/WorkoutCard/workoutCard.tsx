"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"

import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import { NeonGlowCard } from "@/components/exercises/NeonGlowCard"
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
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
import { Spinner } from "@/components/primitives/spinner"
import { workoutsCatalogCopy, workoutSessionCopy } from "@/components/workouts/shared/constants"
import {
  sequencePreview,
  uniqueMuscleGroups,
} from "@/components/workouts/shared/helpers"
import { startOrResumeWorkoutSession } from "@/components/workouts/shared/startSession"
import type { PlanWorkout } from "@/components/workouts/shared/types"

type WorkoutCardProps = {
  workout: PlanWorkout
  onView: (workout: PlanWorkout) => void
  onEdit: (workout: PlanWorkout) => void
  onDelete: (workout: PlanWorkout) => void
}

export function WorkoutCard({
  workout,
  onView,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [starting, setStarting] = React.useState(false)
  const exercises = workout.exercises.map((item) => item.exercise)
  const groups = uniqueMuscleGroups(exercises)
  const preview = sequencePreview(exercises)

  async function handleStart() {
    setStarting(true)
    try {
      await startOrResumeWorkoutSession(workout, (href) => router.push(href))
    } finally {
      setStarting(false)
    }
  }

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
    >
      <NeonGlowCard className="h-full">
        <article className="flex h-full flex-col gap-3 p-4 pe-3">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => onView(workout)}
              className="min-w-0 flex-1 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <h3 className="truncate text-[0.95rem] font-semibold tracking-tight">
                {workout.name}
              </h3>
              <p className="mt-0.5 text-[0.72rem] font-medium text-muted-foreground">
                {workoutsCatalogCopy.exercisesCount(workout.exercises.length)}
              </p>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={workoutsCatalogCopy.openRowMenu}
                    className="shrink-0"
                  />
                }
              >
                <MoreHorizontalIcon aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => onEdit(workout)}>
                    <PencilIcon aria-hidden />
                    {workoutsCatalogCopy.editMenu}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(workout)}
                  >
                    <TrashIcon aria-hidden />
                    {workoutsCatalogCopy.deleteMenu}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {groups.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[0.65rem] font-medium text-foreground"
                >
                  <MuscleGroupIcon svg={group.iconSvg} className="size-3" />
                  {group.name}
                </li>
              ))}
            </ul>
          ) : null}

          {preview ? (
            <p className="line-clamp-2 text-[0.75rem] leading-5 text-muted-foreground">
              {preview}
            </p>
          ) : null}

          <Button
            type="button"
            size="sm"
            className="mt-auto"
            disabled={starting}
            onClick={() => void handleStart()}
          >
            {starting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" aria-hidden />
            )}
            {starting
              ? workoutSessionCopy.starting
              : workout.activeSessionId
                ? workoutSessionCopy.resume
                : workoutSessionCopy.start}
          </Button>
        </article>
      </NeonGlowCard>
    </motion.div>
  )
}
