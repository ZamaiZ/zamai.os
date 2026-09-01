"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import {
  GifFileUpload,
  type GifFileValue,
} from "@/components/exercises/ExerciseFormDialog/gifFileUpload"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import {
  listEquipmentCatalogOptions,
  parseEquipmentLabel,
} from "@/components/exercises/shared/equipmentMeta"
import {
  MUSCLE_REGION_LABELS,
  partitionMuscleGroups,
} from "@/components/exercises/shared/muscleGroupMeta"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import {
  CheckIcon,
  LightningIcon,
  MuscularTorsoIcon,
  PlusIcon,
  TagIcon,
  WeightIcon,
} from "@/components/icons"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/primitives/inputGroup"
import { Label } from "@/components/primitives/label"
import { Spinner } from "@/components/primitives/spinner"

type EquipmentOption = {
  value: string
  label: string
}

type ExerciseFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  exercise?: CatalogExercise | null
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions?: Array<string | null | undefined>
}

const FOOTER_CLASS = "sm:flex-row sm:justify-between"

function revokeIfBlob(url: string | null | undefined) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}

function fileValueFromExercise(exercise: CatalogExercise): GifFileValue | null {
  const previewUrl = exercise.gifUrl ?? exercise.thumbnailUrl
  if (!previewUrl) return null
  return {
    file: null,
    thumbnailBlob: null,
    previewUrl,
    fileName: `${exercise.slug}.gif`,
    fileSize: 0,
  }
}

