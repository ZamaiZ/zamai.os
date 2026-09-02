"use client"

import { formatPrevious } from "@/lib/workouts/sessionFormat"
import { formatProtocolSetLabel, getProtocolSlot } from "@/lib/workouts/setProtocol"
import type { SessionSetComparison } from "@/lib/workouts/session.types"
import { workoutSessionCopy } from "@/components/workouts/shared/constants"
import { SessionDeltaChip } from "@/components/workouts/shared/sessionDeltaChip"
import { cn } from "@/lib/utils"

type SessionSetComparisonRowProps = {
  comparison: SessionSetComparison
}

function trendLabel(comparison: SessionSetComparison) {
  if (comparison.trend === "new") return workoutSessionCopy.trendNew
  if (comparison.trend === "skipped") return workoutSessionCopy.trendSkipped
  if (comparison.trend === "missing") return workoutSessionCopy.trendMissing
  return null
}

export function SessionSetComparisonRow({
  comparison,
}: SessionSetComparisonRowProps) {
  const protocol = getProtocolSlot(comparison.slot)
  const extra = trendLabel(comparison)

  return (
    <li className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 py-1.5 text-[0.75rem]">
      <p className="font-mono font-medium">{formatProtocolSetLabel(protocol)}</p>
      <p className="tabular-nums">
        {comparison.current
          ? formatPrevious(comparison.current.weightKg, comparison.current.reps)
          : workoutSessionCopy.previousEmpty}
      </p>
      <p className="text-muted-foreground tabular-nums">
        {comparison.baseline
          ? formatPrevious(comparison.baseline.weightKg, comparison.baseline.reps)
          : workoutSessionCopy.previousEmpty}
      </p>
      <div className={cn("justify-self-end")}>
        {comparison.delta ? (
          <SessionDeltaChip
            volumeKg={comparison.delta.volumeKg}
            volumePercent={comparison.delta.volumePercent}
            compact
          />
        ) : (
          <span className="text-muted-foreground">{extra}</span>
        )}
      </div>
    </li>
  )
}
