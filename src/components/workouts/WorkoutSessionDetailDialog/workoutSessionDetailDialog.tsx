"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { getWorkoutSessionDetailAction } from "@/app/actions/workoutSessions"
import { CircleCheckIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import { Skeleton } from "@/components/primitives/skeleton"
import {
  workoutsCatalogCopy,
  workoutSessionCopy,
} from "@/components/workouts/shared/constants"
import { SessionDeltaChip } from "@/components/workouts/shared/sessionDeltaChip"
import { WorkoutDialogShell } from "@/components/workouts/WorkoutDialogShell"
import {
  formatDurationMinutes,
  formatKg,
  formatSessionDate,
} from "@/lib/workouts/sessionFormat"
import type { WorkoutSessionDetailDto } from "@/lib/workouts/session.types"

import { SessionExerciseAccordion } from "./sessionExerciseAccordion"
import { SessionReferenceHero } from "./sessionReferenceHero"

type WorkoutSessionDetailDialogProps = {
  sessionId: string | null
  onClose: () => void
}

export function WorkoutSessionDetailDialog({
  sessionId,
  onClose,
}: WorkoutSessionDetailDialogProps) {
  const reduceMotion = useReducedMotion()
  const [session, setSession] = React.useState<WorkoutSessionDetailDto | null>(
    null
  )
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback((id: string) => {
    setLoading(true)
    setError(null)
    void getWorkoutSessionDetailAction(id).then((result) => {
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        setSession(null)
        return
      }
      setSession(result.session)
    })
  }, [])

  React.useEffect(() => {
    if (!sessionId) {
      setSession(null)
      setError(null)
      return
    }
    load(sessionId)
  }, [sessionId, load])

  const metrics = session?.metrics
  const comparison = session?.comparison

  return (
    <WorkoutDialogShell
      open={sessionId !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={session?.workoutName ?? workoutSessionCopy.summaryTitle}
      description={
        session
          ? formatSessionDate(session.finishedAt ?? session.startedAt)
          : workoutSessionCopy.summaryDone
      }
      icon={<CircleCheckIcon className="size-5" aria-hidden />}
      size="wide"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          {workoutsCatalogCopy.closeDialog}
        </Button>
      }
    >
      {loading ? <DetailSkeleton /> : null}
      {error ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          {sessionId ? (
            <Button type="button" variant="outline" onClick={() => load(sessionId)}>
              {workoutSessionCopy.retry}
            </Button>
          ) : null}
        </div>
      ) : null}
      {session && metrics && comparison ? (
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-7 pb-4 text-center">
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
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {workoutSessionCopy.summaryDone}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatSessionDate(session.finishedAt ?? session.startedAt)}
            </p>
          </div>

          <SessionReferenceHero
            volumeKg={metrics.volumeKg}
            reference={comparison.weightReference}
          />

          {comparison.delta ? (
            <SessionDeltaChip
              volumeKg={comparison.delta.volumeKg}
              volumePercent={comparison.delta.volumePercent}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {workoutSessionCopy.firstExecution}
            </p>
          )}

          <div className="grid w-full grid-cols-2 gap-3 text-start">
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

          <div className="w-full text-start">
            <SessionExerciseAccordion exercises={comparison.exercises} />
          </div>
        </div>
      ) : null}
    </WorkoutDialogShell>
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

function DetailSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-12 w-48" />
      <div className="grid w-full grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  )
}
