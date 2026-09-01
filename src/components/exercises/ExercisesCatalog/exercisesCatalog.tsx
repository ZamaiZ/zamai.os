"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { CatalogEmptyState } from "@/components/exercises/CatalogEmptyState"
import { ExerciseCard } from "@/components/exercises/ExerciseCard"
import { ExercisesDataTable } from "@/components/exercises/ExercisesDataTable"
import { ExercisesToolbar } from "@/components/exercises/ExercisesToolbar"
import { ExerciseFormDialog } from "@/components/exercises/ExerciseFormDialog"
import { MuscleGroupCard } from "@/components/exercises/MuscleGroupCard"
import { MuscleGroupFormDialog } from "@/components/exercises/MuscleGroupFormDialog"
import {
  EXERCISES_SEARCH_DEBOUNCE_MS,
  exercisesCatalogCopy,
} from "@/components/exercises/shared/constants"
import {
  buildMuscleGroupsWithCount,
  filterExercises,
  parseCatalogSort,
  parseCatalogTab,
  parseEquipmentParam,
  parseMuscleGroupsParam,
  parseViewMode,
  serializeCatalogSort,
  serializeEquipmentParam,
  serializeMuscleGroupsParam,
  sortExercises,
} from "@/components/exercises/shared/filterExercises"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
  ExercisesCatalogProps,
  ExercisesCatalogTab,
} from "@/components/exercises/shared/types"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/primitives/tabs"
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

