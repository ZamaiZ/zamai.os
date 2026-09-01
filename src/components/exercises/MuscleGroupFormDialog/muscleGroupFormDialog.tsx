"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  createMuscleGroupAction,
  updateMuscleGroupAction,
} from "@/app/actions/muscleGroups"
import {
  SvgIconFileUpload,
  type SvgIconFileValue,
} from "@/components/exercises/MuscleGroupFormDialog/svgIconFileUpload"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import type { CatalogMuscleGroup } from "@/components/exercises/shared/types"
import { CheckIcon, PlusIcon, TagIcon, WeightIcon } from "@/components/icons"
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

type MuscleGroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  group?: CatalogMuscleGroup | null
}

function fileValueFromGroup(
  group: CatalogMuscleGroup
): SvgIconFileValue | null {
  if (!group.iconSvg) return null
  return {
    iconSvg: group.iconSvg,
    fileName: `${group.slug}.svg`,
    fileSize: new TextEncoder().encode(group.iconSvg).length,
  }
}

export function MuscleGroupFormDialog({
  open,
  onOpenChange,
  mode,
  group = null,
}: MuscleGroupFormDialogProps) {
  const router = useRouter()
  const isEdit = mode === "edit"
  const [name, setName] = React.useState("")
  const [fileValue, setFileValue] = React.useState<SvgIconFileValue | null>(
    null
  )
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const hydratedGroupIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName("")
      setFileValue(null)
      setError(null)
      setPending(false)
      hydratedGroupIdRef.current = null
      return
    }

    if (isEdit && group) {
      if (hydratedGroupIdRef.current === group.id) return
      hydratedGroupIdRef.current = group.id
      setName(group.name)
      setFileValue(fileValueFromGroup(group))
      setError(null)
      setPending(false)
    }
  }, [open, isEdit, group])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!fileValue?.iconSvg) {
      setError(exercisesCatalogCopy.newMuscleGroupSvgRequired)
      return
    }

    setPending(true)

    const result = isEdit
      ? group
        ? await updateMuscleGroupAction({
            id: group.id,
            name,
            iconSvg: fileValue.iconSvg,
          })
        : { ok: false as const, error: "Grupo muscular não encontrado." }
      : await createMuscleGroupAction({
          name,
          iconSvg: fileValue.iconSvg,
        })

    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onOpenChange(false)
    router.refresh()
  }

  const title = isEdit
    ? exercisesCatalogCopy.editMuscleGroupTitle
    : exercisesCatalogCopy.newMuscleGroupTitle
  const description = isEdit
    ? exercisesCatalogCopy.editMuscleGroupDescription
    : exercisesCatalogCopy.newMuscleGroupDescription
  const submitLabel = isEdit
    ? exercisesCatalogCopy.editMuscleGroupSubmit
    : exercisesCatalogCopy.newMuscleGroupSubmit
  const savingLabel = isEdit
    ? exercisesCatalogCopy.editMuscleGroupSaving
    : exercisesCatalogCopy.newMuscleGroupSaving

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <DialogHeader className="flex-row items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <WeightIcon className="size-5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pe-8 text-start">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="muscle-group-name">
              {exercisesCatalogCopy.newMuscleGroupNameLabel}
            </Label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <TagIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="muscle-group-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                required
                autoComplete="off"
                placeholder={exercisesCatalogCopy.newMuscleGroupNamePlaceholder}
                disabled={pending}
              />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="muscle-group-svg">
              {exercisesCatalogCopy.newMuscleGroupSvgLabel}
            </Label>
            <SvgIconFileUpload
              id="muscle-group-svg"
              value={fileValue}
              onChange={setFileValue}
              onError={setError}
              disabled={pending}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter className="sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {exercisesCatalogCopy.newMuscleGroupCancel}
            </Button>
            <Button
              type="submit"
              disabled={pending || !name.trim() || !fileValue}
            >
              {pending ? (
                savingLabel
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
