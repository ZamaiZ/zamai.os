"use client"

import { motion, useReducedMotion } from "motion/react"

import { SkipForwardIcon } from "@/components/icons"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { Button } from "@/components/primitives/button"
import { formatElapsedClock } from "@/lib/workouts/sessionFormat"

type WorkoutRestOverlayProps = {
  remainingSeconds: number
  totalSeconds: number
  nextLabel: string
  onSkip: () => void
}

export function WorkoutRestOverlay({
  remainingSeconds,
  totalSeconds,
  nextLabel,
  onSkip,
}: WorkoutRestOverlayProps) {
  const reduceMotion = useReducedMotion()
  const ended = remainingSeconds <= 0
  const progress =
    totalSeconds <= 0 ? 0 : Math.min(1, remainingSeconds / totalSeconds)

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-6"
    >
      <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
        Descanso
      </p>
      <motion.p
        className="font-mono text-5xl font-semibold tabular-nums tracking-tight"
        animate={
          ended && !reduceMotion ? { opacity: [1, 0.45, 1] } : { opacity: 1 }
        }
        transition={
          ended && !reduceMotion
            ? { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
            : undefined
        }
      >
        {formatElapsedClock(remainingSeconds)}
      </motion.p>
      <p className="text-center text-[0.8rem] text-muted-foreground">
        {ended ? workoutSessionCopy.restDone : nextLabel}
      </p>
      <Button
        type="button"
        variant={ended ? "default" : "outline"}
        className="w-full max-w-xs"
        onClick={onSkip}
      >
        {ended ? null : <SkipForwardIcon aria-hidden />}
        {ended ? workoutSessionCopy.startNextSet : workoutSessionCopy.restSkip}
      </Button>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </motion.div>
  )
}