export function ExercisesCatalog({
  exercises,
  muscleGroups,
}: ExercisesCatalogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = React.useSyncExternalStore(
    subscribeMobileChange,
    getMobileSnapshot,
    getServerMobileSnapshot
  )

  const tabFromUrl = parseCatalogTab(searchParams.get("tab"))
  const viewMode = parseViewMode(searchParams.get("view"))
  const sort = parseCatalogSort(searchParams.get("sort"))
  const qFromUrl = searchParams.get("q") ?? ""
  const selectedMuscleGroups = React.useMemo(
    () => parseMuscleGroupsParam(searchParams.get("muscleGroup")),
    [searchParams]
  )
  const selectedEquipment = React.useMemo(
    () => parseEquipmentParam(searchParams.get("equipment")),
    [searchParams]
  )

  const [catalogTab, setCatalogTab] =
    React.useState<ExercisesCatalogTab>(tabFromUrl)
  const [searchValue, setSearchValue] = React.useState(qFromUrl)
  const deferredSearch = React.useDeferredValue(searchValue)
  const [editingGroup, setEditingGroup] =
    React.useState<CatalogMuscleGroup | null>(null)
  const [creatingExercise, setCreatingExercise] = React.useState(false)
  const [editingExercise, setEditingExercise] =
    React.useState<CatalogExercise | null>(null)

  React.useEffect(() => {
    setCatalogTab(tabFromUrl)
  }, [tabFromUrl])

  React.useEffect(() => {
    setSearchValue(qFromUrl)
  }, [qFromUrl])

  const replaceParams = React.useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      if (params.get("tab") === "exercises") {
        params.delete("tab")
      }
      if (params.get("view") === "grid") {
        params.delete("view")
      }
      if (params.get("sort") === "name-asc") {
        params.delete("sort")
      }

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams]
  )

  React.useEffect(() => {
    if (searchValue === qFromUrl) return

    const timeout = window.setTimeout(() => {
      replaceParams({ q: searchValue.trim() || null })
    }, EXERCISES_SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [searchValue, qFromUrl, replaceParams])

  const filteredExercises = React.useMemo(() => {
    const filtered = filterExercises(exercises, {
      q: deferredSearch,
      muscleGroups: selectedMuscleGroups,
      equipment: selectedEquipment,
    })
    return sortExercises(filtered, sort)
  }, [
    exercises,
    deferredSearch,
    selectedMuscleGroups,
    selectedEquipment,
    sort,
  ])

  const groupsWithCount = React.useMemo(
    () =>
      buildMuscleGroupsWithCount(muscleGroups, exercises, deferredSearch),
    [muscleGroups, exercises, deferredSearch]
  )

  const resultsShown =
    catalogTab === "exercises"
      ? filteredExercises.length
      : groupsWithCount.length

  const equipmentOptions = React.useMemo(
    () => exercises.map((exercise) => exercise.equipment),
    [exercises]
  )

  const tabTriggerClass = cn(
    "relative h-9 flex-none rounded-t-lg rounded-b-none border border-border/80 px-3 text-xs sm:text-sm",
    "bg-muted/50 text-muted-foreground",
    "transition-[background-color,color,border-color] duration-150 ease-out",
    "hover:text-foreground",
    "data-active:z-10 data-active:-mb-px data-active:border-b-transparent",
    "data-active:bg-card data-active:text-primary",
    "dark:data-active:bg-card dark:data-active:border-b-transparent dark:data-active:text-primary",
    "group-data-horizontal/tabs:after:inset-x-2 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-0.5",
    "after:rounded-full after:bg-primary",
    "after:shadow-[0_0_6px_1px_color-mix(in_oklab,var(--primary)_30%,transparent)]",
    "dark:after:shadow-[0_0_8px_1px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
  )

  return (
    <>
    <Tabs
      value={catalogTab}
      onValueChange={(value) => {
        const next = parseCatalogTab(String(value ?? "exercises"))
        setCatalogTab(next)
        replaceParams({
          tab: next === "exercises" ? null : next,
          ...(next === "groups"
            ? { muscleGroup: null, equipment: null, view: null, sort: null }
            : {}),
        })
      }}
      className="gap-4"
    >
      <div>
        <TabsList
          variant="line"
          className="h-auto w-fit justify-start gap-px rounded-none bg-transparent p-0"
        >
          <TabsTrigger value="exercises" className={tabTriggerClass}>
            <TabLabel
              active={catalogTab === "exercises"}
              label={exercisesCatalogCopy.tabExercises}
              count={exercises.length}
            />
          </TabsTrigger>
          <TabsTrigger value="groups" className={tabTriggerClass}>
            <TabLabel
              active={catalogTab === "groups"}
              label={exercisesCatalogCopy.tabGroups}
              count={muscleGroups.length}
            />
          </TabsTrigger>
        </TabsList>

        <div className="rounded-tr-xl rounded-b-xl border border-border/80 bg-card">
          <ExercisesToolbar
            tab={catalogTab}
            searchValue={searchValue}
            muscleGroupsSelected={selectedMuscleGroups}
            equipmentSelected={selectedEquipment}
            sort={sort}
            muscleGroups={muscleGroups}
            equipmentOptions={equipmentOptions}
            resultsCount={resultsShown}
            viewMode={viewMode}
            onSearchChange={setSearchValue}
            onClearSearch={() => {
              setSearchValue("")
              replaceParams({ q: null })
            }}
            onMuscleGroupsChange={(slugs) => {
              replaceParams({
                muscleGroup: serializeMuscleGroupsParam(slugs),
                tab: null,
              })
            }}
            onEquipmentChange={(values) => {
              replaceParams({
                equipment: serializeEquipmentParam(values),
                tab: null,
              })
            }}
            onFiltersApply={({
              muscleGroups: nextGroups,
              equipment,
              sort: nextSort,
            }) => {
              replaceParams({
                muscleGroup: serializeMuscleGroupsParam(nextGroups),
                equipment: serializeEquipmentParam(equipment),
                sort: serializeCatalogSort(nextSort),
                tab: null,
              })
            }}
            onViewModeChange={(mode) => {
              replaceParams({ view: mode === "grid" ? null : mode })
            }}
          />
        </div>
      </div>

      <TabsContent value="exercises" className="mt-0 outline-none">
        {filteredExercises.length === 0 ? (
          <CatalogEmptyState
            variant="exercises"
            onCreateExercise={() => setCreatingExercise(true)}
          />
        ) : isMobile ? (
          <div className="flex flex-col gap-2.5">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                layout="horizontal"
                onEdit={setEditingExercise}
              />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={setEditingExercise}
              />
            ))}
          </div>
        ) : (
          <ExercisesDataTable
            data={filteredExercises}
            onEdit={setEditingExercise}
          />
        )}
      </TabsContent>

      <TabsContent value="groups" className="mt-0 outline-none">
        {groupsWithCount.length === 0 ? (
          <CatalogEmptyState
            variant="groups"
            onClearSearch={() => {
              setSearchValue("")
              replaceParams({ q: null })
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {groupsWithCount.map((group) => (
              <MuscleGroupCard
                key={group.id}
                group={group}
                onSelect={(slug) => {
                  setCatalogTab("exercises")
                  setSearchValue("")
                  replaceParams({
                    tab: null,
                    muscleGroup: slug,
                    equipment: null,
                    q: null,
                  })
                }}
                onEdit={(nextGroup) => setEditingGroup(nextGroup)}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>

      <MuscleGroupFormDialog
        mode="edit"
        open={editingGroup !== null}
        group={editingGroup}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditingGroup(null)
        }}
      />
      <ExerciseFormDialog
        mode={editingExercise ? "edit" : "create"}
        open={creatingExercise || editingExercise !== null}
        exercise={editingExercise}
        muscleGroups={muscleGroups}
        equipmentOptions={equipmentOptions}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setCreatingExercise(false)
            setEditingExercise(null)
          }
        }}
      />
    </>
  )
}

function TabLabel({
  active,
  label,
  count,
}: {
  active: boolean
  label: string
  count: number
}) {
  return (
    <span className="inline-flex items-center">
      <span>{label}</span>
      <span
        className={cn(
          "ms-1.5 rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold tabular-nums",
          active
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </span>
  )
}
