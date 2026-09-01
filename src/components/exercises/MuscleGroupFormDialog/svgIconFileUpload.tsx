"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import {
  exercisesCatalogCopy,
  MUSCLE_GROUP_ICON_SVG_MAX_BYTES,
} from "@/components/exercises/shared/constants"
import { RefreshCwIcon, TrashIcon, UploadIcon } from "@/components/icons"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/primitives/attachment"
import { Badge } from "@/components/primitives/badge"
import { cn } from "@/lib/utils"

export type SvgIconFileValue = {
  iconSvg: string
  fileName: string
  fileSize: number
}

type SvgIconFileUploadProps = {
  value: SvgIconFileValue | null
  onChange: (value: SvgIconFileValue | null) => void
  onError: (message: string | null) => void
  disabled?: boolean
  id?: string
}

type UploadUiState = "empty" | "processing" | "done" | "error"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 10) return `${kb.toFixed(1)} KB`
  return `${Math.round(kb)} KB`
}

function stripUnsafeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
}

function isSvgFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith(".svg") || file.type === "image/svg+xml"
  )
}

export function SvgIconFileUpload({
  value,
  onChange,
  onError,
  disabled = false,
  id = "muscle-group-svg",
}: SvgIconFileUploadProps) {
  const reduceMotion = useReducedMotion()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [uiState, setUiState] = React.useState<UploadUiState>(
    value ? "done" : "empty"
  )
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [pendingMeta, setPendingMeta] = React.useState<{
    fileName: string
    fileSize: number
  } | null>(null)

  React.useEffect(() => {
    if (!value) {
      setUiState((current) => (current === "error" ? current : "empty"))
      return
    }
    setUiState("done")
    setErrorMessage(null)
  }, [value])

  function openFilePicker() {
    if (disabled) return
    inputRef.current?.click()
  }

  function clearInput() {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  async function processFile(file: File) {
    onError(null)
    setErrorMessage(null)
    setPendingMeta({ fileName: file.name, fileSize: file.size })
    setUiState("processing")

    if (!isSvgFile(file)) {
      const message = exercisesCatalogCopy.newMuscleGroupInvalidSvg
      setErrorMessage(message)
      onChange(null)
      setUiState("error")
      clearInput()
      return
    }

    if (file.size > MUSCLE_GROUP_ICON_SVG_MAX_BYTES) {
      const message = exercisesCatalogCopy.newMuscleGroupSvgTooLarge
      setErrorMessage(message)
      onChange(null)
      setUiState("error")
      clearInput()
      return
    }

    try {
      const text = await file.text()
      if (!/<svg[\s>]/i.test(text)) {
        const message = exercisesCatalogCopy.newMuscleGroupInvalidSvg
        setErrorMessage(message)
        onChange(null)
        setUiState("error")
        clearInput()
        return
      }

      onChange({
        iconSvg: text,
        fileName: file.name,
        fileSize: file.size,
      })
      setUiState("done")
      setPendingMeta(null)
      clearInput()
    } catch {
      const message = exercisesCatalogCopy.newMuscleGroupInvalidSvg
      setErrorMessage(message)
      onChange(null)
      setUiState("error")
      clearInput()
    }
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    void processFile(file)
  }

  function onDragEnter(event: React.DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    setDragActive(true)
  }

  function onDragOver(event: React.DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    setDragActive(true)
  }

  function onDragLeave(event: React.DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setDragActive(false)
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)
    if (disabled) return
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    void processFile(file)
  }

  function onRemove() {
    onChange(null)
    onError(null)
    setErrorMessage(null)
    setPendingMeta(null)
    setUiState("empty")
    clearInput()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openFilePicker()
    }
  }

  const showAttachment =
    uiState === "done" || uiState === "processing" || uiState === "error"
  const attachmentState =
    uiState === "processing"
      ? "processing"
      : uiState === "error"
        ? "error"
        : "done"

  const displayName =
    value?.fileName ?? pendingMeta?.fileName ?? "arquivo.svg"
  const displaySize = value?.fileSize ?? pendingMeta?.fileSize ?? 0
  const previewSvg = value ? stripUnsafeSvg(value.iconSvg) : null

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".svg,image/svg+xml"
        className="sr-only"
        disabled={disabled}
        onChange={onInputChange}
        tabIndex={-1}
      />

      <AnimatePresence mode="wait" initial={false}>
        {!showAttachment ? (
          <motion.div
            key="dropzone"
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-label={exercisesCatalogCopy.newMuscleGroupSvgDropTitle}
            onClick={openFilePicker}
            onKeyDown={onKeyDown}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              "flex min-h-[7.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center outline-none transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out",
              "hover:border-primary/40 hover:bg-primary/5",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              dragActive &&
                "scale-[1.01] border-primary bg-primary/8 ring-[3px] ring-primary/20",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 ease-out",
                dragActive && "scale-105"
              )}
            >
              <UploadIcon className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {exercisesCatalogCopy.newMuscleGroupSvgDropTitle}
              </span>
              <span className="text-xs text-muted-foreground">
                {exercisesCatalogCopy.newMuscleGroupSvgDropHint}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="attachment"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(dragActive && "rounded-2xl ring-[3px] ring-primary/25")}
          >
            <Attachment
              state={attachmentState}
              className="w-full max-w-full min-w-0 rounded-2xl"
            >
              <AttachmentMedia className="bg-background ring-1 ring-border/60">
                {previewSvg ? (
                  <MuscleGroupIcon svg={previewSvg} className="size-5" />
                ) : (
                  <UploadIcon className="size-4 text-muted-foreground" />
                )}
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{displayName}</AttachmentTitle>
                <AttachmentDescription>
                  {uiState === "processing"
                    ? exercisesCatalogCopy.newMuscleGroupSvgProcessing
                    : uiState === "error"
                      ? (errorMessage ??
                        exercisesCatalogCopy.newMuscleGroupInvalidSvg)
                      : `${formatFileSize(displaySize)} · ${exercisesCatalogCopy.newMuscleGroupSvgMonoHint}`}
                </AttachmentDescription>
                {uiState === "done" ? (
                  <Badge
                    variant="secondary"
                    className="mt-1.5 bg-primary/12 text-primary"
                  >
                    {exercisesCatalogCopy.newMuscleGroupSvgReady}
                  </Badge>
                ) : null}
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  aria-label={exercisesCatalogCopy.newMuscleGroupSvgReplace}
                  disabled={disabled || uiState === "processing"}
                  onClick={openFilePicker}
                >
                  <RefreshCwIcon />
                </AttachmentAction>
                <AttachmentAction
                  type="button"
                  aria-label={exercisesCatalogCopy.newMuscleGroupSvgRemove}
                  disabled={disabled || uiState === "processing"}
                  onClick={onRemove}
                >
                  <TrashIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground">
        {exercisesCatalogCopy.newMuscleGroupSvgHelp}
      </p>
    </div>
  )
}