export function ExerciseFormDialog({
  open,
  onOpenChange,
  mode,
  exercise = null,
  muscleGroups,
  equipmentOptions = [],
}: ExerciseFormDialogProps) {
  const router = useRouter()
  const isEdit = mode === "edit"
  const [name, setName] = React.useState("")
  const [group, setGroup] = React.useState<CatalogMuscleGroup | null>(null)
  const [equipment, setEquipment] = React.useState<EquipmentOption | null>(
    null
  )
  const [gifValue, setGifValue] = React.useState<GifFileValue | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const hydratedIdRef = React.useRef<string | null>(null)
  const gifValueRef = React.useRef<GifFileValue | null>(null)
  gifValueRef.current = gifValue

  const catalogEquipment = React.useMemo(
    () => listEquipmentCatalogOptions(equipmentOptions),
    [equipmentOptions]
  )

  const groupedMuscleItems = React.useMemo(() => {
    const { upper, lower } = partitionMuscleGroups(muscleGroups)
    return [
      { value: "upper" as const, items: upper },
      { value: "lower" as const, items: lower },
    ].filter((section) => section.items.length > 0)
  }, [muscleGroups])

  React.useEffect(() => {
    if (!open) {
      revokeIfBlob(gifValueRef.current?.previewUrl)
      setName("")
      setGroup(null)
      setEquipment(null)
      setGifValue(null)
      setError(null)
      setPending(false)
      hydratedIdRef.current = null
      return
    }

    if (isEdit && exercise) {
      if (hydratedIdRef.current === exercise.id) return
      hydratedIdRef.current = exercise.id
      setName(exercise.name)
      setGroup(
        muscleGroups.find((item) => item.id === exercise.muscleGroup.id) ??
          null
      )
      setEquipment(
        exercise.equipment
          ? {
              value: exercise.equipment,
              label: parseEquipmentLabel(exercise.equipment),
            }
          : null
      )
      setGifValue(fileValueFromExercise(exercise))
      setError(null)
      setPending(false)
    }
  }, [open, isEdit, exercise, muscleGroups])

  function handleGifChange(next: GifFileValue | null) {
    setGifValue((current) => {
      if (current?.previewUrl !== next?.previewUrl) {
        revokeIfBlob(current?.previewUrl)
      }
      return next
    })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!group) {
      setError(exercisesCatalogCopy.newExerciseGroupRequired)
      return
    }

    if (!isEdit && !gifValue?.file) {
      setError(exercisesCatalogCopy.newExerciseGifRequired)
      return
    }

    if (gifValue?.file && !gifValue.thumbnailBlob) {
      setError(exercisesCatalogCopy.newExerciseGifDecodeError)
      return
    }

    setPending(true)

    const form = new FormData()
    form.set("name", name)
    form.set("muscleGroupId", group.id)
    if (equipment?.value) {
      form.set("equipment", equipment.value)
    }
    if (gifValue?.file && gifValue.thumbnailBlob) {
      form.set("gif", gifValue.file)
      form.set(
        "thumbnail",
        new File([gifValue.thumbnailBlob], `${gifValue.fileName.replace(/\.gif$/i, "")}.jpg`, {
          type: "image/jpeg",
        })
      )
    }

    const url =
      isEdit && exercise
        ? `/api/exercises/${exercise.id}`
        : "/api/exercises"
    const method = isEdit ? "PATCH" : "POST"

    try {
      const response = await fetch(url, {
        method,
        body: form,
        credentials: "same-origin",
      })
      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        setError(payload?.error ?? "Não foi possível salvar o exercício.")
        setPending(false)
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch {
      setError("Não foi possível salvar o exercício.")
      setPending(false)
    }
  }

  const title = isEdit
    ? exercisesCatalogCopy.editExerciseTitle
    : exercisesCatalogCopy.newExerciseTitle
  const description = isEdit
    ? exercisesCatalogCopy.editExerciseDescription
    : exercisesCatalogCopy.newExerciseDescription
  const submitLabel = isEdit
    ? exercisesCatalogCopy.editExerciseSubmit
    : exercisesCatalogCopy.newExerciseSubmit
  const savingLabel = isEdit
    ? exercisesCatalogCopy.editExerciseSaving
    : exercisesCatalogCopy.newExerciseSaving

  const canSubmit =
    Boolean(name.trim()) &&
    Boolean(group) &&
    (isEdit || Boolean(gifValue?.file))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-lg">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5"
          aria-busy={pending}
        >
          <DialogHeader className="flex-row items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <LightningIcon className="size-5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pe-8 text-start">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise-name">
              {exercisesCatalogCopy.newExerciseNameLabel}
            </Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <TagIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="exercise-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                required
                autoComplete="off"
                placeholder={exercisesCatalogCopy.newExerciseNamePlaceholder}
                disabled={pending}
              />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise-group">
              {exercisesCatalogCopy.newExerciseGroupLabel}
            </Label>
            <Combobox
              autoHighlight
              items={groupedMuscleItems}
              value={group}
              onValueChange={(next) =>
                setGroup((next as CatalogMuscleGroup | null) ?? null)
              }
              isItemEqualToValue={(a, b) => a.id === b.id}
              itemToStringLabel={(item) => item.name}
              itemToStringValue={(item) => item.id}
              disabled={pending}
            >
              <ComboboxInput
                id="exercise-group"
                placeholder={exercisesCatalogCopy.newExerciseGroupPlaceholder}
                className="w-full rounded-4xl"
                disabled={pending}
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise-equipment">
              {exercisesCatalogCopy.newExerciseEquipmentLabel}
            </Label>
            <Combobox
              autoHighlight
              items={catalogEquipment}
              value={equipment}
              onValueChange={(next) =>
                setEquipment((next as EquipmentOption | null) ?? null)
              }
              isItemEqualToValue={(a, b) => a.value === b.value}
              itemToStringLabel={(item) => item.label}
              itemToStringValue={(item) => item.value}
              disabled={pending}
            >
              <ComboboxInput
                id="exercise-equipment"
                placeholder={
                  exercisesCatalogCopy.newExerciseEquipmentPlaceholder
                }
                showClear={Boolean(equipment)}
                className="w-full rounded-4xl"
                disabled={pending}
                aria-label={exercisesCatalogCopy.newExerciseEquipmentLabel}
              >
                <InputGroupAddon align="inline-start">
                  <WeightIcon aria-hidden />
                </InputGroupAddon>
              </ComboboxInput>
              <ComboboxContent className="z-[60] min-w-[16rem]">
                <ComboboxEmpty>
                  {exercisesCatalogCopy.newExerciseEquipmentEmpty}
                </ComboboxEmpty>
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="exercise-gif">
              {exercisesCatalogCopy.newExerciseGifLabel}
            </Label>
            <GifFileUpload
              id="exercise-gif"
              value={gifValue}
              onChange={handleGifChange}
              onError={setError}
              disabled={pending}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter className={FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {exercisesCatalogCopy.newExerciseCancel}
            </Button>
            <Button type="submit" disabled={pending || !canSubmit}>
              {pending ? (
                <>
                  <Spinner data-icon="inline-start" className="size-4" />
                  {savingLabel}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <CheckIcon data-icon="inline-start" aria-hidden />
                  ) : (
                    <PlusIcon data-icon="inline-start" aria-hidden />
                  )}
                  {submitLabel}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
