"use client"

import * as React from "react"

import { CATALOG_SORT_DEFAULT, exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import {
  collectUniqueEquipment,
  parseEquipmentLabel,
} from "@/components/exercises/shared/equipmentMeta"
import {
  MUSCLE_REGION_LABELS,
  partitionMuscleGroups,
} from "@/components/exercises/shared/muscleGroupMeta"
import type {
  CatalogMuscleGroup,
  CatalogSort,
} from "@/components/exercises/shared/types"
import { Button } from "@/components/primitives/button"
import { Checkbox } from "@/components/primitives/checkbox"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/primitives/drawer"
import { Label } from "@/components/primitives/label"
import { RadioGroup, RadioGroupItem } from "@/components/primitives/radioGroup"
import { Separator } from "@/components/primitives/separator"
import { cn } from "@/lib/utils"

type EquipmentOption = {
  value: string
  label: string
}

type ExercisesFiltersDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
  muscleGroupsSelected: string[]
  equipmentSelected: string[]
  sort: CatalogSort
  onApply: (next: {
    muscleGroups: string[]
    equipment: string[]
    sort: CatalogSort
  }) => void
}

const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: "name-asc", label: exercisesCatalogCopy.sortNameAsc },
  { value: "name-desc", label: exercisesCatalogCopy.sortNameDesc },
  { value: "muscle-group", label: exercisesCatalogCopy.sortMuscleGroup },
]

export function ExercisesFiltersDrawer({
  open,
  onOpenChange,
  muscleGroups,
  equipmentOptions,
  muscleGroupsSelected,
  equipmentSelected,
  sort,
  onApply,
}: ExercisesFiltersDrawerProps) {
  const [draftGroups, setDraftGroups] = React.useState(muscleGroupsSelected)
  const [draftEquipment, setDraftEquipment] = React.useState(equipmentSelected)
  const [draftSort, setDraftSort] = React.useState(sort)

  React.useEffect(() => {
    if (!open) return
    setDraftGroups(muscleGroupsSelected)
    setDraftEquipment(equipmentSelected)
    setDraftSort(sort)
  }, [open, muscleGroupsSelected, equipmentSelected, sort])

  const { upper, lower } = React.useMemo(
    () => partitionMuscleGroups(muscleGroups),
    [muscleGroups]
  )

  const equipmentItems = React.useMemo<EquipmentOption[]>(
    () =>
      collectUniqueEquipment(equipmentOptions).map((value) => ({
        value,
        label: parseEquipmentLabel(value),
      })),
    [equipmentOptions]
  )

  const toggleSlug = (
    list: string[],
    value: string,
    checked: boolean
  ): string[] => {
    if (checked) {
      return list.includes(value) ? list : [...list, value]
    }
    return list.filter((item) => item !== value)
  }

  const handleClear = () => {
    setDraftGroups([])
    setDraftEquipment([])
    setDraftSort(CATALOG_SORT_DEFAULT)
    onApply({
      muscleGroups: [],
      equipment: [],
      sort: CATALOG_SORT_DEFAULT,
    })
    onOpenChange(false)
  }

  const handleApply = () => {
    onApply({
      muscleGroups: draftGroups,
      equipment: draftEquipment,
      sort: draftSort,
    })
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent className="md:hidden">
        <DrawerHeader className="text-start">
          <DrawerTitle>{exercisesCatalogCopy.filtersDrawerTitle}</DrawerTitle>
          <DrawerDescription>
            {exercisesCatalogCopy.filtersDrawerDescription}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {exercisesCatalogCopy.filterLabel}
            </h3>
            <FilterSection
              label={MUSCLE_REGION_LABELS.upper}
              items={upper.map((group) => ({
                id: group.id,
                value: group.slug,
                label: group.name,
              }))}
              selected={draftGroups}
              onToggle={(value, checked) => {
                setDraftGroups((prev) => toggleSlug(prev, value, checked))
              }}
            />
            <Separator />
            <FilterSection
              label={MUSCLE_REGION_LABELS.lower}
              items={lower.map((group) => ({
                id: group.id,
                value: group.slug,
                label: group.name,
              }))}
              selected={draftGroups}
              onToggle={(value, checked) => {
                setDraftGroups((prev) => toggleSlug(prev, value, checked))
              }}
            />
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {exercisesCatalogCopy.filterEquipmentLabel}
            </h3>
            <FilterSection
              items={equipmentItems.map((item) => ({
                id: item.value,
                value: item.value,
                label: item.label,
              }))}
              selected={draftEquipment}
              onToggle={(value, checked) => {
                setDraftEquipment((prev) => toggleSlug(prev, value, checked))
              }}
            />
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {exercisesCatalogCopy.sortLabel}
            </h3>
            <RadioGroup
              value={draftSort}
              onValueChange={(value) => {
                if (
                  value === "name-asc" ||
                  value === "name-desc" ||
                  value === "muscle-group"
                ) {
                  setDraftSort(value)
                }
              }}
              className="gap-2"
            >
              {SORT_OPTIONS.map((option) => (
                <Label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5",
                    draftSort === option.value &&
                      "border-primary/40 bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={option.value} />
                  <span className="text-sm font-medium">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </section>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClear}
          >
            {exercisesCatalogCopy.filtersClear}
          </Button>
          <Button
            type="button"
            variant="default"
            className="flex-1"
            onClick={handleApply}
          >
            {exercisesCatalogCopy.filtersApply}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function FilterSection({
  label,
  items,
  selected,
  onToggle,
}: {
  label?: string
  items: Array<{ id: string; value: string; label: string }>
  selected: string[]
  onToggle: (value: string, checked: boolean) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-[0.7rem] font-medium text-muted-foreground">
          {label}
        </p>
      ) : null}
      <ul className="space-y-1.5">
        {items.map((item) => {
          const checked = selected.includes(item.value)
          return (
            <li key={item.id}>
              <Label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-2 py-2",
                  checked && "border-primary/25 bg-primary/5"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) => {
                    onToggle(item.value, nextChecked)
                  }}
                />
                <span className="text-sm">{item.label}</span>
              </Label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
