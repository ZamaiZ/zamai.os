"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { deleteWorkoutAction } from "@/app/actions/workouts"
import { PlayIcon, SearchIcon, XIcon } from "@/components/icons"
import { WorkoutCard } from "@/components/workouts/WorkoutCard"
import { WorkoutsEmptyState } from "@/components/workouts/WorkoutsEmptyState"
import {
  workoutsCatalogCopy,
  workoutSessionCopy,
} from "@/components/workouts/shared/constants"
import type { PlanWorkout } from "@/components/workouts/shared/types"
import { Button } from "@/components/primitives/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/primitives/alertDialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/primitives/inputGroup"

type WorkoutsCatalogProps = {
  workouts: PlanWorkout[]
  onCreate: () => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}

export function WorkoutsCatalog({
  workouts,
  onCreate,
  onView,
  onEdit,
}: WorkoutsCatalogProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [pendingDelete, setPendingDelete] = React.useState<PlanWorkout | null>(
    null
  )
  const [deleting, setDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const activeWorkout = workouts.find((workout) => workout.activeSessionId)

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return workouts
    return workouts.filter((workout) =>
      workout.name.toLowerCase().includes(needle)
    )
  }, [query, workouts])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setError(null)
    const result = await deleteWorkoutAction(pendingDelete.id)
    setDeleting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setPendingDelete(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      {activeWorkout?.activeSessionId ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-primary uppercase">
              {workoutSessionCopy.resumeBanner}
            </p>
            <p className="truncate text-sm font-medium">{activeWorkout.name}</p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              router.push(
                `/lifestyle/workouts/sessions/${activeWorkout.activeSessionId}`
              )
            }
          >
            <PlayIcon data-icon="inline-start" aria-hidden />
            {workoutSessionCopy.resumeBannerCta}
          </Button>
        </div>
      ) : null}
      {workouts.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <SearchIcon aria-hidden className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={workoutsCatalogCopy.searchPlaceholder}
              aria-label={workoutsCatalogCopy.searchPlaceholder}
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  aria-label={workoutsCatalogCopy.emptyClearSearchCta}
                  onClick={() => setQuery("")}
                >
                  <XIcon aria-hidden />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <p className="text-[0.7rem] text-muted-foreground">
            {workoutsCatalogCopy.resultsCount(filtered.length, workouts.length)}
          </p>
        </div>
      ) : null}

      {workouts.length === 0 ? (
        <WorkoutsEmptyState
          variant="none"
          onCreate={onCreate}
        />
      ) : filtered.length === 0 ? (
        <WorkoutsEmptyState variant="search" onClearSearch={() => setQuery("")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onView={() => onView(workout.id)}
              onEdit={() => onEdit(workout.id)}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setPendingDelete(null)
            setError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{workoutsCatalogCopy.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? workoutsCatalogCopy.deleteDescription(pendingDelete.name)
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {workoutsCatalogCopy.deleteCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault()
                void confirmDelete()
              }}
            >
              {deleting
                ? workoutsCatalogCopy.deleting
                : workoutsCatalogCopy.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
