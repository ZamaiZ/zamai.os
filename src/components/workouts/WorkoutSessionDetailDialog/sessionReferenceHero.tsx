"use client"

import { motion, useReducedMotion } from "motion/react"

import { Progress } from "@/components/primitives/progress"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { formatKg } from "@/lib/workouts/sessionFormat"
import type { ResolvedWeightReference } from "@/lib/workouts/weightReferences"

type SessionReferenceHeroProps = {
  volumeKg: number
  reference: ResolvedWeightReference
}

export function SessionReferenceHero({
  volumeKg,
  reference,
}: SessionReferenceHeroProps) {
  const reduceMotion = useReducedMotion()
  const progress = Math.round(reference.progressToNext * 100)

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-semibold tracking-tight text-primary tabular-nums sm:text-5xl"
      >
        {formatKg(volumeKg, 0)}{" "}
        <span className="text-lg font-medium text-muted-foreground">kg</span>
      </motion.p>
      <p className="text-base font-medium">
        <span aria-hidden className="me-1.5 text-xl">
          {reference.current.emoji}
        </span>
        {reference.current.label}
      </p>
      {reference.next ? (
        <div className="w-full max-w-sm">
          <Progress
            value={progress}
            className="flex-col gap-1.5"
            aria-label={workoutSessionCopy.nextMilestone(
              progress,
              reference.next.label
            )}
          >
            <p className="text-[0.7rem] text-muted-foreground">
              {workoutSessionCopy.nextMilestone(progress, reference.next.label)}
            </p>
          </Progress>
        </div>
      ) : null}
    </div>
  )
}
