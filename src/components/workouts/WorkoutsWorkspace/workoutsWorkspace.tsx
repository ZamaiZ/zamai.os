"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { HistoryIcon, PlusIcon } from "@/components/icons"
import { Button, buttonVariants } from "@/components/primitives/button"
import { WorkoutHistoryDialog } from "@/components/workouts/WorkoutHistoryDialog"
import { WorkoutLiveDialog } from "@/components/workouts/WorkoutLiveDialog"
import { WorkoutPlanDialog } from "@/components/workouts/WorkoutPlanDialog"
import { WorkoutSessionDetailDialog } from "@/components/workouts/WorkoutSessionDetailDialog"
import { WorkoutsCatalog } from "@/components/workouts/WorkoutsCatalog"
import {
  workoutHistoryCopy,
  workoutsCatalogCopy,
} from "@/components/workouts/shared/constants"
import {
  closeSessionKeepHistory,
  emptyWorkoutUrlState,
  parseWorkoutUrlState,
  replaceWorkoutUrlState,
  withCompletedSession,
  withHistory,
  withHistorySession,
  withLive,
} from "@/components/workouts/shared/workoutUrlState"
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
  const url = parseWorkoutUrlState(searchParams)

  const setUrl = React.useCallback(
    (next: ReturnType<typeof parseWorkoutUrlState>) => {
      replaceWorkoutUrlState(router, pathname, next)
    },
    [pathname, router]
  )

  const handleComplete = React.useCallback(
    (sessionId: string) => {
      setUrl(withCompletedSession(emptyWorkoutUrlState(), sessionId))
    },
    [setUrl]
  )

  function handleSuccess() {
    setUrl(emptyWorkoutUrlState())
    router.refresh()
  }

  const showPlan = url.plan.kind !== "closed" && !url.liveSessionId

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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setUrl(withHistory({ kind: "all" }))}
          >
            <HistoryIcon data-icon="inline-start" aria-hidden />
            {workoutHistoryCopy.title}
          </Button>
          <button
            type="button"
            className={cn(buttonVariants({ size: "sm" }))}
            onClick={() =>
              setUrl({ ...emptyWorkoutUrlState(), plan: { kind: "create" } })
            }
          >
            <PlusIcon data-icon="inline-start" aria-hidden />
            {workoutsCatalogCopy.newWorkout}
          </button>
        </div>
      </section>

      <div className="mt-6">
        <WorkoutsCatalog
          workouts={workouts}
          onCreate={() =>
            setUrl({ ...emptyWorkoutUrlState(), plan: { kind: "create" } })
          }
          onView={(id) =>
            setUrl({ ...emptyWorkoutUrlState(), plan: { kind: "view", id } })
          }
          onEdit={(id) =>
            setUrl({ ...emptyWorkoutUrlState(), plan: { kind: "edit", id } })
          }
          onHistory={(id) =>
            setUrl(withHistory({ kind: "workout", workoutId: id }))
          }
          onResume={(sessionId) => setUrl(withLive(emptyWorkoutUrlState(), sessionId))}
        />
      </div>

      {showPlan ? (
        <WorkoutPlanDialog
          dialog={url.plan}
          workouts={workouts}
          catalogExercises={catalogExercises}
          muscleGroups={muscleGroups}
          onClose={() => setUrl(emptyWorkoutUrlState())}
          onEdit={(id) =>
            setUrl({ ...emptyWorkoutUrlState(), plan: { kind: "edit", id } })
          }
          onSuccess={handleSuccess}
        />
      ) : null}

      <WorkoutLiveDialog
        sessionId={url.liveSessionId}
        onClose={() => {
          setUrl(emptyWorkoutUrlState())
          router.refresh()
        }}
        onComplete={handleComplete}
      />

      <WorkoutHistoryDialog
        filter={url.detailSessionId ? null : url.history}
        workouts={workouts}
        onClose={() => setUrl(emptyWorkoutUrlState())}
        onOpenSession={(sessionId) =>
          setUrl(withHistorySession(url, sessionId))
        }
      />

      <WorkoutSessionDetailDialog
        sessionId={url.liveSessionId ? null : url.detailSessionId}
        onClose={() => {
          if (url.history) {
            setUrl(closeSessionKeepHistory(url))
            return
          }
          setUrl(emptyWorkoutUrlState())
        }}
      />
    </>
  )
}
