"use client"

import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import { NeonGlowCard } from "@/components/exercises/NeonGlowCard"
import { CheckIcon, LightningIcon, XIcon } from "@/components/icons"
import { WorkoutRestOverlay } from "@/components/workouts/WorkoutRestOverlay"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { Button } from "@/components/primitives/button"
import { Input } from "@/components/primitives/input"
import { Spinner } from "@/components/primitives/spinner"
import { formatPrevious } from "@/lib/workouts/sessionFormat"
import {
  WORKOUT_SET_PROTOCOL,
  formatProtocolSetLabel,
} from "@/lib/workouts/setProtocol"
import type {
  SessionExerciseSnapshot,
  WorkoutSessionSetDto,
} from "@/lib/workouts/session.types"
import { cn } from "@/lib/utils"

type Draft = { weight: string; reps: string }

type RestView = {
  remaining: number
  total: number
  nextLabel: string
}

type WorkoutSessionExerciseCardProps = {
  exercise: SessionExerciseSnapshot
  sets: WorkoutSessionSetDto[]
  drafts: Record<string, Draft>
  pendingKeys: Set<string>
  rest: RestView | null
  disabled?: boolean
  skipping?: boolean
  onDraftChange: (key: string, field: keyof Draft, value: string) => void
  onComplete: (set: WorkoutSessionSetDto) => void
  onUndo: (set: WorkoutSessionSetDto) => void
  onSkipSet: (set: WorkoutSessionSetDto) => void
  onSkipExercise: () => void
  onDismissRest: () => void
}

function draftKey(set: WorkoutSessionSetDto): string {
  return `${set.exerciseIndex}:${set.slot}`
}

export function WorkoutSessionExerciseCard({
  exercise,
  sets,
  drafts,
  pendingKeys,
  rest,
  disabled = false,
  skipping = false,
  onDraftChange,
  onComplete,
  onUndo,
  onSkipSet,
  onSkipExercise,
  onDismissRest,
}: WorkoutSessionExerciseCardProps) {
  const completed = sets.filter((set) => set.status === "completed").length
  const allSkipped =
    sets.length > 0 && sets.every((set) => set.status === "skipped")
  const hasPending = sets.some((set) => set.status === "pending")
  const activePendingSlot = sets.find((set) => set.status === "pending")?.slot
  const heroUrl = exercise.gifUrl ?? exercise.thumbnailUrl

  return (
    <NeonGlowCard disabled={allSkipped} className={cn(allSkipped && "opacity-70")}>
      <article className="flex flex-col gap-4 p-4">
        <header className="flex items-start gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted/50">
            {heroUrl ? (
              <img
                src={heroUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <LightningIcon aria-hidden className="size-5 opacity-60" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[0.95rem] font-semibold tracking-tight">
              {exercise.name}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-[0.72rem] font-medium text-primary">
              <MuscleGroupIcon
                svg={exercise.muscleGroup.iconSvg}
                className="size-3"
              />
              {exercise.muscleGroup.name}
            </p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground">
              {workoutSessionCopy.progress(completed, 6)}
              {allSkipped ? ` · ${workoutSessionCopy.skippedBadge}` : ""}
            </p>
          </div>
          {hasPending && !rest ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={onSkipExercise}
            >
              {skipping ? (
                <>
                  <Spinner data-icon="inline-start" />
                  {workoutSessionCopy.skippingExercise}
                </>
              ) : (
                workoutSessionCopy.skipExercise
              )}
            </Button>
          ) : null}
        </header>

        {rest ? (
          <WorkoutRestOverlay
            remainingSeconds={rest.remaining}
            totalSeconds={rest.total}
            nextLabel={rest.nextLabel}
            onSkip={onDismissRest}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {sets.map((set) => {
              const key = draftKey(set)
              const protocol = WORKOUT_SET_PROTOCOL[set.slot - 1]!
              const draft = drafts[key] ?? { weight: "", reps: "" }
              const busy = pendingKeys.has(key)
              const locked = set.status !== "pending" || disabled
              const isActive = set.status === "pending" && set.slot === activePendingSlot
              const canComplete =
                set.status === "pending" &&
                Number(draft.weight.replace(",", ".")) >= 0 &&
                draft.weight.trim() !== "" &&
                Number.parseInt(draft.reps, 10) >= 1

              return (
                <li
                  key={key}
                  className={cn(
                    "rounded-2xl border px-3 py-2.5",
                    set.status === "skipped" && "opacity-50",
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-muted/20"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-mono text-[0.75rem] font-medium">
                      {formatProtocolSetLabel(protocol)}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      {workoutSessionCopy.colPrevious}{" "}
                      {set.previous
                        ? formatPrevious(set.previous.weightKg, set.previous.reps)
                        : workoutSessionCopy.previousEmpty}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      inputMode="decimal"
                      value={draft.weight}
                      disabled={locked || busy}
                      placeholder={workoutSessionCopy.colKg}
                      data-session-field={`${key}-weight`}
                      aria-label={`${workoutSessionCopy.colKg} ${set.slot}`}
                      className={cn(
                        "min-w-0 flex-1 rounded-xl text-center tabular-nums",
                        isActive ? "h-11" : "h-9"
                      )}
                      onChange={(event) =>
                        onDraftChange(key, "weight", event.target.value)
                      }
                    />
                    <Input
                      inputMode="numeric"
                      value={draft.reps}
                      disabled={locked || busy}
                      placeholder={workoutSessionCopy.colReps}
                      data-session-field={`${key}-reps`}
                      aria-label={`${workoutSessionCopy.colReps} ${set.slot}`}
                      className={cn(
                        "min-w-0 flex-1 rounded-xl text-center tabular-nums",
                        isActive ? "h-11" : "h-9"
                      )}
                      onChange={(event) =>
                        onDraftChange(key, "reps", event.target.value)
                      }
                    />
                    <div className="flex shrink-0 items-center gap-0.5">
                      {set.status === "pending" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={disabled || busy}
                          aria-label={workoutSessionCopy.skipSet}
                          onClick={() => onSkipSet(set)}
                        >
                          {busy ? <Spinner /> : <XIcon aria-hidden />}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="icon-sm"
                        variant={
                          set.status === "completed" ? "default" : "outline"
                        }
                        disabled={
                          disabled ||
                          busy ||
                          (set.status === "pending" && !canComplete) ||
                          set.status === "skipped"
                        }
                        aria-label={
                          set.status === "completed"
                            ? workoutSessionCopy.undoSet
                            : workoutSessionCopy.completeSet
                        }
                        onClick={() => {
                          if (set.status === "completed") onUndo(set)
                          else onComplete(set)
                        }}
                      >
                        {busy && set.status !== "pending" ? (
                          <Spinner />
                        ) : (
                          <CheckIcon aria-hidden />
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </article>
    </NeonGlowCard>
  )
}
