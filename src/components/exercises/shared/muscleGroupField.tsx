"use client"

import * as React from "react"

import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import {
  MUSCLE_REGION_LABELS,
  partitionMuscleGroups,
} from "@/components/exercises/shared/muscleGroupMeta"
import type { CatalogMuscleGroup } from "@/components/exercises/shared/types"
import { MuscularTorsoIcon } from "@/components/icons"
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/primitives/combobox"
import { InputGroupAddon } from "@/components/primitives/inputGroup"
import { Label } from "@/components/primitives/label"
import { cn } from "@/lib/utils"

type MuscleGroupFieldProps = {
  id: string
  muscleGroups: CatalogMuscleGroup[]
  value: CatalogMuscleGroup | null
  onChange: (value: CatalogMuscleGroup | null) => void
  disabled?: boolean
  hideLabel?: boolean
  className?: string
}

export function MuscleGroupField({
  id,
  muscleGroups,
  value,
  onChange,
  disabled = false,
  hideLabel = false,
  className,
}: MuscleGroupFieldProps) {
  const groupedMuscleItems = React.useMemo(() => {
    const { upper, lower } = partitionMuscleGroups(muscleGroups)
    return [
      { value: "upper" as const, items: upper },
      { value: "lower" as const, items: lower },
    ].filter((section) => section.items.length > 0)
  }, [muscleGroups])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {hideLabel ? null : (
        <Label htmlFor={id}>{exercisesCatalogCopy.newExerciseGroupLabel}</Label>
      )}
      <Combobox
        autoHighlight
        items={groupedMuscleItems}
        value={value}
        onValueChange={(next) =>
          onChange((next as CatalogMuscleGroup | null) ?? null)
        }
        isItemEqualToValue={(a, b) => a.id === b.id}
        itemToStringLabel={(item) => item.name}
        itemToStringValue={(item) => item.id}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          placeholder={exercisesCatalogCopy.newExerciseGroupPlaceholder}
          className="w-full rounded-4xl"
          disabled={disabled}
          aria-label={exercisesCatalogCopy.newExerciseGroupLabel}
        >
          <InputGroupAddon align="inline-start">
            <MuscularTorsoIcon aria-hidden />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent className="z-[60] min-w-[16rem]">
          <ComboboxEmpty>
            {exercisesCatalogCopy.newExerciseGroupEmpty}
          </ComboboxEmpty>
          <ComboboxList>
            {(section, index) => (
              <ComboboxGroup key={section.value} items={section.items}>
                <ComboboxLabel>
                  {MUSCLE_REGION_LABELS[section.value]}
                </ComboboxLabel>
                <ComboboxCollection>
                  {(item: CatalogMuscleGroup) => (
                    <ComboboxItem key={item.id} value={item}>
                      <MuscleGroupIcon
                        svg={item.iconSvg}
                        className="size-4 text-primary"
                      />
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
                {index < groupedMuscleItems.length - 1 ? (
                  <ComboboxSeparator />
                ) : null}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
