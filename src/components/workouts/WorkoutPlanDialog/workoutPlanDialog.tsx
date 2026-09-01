"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

import { PlayIcon, WeightIcon, XIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/primitives/drawer"
import { Spinner } from "@/components/primitives/spinner"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { WorkoutEditorSkeleton } from "@/components/workouts/WorkoutEditorSkeleton"
import { workoutsCatalogCopy, workoutSessionCopy } from "@/components/workouts/shared/constants"
import { startOrResumeWorkoutSession } from "@/components/workouts/shared/startSession"
import type { WorkoutDialogState } from "@/components/workouts/shared/dialogParams"
import type { PlanWorkout } from "@/components/workouts/shared/types"
import type {
  WorkoutEditorHandle,
  WorkoutEditorReadyState,
} from "@/components/workouts/WorkoutEditor"
import { cn } from "@/lib/utils"

const WorkoutEditorLazy = dynamic(
  () => import("@/components/workouts/WorkoutEditor/workoutEditor"),
  { ssr: false, loading: () => <WorkoutEditorSkeleton /> }
)

const WorkoutViewLazy = dynamic(
  () => import("@/components/workouts/WorkoutView/workoutView"),
  { ssr: false, loading: () => <WorkoutEditorSkeleton /> }
)

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

function subscribeMobileChange(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  mediaQuery.addEventListener("change", onStoreChange)
  return () => mediaQuery.removeEventListener("change", onStoreChange)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function getServerMobileSnapshot() {
  return false
}

type WorkoutPlanDialogProps = {
  dialog: WorkoutDialogState
  workouts: PlanWorkout[]
  catalogExercises: CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
  onClose: () => void
  onEdit: (id: string) => void
  onSuccess: () => void
}

function shellCopy(dialog: WorkoutDialogState, workout: PlanWorkout | undefined) {
  if (dialog.kind === "create") {
    return {
      title: workoutsCatalogCopy.editorNewTitle,
      description: workoutsCatalogCopy.editorNewDescription,
    }
  }
  if (dialog.kind === "edit") {
    return {
      title: workoutsCatalogCopy.editorEditTitle,
      description: workoutsCatalogCopy.editorEditDescription,
    }
  }
  if (dialog.kind === "view") {
    return {
      title: workout?.name ?? workoutsCatalogCopy.viewTitle,
      description: workoutsCatalogCopy.viewDescription,
    }
  }
  return {
    title: workoutsCatalogCopy.title,
    description: workoutsCatalogCopy.viewDescription,
  }
}

export function WorkoutPlanDialog({
  dialog,
  workouts,
  catalogExercises,
  muscleGroups,
  onClose,
  onEdit,
  onSuccess,
}: WorkoutPlanDialogProps) {
  const router = useRouter()
  const isMobile = React.useSyncExternalStore(
    subscribeMobileChange,
    getMobileSnapshot,
    getServerMobileSnapshot
  )
  const editorRef = React.useRef<WorkoutEditorHandle>(null)
  const [editorState, setEditorState] =
    React.useState<WorkoutEditorReadyState>({
      canSave: false,
      pending: false,
      error: null,
    })

  const [starting, setStarting] = React.useState(false)

  const open = dialog.kind !== "closed"
  const workout =
    dialog.kind === "edit" || dialog.kind === "view"
      ? workouts.find((item) => item.id === dialog.id)
      : undefined
  const missing =
    (dialog.kind === "edit" || dialog.kind === "view") && !workout
  const pending = dialog.kind === "create" || dialog.kind === "edit"
    ? editorState.pending
    : false
  const copy = missing
    ? {
        title: workoutsCatalogCopy.missingWorkoutTitle,
        description: workoutsCatalogCopy.missingWorkoutDescription,
      }
    : shellCopy(dialog, workout)

  React.useEffect(() => {
    if (dialog.kind === "create" || dialog.kind === "edit") return
    setEditorState({ canSave: false, pending: false, error: null })
  }, [dialog])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && pending) return
    if (!nextOpen) onClose()
  }

  const header = (
    <div className="flex items-start gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <WeightIcon className="size-5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pe-8 text-start">
        {isMobile ? (
          <>
            <DrawerTitle>{copy.title}</DrawerTitle>
            <DrawerDescription>{copy.description}</DrawerDescription>
          </>
        ) : (
          <>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </>
        )}
      </div>
      {isMobile ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-4 end-4"
          onClick={() => handleOpenChange(false)}
          disabled={pending}
          aria-label={workoutsCatalogCopy.closeDialog}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  )

  const body = missing ? null : dialog.kind === "view" && workout ? (
    <WorkoutViewLazy workout={workout} />
  ) : dialog.kind === "create" || (dialog.kind === "edit" && workout) ? (
    <WorkoutEditorLazy
      key={dialog.kind === "create" ? "create" : workout?.id}
      ref={editorRef}
      workout={dialog.kind === "edit" ? workout : undefined}
      catalogExercises={catalogExercises}
      muscleGroups={muscleGroups}
      onReadyChange={setEditorState}
      onSuccess={onSuccess}
    />
  ) : null

  async function handleStart(workout: PlanWorkout) {
    setStarting(true)
    try {
      await startOrResumeWorkoutSession(workout, (href) => router.push(href))
    } finally {
      setStarting(false)
    }
  }

  const footer =
    missing || dialog.kind === "view" ? (
      <>
        <Button type="button" variant="outline" onClick={onClose}>
          {workoutsCatalogCopy.closeDialog}
        </Button>
        {dialog.kind === "view" && workout ? (
          <>
            <Button type="button" variant="outline" onClick={() => onEdit(workout.id)}>
              {workoutsCatalogCopy.editFromView}
            </Button>
            <Button
              type="button"
              disabled={starting}
              onClick={() => void handleStart(workout)}
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
          </>
        ) : null}
      </>
    ) : (
      <>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
        >
          {workoutsCatalogCopy.cancel}
        </Button>
        <Button
          type="button"
          disabled={!editorState.canSave}
          onClick={() => void editorRef.current?.submit()}
        >
          {pending ? (
            <>
              <Spinner data-icon="inline-start" />
              {workoutsCatalogCopy.saving}
            </>
          ) : dialog.kind === "edit" ? (
            workoutsCatalogCopy.saveEdit
          ) : (
            workoutsCatalogCopy.saveCreate
          )}
        </Button>
      </>
    )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
        <DrawerContent className="[--drawer-content-max-height:calc(100dvh-0.75rem)]">
          <DrawerHeader className="relative gap-0 pb-3 text-start">
            {header}
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{body}</div>
          {editorState.error && !missing ? (
            <p className="px-4 pb-2 text-sm text-destructive">
              {editorState.error}
            </p>
          ) : null}
          <DrawerFooter className="flex-row flex-wrap gap-2 border-t border-border/60 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!pending}
        className={cn(
          "flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(57.5rem,calc(100vw-2rem))]"
        )}
      >
        <DialogHeader className="shrink-0 gap-0 px-6 pt-6 pb-4">
          {header}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">{body}</div>
        {editorState.error && !missing ? (
          <p className="px-6 pb-2 text-sm text-destructive">{editorState.error}</p>
        ) : null}
        <DialogFooter className="shrink-0 flex-row flex-wrap justify-end gap-2 border-t border-border/60 px-6 py-4">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
