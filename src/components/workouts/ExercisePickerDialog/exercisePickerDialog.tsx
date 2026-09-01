"use client"

import * as React from "react"

import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import { parseEquipmentLabel } from "@/components/exercises/shared/equipmentMeta"
import { filterExercises } from "@/components/exercises/shared/filterExercises"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { LightningIcon, SearchIcon, XIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/primitives/drawer"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import { cn } from "@/lib/utils"

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

type ExercisePickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogExercises: CatalogExercise[]
  muscleGroups: CatalogMuscleGroup[]
  onSelect: (exercise: CatalogExercise) => void
}

export function ExercisePickerDialog({
  open,
  onOpenChange,
  catalogExercises,
  muscleGroups,
  onSelect,
}: ExercisePickerDialogProps) {
  const isMobile = React.useSyncExternalStore(
    subscribeMobileChange,
    getMobileSnapshot,
    getServerMobileSnapshot
  )
  const [query, setQuery] = React.useState("")
  const [groupSlug, setGroupSlug] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) return
    setQuery("")
    setGroupSlug(null)
  }, [open])

  const filtered = React.useMemo(
    () =>
      filterExercises(catalogExercises, {
        q: query,
        muscleGroups: groupSlug ? [groupSlug] : [],
        equipment: [],
      }),
    [catalogExercises, query, groupSlug]
  )

  const list = (
    <div className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={workoutsCatalogCopy.pickerSearchPlaceholder}
        />
      </InputGroup>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Button
          type="button"
          size="sm"
          variant={groupSlug === null ? "default" : "outline"}
          className="shrink-0"
          onClick={() => setGroupSlug(null)}
        >
          {workoutsCatalogCopy.pickerAllGroups}
        </Button>
        {muscleGroups.map((group) => (
          <Button
            key={group.id}
            type="button"
            size="sm"
            variant={groupSlug === group.slug ? "default" : "outline"}
            className="shrink-0"
            onClick={() =>
              setGroupSlug((current) =>
                current === group.slug ? null : group.slug
              )
            }
          >
            <MuscleGroupIcon svg={group.iconSvg} className="size-3.5" />
            {group.name}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {workoutsCatalogCopy.pickerEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {filtered.map((exercise) => {
            const equipmentLabel = parseEquipmentLabel(exercise.equipment)
            const media = exercise.thumbnailUrl ?? exercise.gifUrl
            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-start transition-colors hover:border-border/80 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  )}
                  onClick={() => {
                    onSelect(exercise)
                    onOpenChange(false)
                  }}
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted/50">
                    {media ? (
                      <img
                        src={media}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        <LightningIcon aria-hidden className="size-4" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {exercise.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.7rem] text-primary">
                      {exercise.muscleGroup.name}
                      {equipmentLabel ? ` · ${equipmentLabel}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent className="[--drawer-content-max-height:calc(100dvh-0.75rem)]">
          <DrawerHeader className="relative text-start">
            <DrawerTitle>{workoutsCatalogCopy.pickerTitle}</DrawerTitle>
            <DrawerDescription>
              {workoutsCatalogCopy.pickerDescription}
            </DrawerDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 end-3"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
            >
              <XIcon />
            </Button>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{list}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{workoutsCatalogCopy.pickerTitle}</DialogTitle>
          <DialogDescription>
            {workoutsCatalogCopy.pickerDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{list}</div>
      </DialogContent>
    </Dialog>
  )
}
