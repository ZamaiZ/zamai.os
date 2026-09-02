"use client"

import * as React from "react"

import { getWorkoutSessionAction } from "@/app/actions/workoutSessions"
import { LightningIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import { Skeleton } from "@/components/primitives/skeleton"
import { workoutsCatalogCopy, workoutSessionCopy } from "@/components/workouts/shared/constants"
import { WorkoutDialogShell } from "@/components/workouts/WorkoutDialogShell"
import { WorkoutSession } from "@/components/workouts/WorkoutSession"
import type { WorkoutSessionDto } from "@/lib/workouts/session.types"

type WorkoutLiveDialogProps = {
  sessionId: string | null
  onClose: () => void
  onComplete: (sessionId: string) => void
}

export function WorkoutLiveDialog({
  sessionId,
  onClose,
  onComplete,
}: WorkoutLiveDialogProps) {
  const [session, setSession] = React.useState<WorkoutSessionDto | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!sessionId) {
      setSession(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void getWorkoutSessionAction(sessionId).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        setSession(null)
        return
      }
      if (result.session.status === "completed") {
        onComplete(result.session.id)
        return
      }
      setSession(result.session)
    })
    return () => {
      cancelled = true
    }
  }, [sessionId, onComplete])

  return (
    <WorkoutDialogShell
      open={sessionId !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={session?.workoutName ?? workoutSessionCopy.liveTitle}
      description={workoutSessionCopy.liveTitle}
      icon={<LightningIcon className="size-5" aria-hidden />}
      size="fullscreen"
      hideHeader
    >
      {loading ? <LiveSkeleton /> : null}
      {error ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" onClick={onClose}>
            {workoutsCatalogCopy.closeDialog}
          </Button>
        </div>
      ) : null}
      {session && session.status === "in_progress" ? (
        <WorkoutSession
          session={session}
          onComplete={onComplete}
          onDiscarded={onClose}
        />
      ) : null}
    </WorkoutDialogShell>
  )
}

function LiveSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
