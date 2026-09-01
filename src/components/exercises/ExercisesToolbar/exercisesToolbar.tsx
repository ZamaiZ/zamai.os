"use client"

import * as React from "react"

import {
  FilterIcon,
  GridIcon,
  ListIcon,
  MuscularTorsoIcon,
  SearchIcon,
  WeightIcon,
  XIcon,
} from "@/components/icons"
import { ExercisesFiltersDrawer } from "@/components/exercises/ExercisesFiltersDrawer"
import type {
  CatalogMuscleGroup,
  CatalogSort,
  CatalogViewMode,
} from "@/components/exercises/shared/types"
import {
  CATALOG_SORT_DEFAULT,
  exercisesCatalogCopy,
} from "@/components/exercises/shared/constants"
import {
  collectUniqueEquipment,
  parseEquipmentLabel,
} from "@/components/exercises/shared/equipmentMeta"
import {
  MUSCLE_REGION_LABELS,
  partitionMuscleGroups,
} from "@/components/exercises/shared/muscleGroupMeta"
import { Badge } from "@/components/primitives/badge"
import { Button } from "@/components/primitives/button"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { Separator } from "@/components/primitives/separator"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/primitives/toggleGroup"
import { cn } from "@/lib/utils"

type EquipmentOption = {
  value: string
  label: string
}

type ExercisesToolbarProps = {
  tab: "exercises" | "groups"
  searchValue: string
  muscleGroupsSelected: string[]
  equipmentSelected: string[]
  sort: CatalogSort
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions: Array<string | null | undefined>
  resultsCount: number
  viewMode: CatalogViewMode
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onMuscleGroupsChange: (slugs: string[]) => void
  onEquipmentChange: (values: string[]) => void
  onFiltersApply: (next: {
    muscleGroups: string[]
    equipment: string[]
    sort: CatalogSort
  }) => void
  onViewModeChange: (mode: CatalogViewMode) => void
}

