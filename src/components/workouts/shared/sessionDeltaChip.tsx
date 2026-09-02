"use client"

import { cn } from "@/lib/utils"
import {
  formatSignedKg,
  formatSignedPercent,
} from "@/lib/workouts/sessionFormat"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"

type SessionDeltaChipProps = {
  volumeKg: number
  volumePercent: number | null
  compact?: boolean
}

export function SessionDeltaChip({
  volumeKg,
  volumePercent,
  compact = false,
}: SessionDeltaChipProps) {
  const tone =
    volumeKg > 0
      ? "text-emerald-500"
      : volumeKg < 0
        ? "text-rose-500"
        : "text-muted-foreground"
  const label = compact
    ? formatSignedKg(volumeKg, 0)
    : `${formatSignedKg(volumeKg, 0)}${
        volumePercent === null ? "" : ` (${formatSignedPercent(volumePercent)})`
      }`

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted/70 px-2 py-0.5 text-[0.7rem] font-medium tabular-nums",
        tone
      )}
      aria-label={`${workoutSessionCopy.vsPrevious} ${label}`}
    >
      {label}
    </span>
  )
}
