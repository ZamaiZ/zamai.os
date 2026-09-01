"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  createWorkoutAction,
  updateWorkoutAction,
} from "@/app/actions/workouts"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { PlusIcon, TagIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import { Label } from "@/components/primitives/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { ExercisePickerDialog } from "@/components/workouts/ExercisePickerDialog"
import { WorkoutExerciseRow } from "@/components/workouts/WorkoutExerciseRow"
import { WorkoutsEmptyState } from "@/components/workouts/WorkoutsEmptyState"
import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import { catalogToPlanExercise } from "@/components/workouts/shared/helpers"
import type {
  EditorDraftExercise,
  PlanWorkout,
} from "@/components/workouts/shared/types"

export type WorkoutEditorReadyState = {
  canSave: boolean
  pending: boolean
  error: string | null
}

export type WorkoutEditorHandle = {
  submit: () => Promise<void>
}

type WorkoutEditorProps = {
  workout?: PlanWorkout
  catalogExercises: CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
  onReadyChange: (state: WorkoutEditorReadyState) => void
  onSuccess: () => void
}

function createClientId() {
  return crypto.randomUUID()
}

function draftsFromWorkout(workout?: PlanWorkout): EditorDraftExercise[] {
  return (workout?.exercises ?? []).map((item) => ({
    clientId: item.id,
    exercise: item.exercise,
  }))
}

export const WorkoutEditor = React.forwardRef<
  WorkoutEditorHandle,
  WorkoutEditorProps
>(function WorkoutEditor(
  { workout, catalogExercises, muscleGroups, onReadyChange, onSuccess },
  ref
) {
  const reduceMotion = useReducedMotion()
  const [name, setName] = React.useState(workout?.name ?? "")
  const [drafts, setDrafts] = React.useState<EditorDraftExercise[]>(() =>
    draftsFromWorkout(workout)
  )
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canSave = name.trim().length > 0 && drafts.length > 0 && !pending
  const workoutId = workout?.id ?? "create"
  const onReadyChangeRef = React.useRef(onReadyChange)
  onReadyChangeRef.current = onReadyChange
  const workoutRef = React.useRef(workout)
  workoutRef.current = workout

  React.useEffect(() => {
    const current = workoutRef.current
    setName(current?.name ?? "")
    setDrafts(draftsFromWorkout(current))
    setPickerOpen(false)
    setPending(false)
    setError(null)
  }, [workoutId])

  React.useEffect(() => {
    onReadyChangeRef.current({ canSave, pending, error })
  }, [canSave, pending, error])

  const handleSave = React.useCallback(async () => {
    if (!(name.trim().length > 0 && drafts.length > 0) || pending) return
    setPending(true)
    setError(null)

    const payload = {
      name: name.trim(),
      exerciseIds: drafts.map((item) => item.exercise.id),
    }

    const result = workout
      ? await updateWorkoutAction({ id: workout.id, ...payload })
      : await createWorkoutAction(payload)

    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }

    onSuccess()
  }, [drafts, name, onSuccess, pending, workout])

  React.useImperativeHandle(ref, () => ({ submit: handleSave }), [handleSave])

  function moveDraft(clientId: string, direction: -1 | 1) {
    setDrafts((current) => {
      const index = current.findIndex((item) => item.clientId === clientId)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current
      }
      const next = [...current]
      const [moved] = next.splice(index, 1)
      next.splice(nextIndex, 0, moved)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Label htmlFor="workout-name">{workoutsCatalogCopy.nameLabel}</Label>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <TagIcon aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            id="workout-name"
            value={name}
            maxLength={80}
            autoComplete="off"
            placeholder={workoutsCatalogCopy.namePlaceholder}
            disabled={pending}
            onChange={(event) => setName(event.target.value)}
          />
        </InputGroup>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              {workoutsCatalogCopy.exercisesHeading}
            </h2>
            <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
              {workoutsCatalogCopy.exercisesCount(drafts.length)}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => setPickerOpen(true)}
          >
            <PlusIcon data-icon="inline-start" aria-hidden />
            {workoutsCatalogCopy.addExercise}
          </Button>
        </div>

        {drafts.length === 0 ? (
          <WorkoutsEmptyState
            variant="editor"
            onCreate={() => setPickerOpen(true)}
          />
        ) : (
          <ol className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {drafts.map((draft, index) => (
                <motion.li
                  key={draft.clientId}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                >
                  <WorkoutExerciseRow
                    index={index}
                    exercise={draft.exercise}
                    disableUp={index === 0 || pending}
                    disableDown={index === drafts.length - 1 || pending}
                    disabled={pending}
                    onMoveUp={() => moveDraft(draft.clientId, -1)}
                    onMoveDown={() => moveDraft(draft.clientId, 1)}
                    onRemove={() =>
                      setDrafts((current) =>
                        current.filter((item) => item.clientId !== draft.clientId)
                      )
                    }
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </section>

      <ExercisePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        catalogExercises={catalogExercises}
        muscleGroups={muscleGroups}
        onSelect={(exercise) => {
          setDrafts((current) => [
            ...current,
            {
              clientId: createClientId(),
              exercise: catalogToPlanExercise(exercise, muscleGroups),
            },
          ])
        }}
      />
    </div>
  )
})

WorkoutEditor.displayName = "WorkoutEditor"

export default WorkoutEditor