export function ExercisesToolbar({
  tab,
  searchValue,
  muscleGroupsSelected,
  equipmentSelected,
  sort,
  muscleGroups,
  equipmentOptions,
  resultsCount,
  viewMode,
  onSearchChange,
  onClearSearch,
  onMuscleGroupsChange,
  onEquipmentChange,
  onFiltersApply,
  onViewModeChange,
}: ExercisesToolbarProps) {
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  const { upper, lower } = React.useMemo(
    () => partitionMuscleGroups(muscleGroups),
    [muscleGroups]
  )

  const groupedMuscleItems = React.useMemo(
    () => [
      { value: "upper" as const, items: upper },
      { value: "lower" as const, items: lower },
    ],
    [upper, lower]
  )

  const selectedGroups = React.useMemo(
    () =>
      muscleGroups.filter((group) =>
        muscleGroupsSelected.includes(group.slug)
      ),
    [muscleGroups, muscleGroupsSelected]
  )

  const equipmentItems = React.useMemo<EquipmentOption[]>(
    () =>
      collectUniqueEquipment(equipmentOptions).map((value) => ({
        value,
        label: parseEquipmentLabel(value),
      })),
    [equipmentOptions]
  )

  const selectedEquipment = React.useMemo(
    () =>
      equipmentItems.filter((item) =>
        equipmentSelected.includes(item.value)
      ),
    [equipmentItems, equipmentSelected]
  )

  const musclePlaceholder =
    selectedGroups.length === 0
      ? exercisesCatalogCopy.filterLabel
      : selectedGroups.length === 1
        ? selectedGroups[0]!.name
        : `${selectedGroups.length} grupos`

  const equipmentPlaceholder =
    selectedEquipment.length === 0
      ? exercisesCatalogCopy.filterEquipmentLabel
      : selectedEquipment.length === 1
        ? selectedEquipment[0]!.label
        : `${selectedEquipment.length} itens`

  const activeFilterCount =
    muscleGroupsSelected.length +
    equipmentSelected.length +
    (sort !== CATALOG_SORT_DEFAULT ? 1 : 0)

  const countLabel =
    tab === "exercises"
      ? exercisesCatalogCopy.exercisesCount(resultsCount)
      : exercisesCatalogCopy.groupsCount(resultsCount)

  const searchPlaceholder =
    tab === "groups"
      ? exercisesCatalogCopy.searchGroupsPlaceholder
      : exercisesCatalogCopy.searchPlaceholder

  return (
    <>
      {/* Mobile */}
      <div className="flex flex-col gap-3 px-3 py-3 md:hidden">
        <CatalogSearchField
          value={searchValue}
          placeholder={searchPlaceholder}
          onChange={onSearchChange}
          onClear={onClearSearch}
          className="h-10 bg-background"
        />
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 text-[0.72rem] text-muted-foreground tabular-nums">
            {countLabel}
          </p>
          {tab === "exercises" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setFiltersOpen(true)}
            >
              <FilterIcon aria-hidden className="size-3.5" />
              {exercisesCatalogCopy.filtersButton}
              {activeFilterCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 rounded-full px-1.5 text-[0.65rem] tabular-nums"
                >
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-2.5">
          <CatalogSearchField
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={onSearchChange}
            onClear={onClearSearch}
            className="h-8 bg-background/70"
          />
          {tab === "exercises" ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Combobox
                multiple
                autoHighlight
                items={groupedMuscleItems}
                value={selectedGroups}
                onValueChange={(next) => {
                  onMuscleGroupsChange(
                    (next as CatalogMuscleGroup[]).map((group) => group.slug)
                  )
                }}
                isItemEqualToValue={(a, b) => a.slug === b.slug}
                itemToStringLabel={(group) => group.name}
                itemToStringValue={(group) => group.slug}
              >
                <ComboboxInput
                  placeholder={musclePlaceholder}
                  showClear={selectedGroups.length > 0}
                  className="h-8 min-w-[10.5rem] rounded-xl bg-background/70"
                  aria-label={exercisesCatalogCopy.filterLabel}
                >
                  <InputGroupAddon align="inline-start" className="ps-2.5">
                    <MuscularTorsoIcon aria-hidden className="size-3.5" />
                  </InputGroupAddon>
                </ComboboxInput>
                <ComboboxContent className="min-w-[14rem]">
                  <ComboboxEmpty>Nenhum grupo encontrado.</ComboboxEmpty>
                  <ComboboxList>
                    {(section, index) => (
                      <ComboboxGroup key={section.value} items={section.items}>
                        <ComboboxLabel className="flex items-center gap-2">
                          {
                            MUSCLE_REGION_LABELS[
                              section.value as "upper" | "lower"
                            ]
                          }
                        </ComboboxLabel>
                        <ComboboxCollection>
                          {(group: CatalogMuscleGroup) => (
                            <ComboboxItem key={group.id} value={group}>
                              {group.name}
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

              <Combobox
                multiple
                autoHighlight
                items={equipmentItems}
                value={selectedEquipment}
                onValueChange={(next) => {
                  onEquipmentChange(
                    (next as EquipmentOption[]).map((item) => item.value)
                  )
                }}
                isItemEqualToValue={(a, b) => a.value === b.value}
                itemToStringLabel={(item) => item.label}
                itemToStringValue={(item) => item.value}
              >
                <ComboboxInput
                  placeholder={equipmentPlaceholder}
                  showClear={selectedEquipment.length > 0}
                  className="h-8 min-w-[10.5rem] rounded-xl bg-background/70"
                  aria-label={exercisesCatalogCopy.filterEquipmentLabel}
                >
                  <InputGroupAddon align="inline-start" className="ps-2.5">
                    <WeightIcon aria-hidden className="size-3.5" />
                  </InputGroupAddon>
                </ComboboxInput>
                <ComboboxContent className="min-w-[14rem]">
                  <ComboboxEmpty>Nenhum equipamento encontrado.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          ) : null}

          <div className="flex h-8 shrink-0 items-stretch gap-2 sm:ms-auto">
            <p className="flex items-center text-[0.72rem] text-muted-foreground tabular-nums">
              {countLabel}
            </p>
            {tab === "exercises" ? (
              <>
                <Separator orientation="vertical" className="self-stretch" />
                <ToggleGroup
                  value={[viewMode]}
                  onValueChange={(values) => {
                    const next = values[0]
                    if (next === "grid" || next === "list") {
                      onViewModeChange(next)
                    }
                  }}
                  variant="outline"
                  size="sm"
                  spacing={0}
                  className="h-8 rounded-xl"
                >
                  <ToggleGroupItem
                    value="grid"
                    aria-label={exercisesCatalogCopy.viewGridLabel}
                    className={cn(
                      "size-8 rounded-s-xl px-0 transition-colors duration-150 ease-out",
                      "aria-pressed:bg-primary/15 aria-pressed:text-primary"
                    )}
                  >
                    <GridIcon aria-hidden className="size-3.5" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="list"
                    aria-label={exercisesCatalogCopy.viewListLabel}
                    className={cn(
                      "size-8 rounded-e-xl px-0 transition-colors duration-150 ease-out",
                      "aria-pressed:bg-primary/15 aria-pressed:text-primary"
                    )}
                  >
                    <ListIcon aria-hidden className="size-3.5" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <ExercisesFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        muscleGroups={muscleGroups}
        equipmentOptions={equipmentOptions}
        muscleGroupsSelected={muscleGroupsSelected}
        equipmentSelected={equipmentSelected}
        sort={sort}
        onApply={onFiltersApply}
      />
    </>
  )
}

function CatalogSearchField({
  value,
  placeholder,
  onChange,
  onClear,
  className,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onClear: () => void
  className?: string
}) {
  return (
    <InputGroup
      className={cn("min-w-0 w-full flex-1 rounded-xl", className)}
    >
      <InputGroupAddon align="inline-start">
        <SearchIcon aria-hidden className="size-3.5" />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="text-sm"
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            aria-label="Limpar busca"
            onClick={onClear}
          >
            <XIcon aria-hidden className="size-3.5" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
