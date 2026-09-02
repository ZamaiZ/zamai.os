"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

import { PlayIcon, WeightIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import { Spinner } from "@/components/primitives/spinner"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { WorkoutDialogShell } from "@/components/workouts/WorkoutDialogShell"
import { WorkoutEditorSkeleton } from "@/components/workouts/WorkoutEditorSkeleton"
import { workoutsCatalogCopy, workoutSessionCopy } from "@/components/workouts/shared/constants"
import { startOrResumeWorkoutSession } from "@/components/workouts/shared/startSession"
import type { WorkoutDialogState } from "@/components/workouts/shared/dialogParams"
import type { PlanWorkout } from "@/components/workouts/shared/types"
import type {
  WorkoutEditorHandle,
  WorkoutEditorReadyState,
} from "@/components/workouts/WorkoutEditor"

const WorkoutEditorLazy = dynamic(
  () => import("@/components/workouts/WorkoutEditor/workoutEditor"),
  { ssr: false, loading: () => <WorkoutEditorSkeleton /> }
)

const WorkoutViewLazy = dynamic(
  () => import("@/components/workouts/WorkoutView/workoutView"),
  { ssr: false, loading: () => <WorkoutEditorSkeleton /> }
)

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
      await startOrResumeWorkoutSession(workout, (href) => router.replace(href))
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

  return (
    <WorkoutDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title={copy.title}
      description={copy.description}
      icon={<WeightIcon className="size-5" aria-hidden />}
      size="wide"
      dismissible={!pending}
      footer={footer}
    >
      {body}
      {editorState.error && !missing ? (
        <p className="pt-2 text-sm text-destructive">{editorState.error}</p>
      ) : null}
    </WorkoutDialogShell>
  )
}
