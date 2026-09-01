"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { extractGifThumbnail } from "@/components/exercises/ExerciseFormDialog/extractGifThumbnail"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
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
import { EXERCISE_GIF_MAX_BYTES } from "@/lib/validations/exercises"
import { cn } from "@/lib/utils"

export type GifFileValue = {
  file: File | null
  thumbnailBlob: Blob | null
  previewUrl: string
  fileName: string
  fileSize: number
}

type GifFileUploadProps = {
  value: GifFileValue | null
  onChange: (value: GifFileValue | null) => void
  onError?: (message: string | null) => void
  onFiles?: (files: File[]) => void
  multiple?: boolean
  compact?: boolean
  hideHelp?: boolean
  dropTitle?: string
  dropHint?: string
  disabled?: boolean
  id?: string
}

type UploadUiState = "empty" | "processing" | "done" | "error"

export function formatGifFileSize(bytes: number): string {
  if (bytes <= 0) return "GIF"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) {
    return kb < 10 ? `${kb.toFixed(1)} KB` : `${Math.round(kb)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export function isGifFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".gif") || file.type === "image/gif"
}

export async function processGifFile(
  file: File
): Promise<{ ok: true; value: GifFileValue } | { ok: false; error: string }> {
  if (!isGifFile(file)) {
    return { ok: false, error: exercisesCatalogCopy.newExerciseInvalidGif }
  }

  if (file.size > EXERCISE_GIF_MAX_BYTES) {
    return { ok: false, error: exercisesCatalogCopy.newExerciseGifTooLarge }
  }

  try {
    const thumbnailBlob = await extractGifThumbnail(file)
    const previewUrl = URL.createObjectURL(file)
    return {
      ok: true,
      value: {
        file,
        thumbnailBlob,
        previewUrl,
        fileName: file.name,
        fileSize: file.size,
      },
    }
  } catch {
    return { ok: false, error: exercisesCatalogCopy.newExerciseGifDecodeError }
  }
}

export function GifFileUpload({
  value,
  onChange,
  onError,
  onFiles,
  multiple = false,
  compact = false,
  hideHelp = false,
  dropTitle,
  dropHint,
  disabled = false,
  id = "exercise-gif",
}: GifFileUploadProps) {
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
  const [imageLoaded, setImageLoaded] = React.useState(false)

  const pickerOnly = Boolean(onFiles)

  React.useEffect(() => {
    if (pickerOnly) return
    if (!value) {
      setUiState((current) => (current === "error" ? current : "empty"))
      setImageLoaded(false)
      return
    }
    setUiState("done")
    setErrorMessage(null)
    setImageLoaded(false)
  }, [value, pickerOnly])

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
    onError?.(null)
    setErrorMessage(null)
    setPendingMeta({ fileName: file.name, fileSize: file.size })
    setUiState("processing")

    const result = await processGifFile(file)
    if (!result.ok) {
      setErrorMessage(result.error)
      onChange(null)
      setUiState("error")
      clearInput()
      return
    }

    onChange(result.value)
    setUiState("done")
    setPendingMeta(null)
    clearInput()
  }

  function takeFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    if (onFiles) {
      onFiles(multiple ? files : files.slice(0, 1))
      clearInput()
      return
    }
    const file = files[0]
    if (!file) return
    void processFile(file)
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    takeFiles(event.target.files)
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
    takeFiles(event.dataTransfer.files)
  }

  function onRemove() {
    onChange(null)
    onError?.(null)
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
    !pickerOnly &&
    (uiState === "done" || uiState === "processing" || uiState === "error")
  const attachmentState =
    uiState === "processing"
      ? "processing"
      : uiState === "error"
        ? "error"
        : "done"

  const displayName = value?.fileName ?? pendingMeta?.fileName ?? "arquivo.gif"
  const displaySize = value?.fileSize ?? pendingMeta?.fileSize ?? 0
  const previewUrl = value?.previewUrl ?? null
  const titleText =
    dropTitle ??
    (compact
      ? exercisesCatalogCopy.bulkGifAddMore
      : exercisesCatalogCopy.newExerciseGifDropTitle)
  const hintText = dropHint ?? exercisesCatalogCopy.newExerciseGifDropHint

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".gif,image/gif"
        multiple={multiple}
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
            aria-label={titleText}
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
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/30 text-center outline-none transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out",
              compact
                ? "min-h-11 flex-row justify-start gap-3 px-3 py-2.5"
                : "min-h-[6.25rem] px-4 py-5",
              "hover:border-primary/40 hover:bg-primary/5",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              dragActive &&
                "scale-[1.01] border-primary bg-primary/8 ring-[3px] ring-primary/20",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 ease-out",
                compact ? "size-8 rounded-xl" : "size-10",
                dragActive && "scale-105"
              )}
            >
              <UploadIcon className={compact ? "size-4" : "size-5"} aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  "font-medium text-foreground",
                  compact ? "text-start text-sm" : "text-sm"
                )}
              >
                <span className="md:hidden">
                  {dropTitle ??
                    (compact
                      ? exercisesCatalogCopy.bulkGifAddMore
                      : exercisesCatalogCopy.newExerciseGifDropTitleMobile)}
                </span>
                <span className="hidden md:inline">{titleText}</span>
              </span>
              {compact ? null : (
                <span className="text-xs text-muted-foreground">
                  <span className="md:hidden">
                    {exercisesCatalogCopy.newExerciseGifDropHintMobile}
                  </span>
                  <span className="hidden md:inline">{hintText}</span>
                </span>
              )}
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
              <AttachmentMedia variant="image" className="bg-muted/40">
                {previewUrl ? (
                  <>
                    {!imageLoaded ? (
                      <span className="absolute inset-0 animate-pulse bg-muted" />
                    ) : null}
                    <img
                      src={previewUrl}
                      alt=""
                      className={cn(
                        "size-full object-cover transition-opacity duration-200",
                        imageLoaded ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </>
                ) : (
                  <UploadIcon className="size-4 text-muted-foreground" />
                )}
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{displayName}</AttachmentTitle>
                <AttachmentDescription>
                  {uiState === "processing"
                    ? exercisesCatalogCopy.newExerciseGifProcessing
                    : uiState === "error"
                      ? (errorMessage ??
                        exercisesCatalogCopy.newExerciseInvalidGif)
                      : `${formatGifFileSize(displaySize)} · ${exercisesCatalogCopy.newExerciseGifHint}`}
                </AttachmentDescription>
                {uiState === "done" ? (
                  <Badge
                    variant="secondary"
                    className="mt-1.5 bg-primary/12 text-primary"
                  >
                    {exercisesCatalogCopy.newExerciseGifReady}
                  </Badge>
                ) : null}
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  aria-label={exercisesCatalogCopy.newExerciseGifReplace}
                  disabled={disabled || uiState === "processing"}
                  onClick={openFilePicker}
                >
                  <RefreshCwIcon />
                </AttachmentAction>
                <AttachmentAction
                  type="button"
                  aria-label={exercisesCatalogCopy.newExerciseGifRemove}
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

      {hideHelp ? null : (
        <p className="text-xs text-muted-foreground">
          {exercisesCatalogCopy.newExerciseGifHelp}
        </p>
      )}
    </div>
  )
}
