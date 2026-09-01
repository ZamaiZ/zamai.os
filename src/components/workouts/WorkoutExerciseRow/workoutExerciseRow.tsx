"use client"

import * as React from "react"

import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import { NeonGlowCard } from "@/components/exercises/NeonGlowCard"
import { parseEquipmentLabel } from "@/components/exercises/shared/equipmentMeta"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LightningIcon,
  TrashIcon,
} from "@/components/icons"
import { Button } from "@/components/primitives/button"
import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import type { PlanCatalogExercise } from "@/components/workouts/shared/types"
import {
  WORKOUT_SET_PROTOCOL,
  formatProtocolSlot,
} from "@/lib/workouts/setProtocol"
import { cn } from "@/lib/utils"

type WorkoutExerciseRowProps = {
  index: number
  exercise: PlanCatalogExercise
  disableUp?: boolean
  disableDown?: boolean
  disabled?: boolean
  readOnly?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRemove?: () => void
}

export function WorkoutExerciseRow({
  index,
  exercise,
  disableUp = true,
  disableDown = true,
  disabled = false,
  readOnly = false,
  onMoveUp,
  onMoveDown,
  onRemove,
}: WorkoutExerciseRowProps) {
  const [hovered, setHovered] = React.useState(false)
  const equipmentLabel = parseEquipmentLabel(exercise.equipment)
  const mediaSrc =
    hovered && exercise.gifUrl
      ? exercise.gifUrl
      : (exercise.thumbnailUrl ?? exercise.gifUrl)

  return (
    <NeonGlowCard disabled>
      <article
        className="flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <div className="flex items-stretch gap-3">
          <div className="flex w-10 shrink-0 flex-col items-center justify-center gap-1">
            {readOnly ? null : (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={workoutsCatalogCopy.moveUp}
                disabled={disableUp}
                onClick={onMoveUp}
              >
                <ChevronUpIcon aria-hidden />
              </Button>
            )}
            <span className="font-mono text-sm font-semibold tabular-nums text-primary">
              {index + 1}
            </span>
            {readOnly ? null : (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={workoutsCatalogCopy.moveDown}
                disabled={disableDown}
                onClick={onMoveDown}
              >
                <ChevronDownIcon aria-hidden />
              </Button>
            )}
          </div>

          <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted/50 sm:size-20">
            {mediaSrc ? (
              <img
                src={mediaSrc}
                alt=""
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <LightningIcon aria-hidden className="size-4 opacity-60" />
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[0.9rem] leading-tight font-semibold tracking-tight">
                {exercise.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[0.72rem] font-medium text-primary">
                <MuscleGroupIcon
                  svg={exercise.muscleGroup.iconSvg}
                  className="size-3"
                />
                {exercise.muscleGroup.name}
              </p>
              {equipmentLabel ? (
                <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                  {equipmentLabel}
                </p>
              ) : null}
            </div>
            {readOnly ? null : (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={workoutsCatalogCopy.removeExercise}
                disabled={disabled}
                onClick={onRemove}
              >
                <TrashIcon aria-hidden />
              </Button>
            )}
          </div>

          <p className="sr-only">{workoutsCatalogCopy.protocolLabel}</p>
          <ol className="flex flex-wrap gap-1">
            {WORKOUT_SET_PROTOCOL.map((slot) => (
              <li
                key={slot.slot}
                className={cn(
                  "rounded-md border border-border/70 bg-muted/35 px-1.5 py-0.5 font-mono text-[0.62rem] tracking-tight text-muted-foreground"
                )}
              >
                {formatProtocolSlot(slot)}
              </li>
            ))}
          </ol>
        </div>
      </article>
    </NeonGlowCard>
  )
}
