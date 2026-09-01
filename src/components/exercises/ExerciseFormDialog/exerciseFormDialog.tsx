"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  GifFileUpload,
  type GifFileValue,
} from "@/components/exercises/ExerciseFormDialog/gifFileUpload"
import { EquipmentField } from "@/components/exercises/shared/equipmentField"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { parseEquipmentLabel } from "@/components/exercises/shared/equipmentMeta"
import { MuscleGroupField } from "@/components/exercises/shared/muscleGroupField"
import type {
  CatalogExercise,
  CatalogMuscleGroup,
} from "@/components/exercises/shared/types"
import { CheckIcon, LightningIcon, TagIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
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
  mode?: "edit"
  exercise?: CatalogExercise | null
  muscleGroups: CatalogMuscleGroup[]
  equipmentOptions?: Array<string | null | undefined>
}

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
  exercise = null,
  muscleGroups,
  equipmentOptions = [],
}: ExerciseFormDialogProps) {
  const router = useRouter()
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

    if (exercise) {
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
  }, [open, exercise, muscleGroups])

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

    if (!exercise) return

    if (!group) {
      setError(exercisesCatalogCopy.newExerciseGroupRequired)
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
        new File(
          [gifValue.thumbnailBlob],
          `${gifValue.fileName.replace(/\.gif$/i, "")}.jpg`,
          { type: "image/jpeg" }
        )
      )
    }

    try {
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: "PATCH",
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

  const canSubmit = Boolean(name.trim()) && Boolean(group)

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
              <DialogTitle>
                {exercisesCatalogCopy.editExerciseTitle}
              </DialogTitle>
              <DialogDescription>
                {exercisesCatalogCopy.editExerciseDescription}
              </DialogDescription>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <MuscleGroupField
              id="exercise-group"
              muscleGroups={muscleGroups}
              value={group}
              onChange={setGroup}
              disabled={pending}
            />
            <EquipmentField
              id="exercise-equipment"
              equipmentOptions={equipmentOptions}
              value={equipment}
              onChange={setEquipment}
              disabled={pending}
            />
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

          <DialogFooter className="flex-row justify-between">
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
                  {exercisesCatalogCopy.editExerciseSaving}
                </>
              ) : (
                <>
                  <CheckIcon data-icon="inline-start" aria-hidden />
                  {exercisesCatalogCopy.editExerciseSubmit}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
