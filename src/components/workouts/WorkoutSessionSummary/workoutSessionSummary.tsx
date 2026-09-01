"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

import { CircleCheckIcon, HeartPulseIcon, WeightIcon } from "@/components/icons"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { buttonVariants } from "@/components/primitives/button"
import type { WorkoutSessionDto } from "@/lib/workouts/session.types"
import {
  formatDurationMinutes,
  formatKg,
  formatSessionDate,
} from "@/lib/workouts/sessionFormat"
import { cn } from "@/lib/utils"

type WorkoutSessionSummaryProps = {
  session: WorkoutSessionDto
}

export function WorkoutSessionSummary({ session }: WorkoutSessionSummaryProps) {
  const reduceMotion = useReducedMotion()
  const metrics = session.metrics

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 pb-8 text-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary"
      >
        <CircleCheckIcon className="size-8" aria-hidden />
      </motion.div>
      <div>
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
          {workoutSessionCopy.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {workoutSessionCopy.summaryDone}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatSessionDate(session.finishedAt ?? session.startedAt)}
        </p>
        <p className="mt-1 text-sm font-medium">{session.workoutName}</p>
      </div>

      <div>
        <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {workoutSessionCopy.volumeLabel}
        </p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-primary tabular-nums">
          {formatKg(metrics.volumeKg, 0)} kg
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <StatCard
          label={workoutSessionCopy.durationLabel}
          value={
            metrics.durationSeconds === null
              ? "—"
              : formatDurationMinutes(metrics.durationSeconds)
          }
        />
        <StatCard
          label={workoutSessionCopy.setsLabel}
          value={`${metrics.completedSets}/${metrics.plannedSets}`}
        />
        <StatCard
          label={workoutSessionCopy.exercisesLabel}
          value={`${metrics.completedExercises}/${metrics.plannedExercises}`}
        />
        <StatCard
          label={workoutSessionCopy.averageLoadLabel}
          value={
            metrics.averageLoadKg === null
              ? "—"
              : `${formatKg(metrics.averageLoadKg)} kg`
          }
        />
      </div>

      {session.calories || session.avgHeartRate ? (
        <div className="flex w-full flex-wrap justify-center gap-4 text-sm">
          {session.calories ? (
            <p className="inline-flex items-center gap-1.5 text-muted-foreground">
              <WeightIcon className="size-4 text-primary" aria-hidden />
              {session.calories} kcal
            </p>
          ) : null}
          {session.avgHeartRate ? (
            <p className="inline-flex items-center gap-1.5 text-muted-foreground">
              <HeartPulseIcon className="size-4 text-primary" aria-hidden />
              {session.avgHeartRate} bpm
            </p>
          ) : null}
        </div>
      ) : null}

      <Link
        href="/lifestyle/workouts/plans"
        className={cn(buttonVariants({ variant: "ghost" }))}
      >
        {workoutSessionCopy.backToPlans}
      </Link>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/60 px-4 py-3 text-start">
      <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}
