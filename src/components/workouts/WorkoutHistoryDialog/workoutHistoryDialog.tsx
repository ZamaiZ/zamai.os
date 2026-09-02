"use client"

import * as React from "react"

import { listWorkoutSessionHistoryAction } from "@/app/actions/workoutSessions"
import { HistoryIcon } from "@/components/icons"
import { NeonGlowCard } from "@/components/exercises/NeonGlowCard"
import { Button } from "@/components/primitives/button"
import { Skeleton } from "@/components/primitives/skeleton"
import {
  workoutHistoryCopy,
  workoutsCatalogCopy,
} from "@/components/workouts/shared/constants"
import { SessionDeltaChip } from "@/components/workouts/shared/sessionDeltaChip"
import { WorkoutDialogShell } from "@/components/workouts/WorkoutDialogShell"
import {
  formatCompactSessionDate,
  formatKg,
} from "@/lib/workouts/sessionFormat"
import type {
  WorkoutSessionHistoryItem,
  WorkoutSessionHistoryPage,
} from "@/lib/workouts/session.types"
import type { WorkoutHistoryFilter } from "@/components/workouts/shared/workoutUrlState"
import type { PlanWorkout } from "@/components/workouts/shared/types"

type WorkoutHistoryDialogProps = {
  filter: WorkoutHistoryFilter | null
  workouts: PlanWorkout[]
  onClose: () => void
  onOpenSession: (sessionId: string) => void
}

export function WorkoutHistoryDialog({
  filter,
  workouts,
  onClose,
  onOpenSession,
}: WorkoutHistoryDialogProps) {
  const [items, setItems] = React.useState<WorkoutSessionHistoryItem[]>([])
  const [hasMore, setHasMore] = React.useState(false)
  const [cursor, setCursor] = React.useState<
    WorkoutSessionHistoryPage["nextCursor"]
  >(null)
  const [loading, setLoading] = React.useState(false)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  const workoutName =
    filter?.kind === "workout"
      ? workouts.find((item) => item.id === filter.workoutId)?.name
      : undefined

  const loadPage = React.useCallback(
    async (reset: boolean, nextCursor: WorkoutSessionHistoryPage["nextCursor"]) => {
      if (!filter) return
      if (reset) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }
      const result = await listWorkoutSessionHistoryAction({
        workoutId: filter.kind === "workout" ? filter.workoutId : undefined,
        cursor: nextCursor ?? undefined,
        limit: 20,
      })
      if (reset) setLoading(false)
      else setLoadingMore(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setItems((current) =>
        reset ? result.page.items : [...current, ...result.page.items]
      )
      setHasMore(result.page.hasMore)
      setCursor(result.page.nextCursor)
    },
    [filter]
  )

  React.useEffect(() => {
    if (!filter) {
      setItems([])
      setCursor(null)
      setHasMore(false)
      setError(null)
      return
    }
    void loadPage(true, null)
  }, [filter, loadPage])

  React.useEffect(() => {
    if (!hasMore || loading || loadingMore || !filter) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        void loadPage(false, cursor)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, cursor, filter, loadPage])

  const title =
    filter?.kind === "workout"
      ? workoutHistoryCopy.titleFiltered(workoutName ?? workoutsCatalogCopy.viewTitle)
      : workoutHistoryCopy.title
  const description =
    filter?.kind === "workout"
      ? workoutHistoryCopy.descriptionFiltered
      : workoutHistoryCopy.description

  return (
    <WorkoutDialogShell
      open={filter !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={title}
      description={description}
      icon={<HistoryIcon className="size-5" aria-hidden />}
      size="wide"
    >
      {loading ? <HistorySkeleton /> : null}
      {error && items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadPage(true, null)}
          >
            {workoutHistoryCopy.retry}
          </Button>
        </div>
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-medium">{workoutHistoryCopy.emptyTitle}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {workoutHistoryCopy.emptyDescription}
          </p>
        </div>
      ) : null}
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full text-start outline-none"
                onClick={() => onOpenSession(item.id)}
                aria-label={workoutHistoryCopy.openSession}
              >
                <NeonGlowCard>
                  <article className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] text-muted-foreground">
                        {formatCompactSessionDate(item.finishedAt)}
                      </p>
                      {filter?.kind === "all" ? (
                        <p className="mt-0.5 truncate text-sm font-semibold">
                          {item.workoutName}
                        </p>
                      ) : null}
                      <p className="mt-1 text-lg font-semibold tabular-nums">
                        {formatKg(item.metrics.volumeKg, 0)} kg
                        <span className="ms-2 text-base font-medium">
                          {item.weightReference.emoji} {item.weightReference.label}
                        </span>
                      </p>
                    </div>
                    {item.deltaVsPrevious ? (
                      <SessionDeltaChip
                        volumeKg={item.deltaVsPrevious.volumeKg}
                        volumePercent={item.deltaVsPrevious.volumePercent}
                      />
                    ) : (
                      <span className="text-[0.7rem] text-muted-foreground">
                        {workoutHistoryCopy.firstSession}
                      </span>
                    )}
                  </article>
                </NeonGlowCard>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore ? (
        <p className="py-3 text-center text-sm text-muted-foreground">
          {workoutHistoryCopy.loadingMore}
        </p>
      ) : null}
    </WorkoutDialogShell>
  )
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  )
}
