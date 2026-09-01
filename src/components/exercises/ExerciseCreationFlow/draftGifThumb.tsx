"use client"

import * as React from "react"

import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import {
  CircleCheckIcon,
  MoreHorizontalIcon,
  TriangleAlertIcon,
} from "@/components/icons"
import { Spinner } from "@/components/primitives/spinner"
import { cn } from "@/lib/utils"

import type { DraftExercise } from "./drafts"

type DraftGifThumbProps = {
  draft: DraftExercise
  className?: string
}

export function DraftGifThumb({ draft, className }: DraftGifThumbProps) {
  const objectUrl = React.useMemo(() => {
    if (!draft.gif?.thumbnailBlob) return null
    return URL.createObjectURL(draft.gif.thumbnailBlob)
  }, [draft.gif?.thumbnailBlob])

  React.useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  return (
    <span
      className={cn(
        "relative flex size-11 shrink-0 overflow-hidden rounded-xl bg-muted",
        className
      )}
    >
      {objectUrl ? (
        <img src={objectUrl} alt="" className="size-full object-cover" />
      ) : draft.gifStatus === "processing" ? (
        <span className="flex size-full items-center justify-center">
          <Spinner className="size-4" />
        </span>
      ) : (
        <span className="size-full bg-muted" />
      )}
    </span>
  )
}

type DraftStatusIconProps = {
  ready: boolean
  processing: boolean
}

export function DraftStatusIcon({ ready, processing }: DraftStatusIconProps) {
  if (processing) {
    return <Spinner className="size-4 text-muted-foreground" />
  }
  if (ready) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
        <CircleCheckIcon className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">{exercisesCatalogCopy.bulkReady}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
      <TriangleAlertIcon className="size-3.5" aria-hidden />
      <span className="hidden sm:inline">
        {exercisesCatalogCopy.bulkIncomplete}
      </span>
    </span>
  )
}

export { MoreHorizontalIcon }
