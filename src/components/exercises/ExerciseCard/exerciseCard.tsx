"use client"

import * as React from "react"

import { LightningIcon, MoreHorizontalIcon, PencilIcon } from "@/components/icons"
import { NeonGlowCard } from "@/components/exercises/NeonGlowCard"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { parseEquipmentLabel } from "@/components/exercises/shared/equipmentMeta"
import type { CatalogExercise } from "@/components/exercises/shared/types"
import { Button } from "@/components/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"
import { cn } from "@/lib/utils"

type ExerciseCardProps = {
  exercise: CatalogExercise
  layout?: "vertical" | "horizontal"
  onEdit: (exercise: CatalogExercise) => void
}

export function ExerciseCard({
  exercise,
  layout = "vertical",
  onEdit,
}: ExerciseCardProps) {
  const [hovered, setHovered] = React.useState(false)
  const showGif = Boolean(hovered && exercise.gifUrl)
  const equipmentLabel = parseEquipmentLabel(exercise.equipment)
  const mediaSrc =
    showGif && exercise.gifUrl
      ? exercise.gifUrl
      : (exercise.thumbnailUrl ?? exercise.gifUrl)

  if (layout === "horizontal") {
    return (
      <NeonGlowCard
        disabled
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            setHovered(true)
          }
        }}
        onPointerLeave={() => setHovered(false)}
      >
        <article className="flex items-stretch gap-3 p-2.5 pe-2">
          <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted/50 sm:size-20">
            {mediaSrc ? (
              // External Supabase storage URLs; next/image not required for catalog thumbs.
              <img
                src={mediaSrc}
                alt=""
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <LightningIcon aria-hidden className="size-4 opacity-60" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[0.9rem] leading-tight font-semibold tracking-tight">
                  {exercise.name}
                </h3>
                <p className="mt-0.5 truncate text-[0.72rem] font-medium text-primary">
                  {exercise.muscleGroup.name}
                </p>
              </div>
              <CardMenu onEdit={() => onEdit(exercise)} />
            </div>
            {equipmentLabel ? (
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[0.62rem] text-muted-foreground">
                  {equipmentLabel}
                </span>
              </div>
            ) : null}
          </div>
        </article>
      </NeonGlowCard>
    )
  }

  return (
    <NeonGlowCard
      className="h-full"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setHovered(true)
        }
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted/50">
          {mediaSrc ? (
            // External Supabase storage URLs; next/image not required for catalog thumbs.
            <img
              src={mediaSrc}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <LightningIcon aria-hidden className="size-5 opacity-60" />
              <span className="text-[0.65rem] tracking-wide uppercase">
                {exercisesCatalogCopy.noMedia}
              </span>
            </div>
          )}

          <div className="absolute top-2 end-2">
            <CardMenu onEdit={() => onEdit(exercise)} />
          </div>
        </div>

        <div className="min-w-0 space-y-1.5 px-3 pt-2.5 pb-3">
          <h3 className="truncate text-[0.84rem] leading-tight font-semibold tracking-tight">
            {exercise.name}
          </h3>
          <p className="truncate text-[0.72rem] font-medium text-primary">
            {exercise.muscleGroup.name}
          </p>
          {equipmentLabel ? (
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span
                className={cn(
                  "rounded-md bg-muted/80 px-1.5 py-0.5 text-[0.62rem] text-muted-foreground"
                )}
              >
                {equipmentLabel}
              </span>
            </div>
          ) : null}
        </div>
      </article>
    </NeonGlowCard>
  )
}

function CardMenu({ onEdit }: { onEdit: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            aria-label={exercisesCatalogCopy.openRowMenu}
            className="bg-background/85 shadow-sm backdrop-blur-sm"
          />
        }
      >
        <MoreHorizontalIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon aria-hidden />
            {exercisesCatalogCopy.editExerciseMenu}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
