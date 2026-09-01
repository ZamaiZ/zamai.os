"use client"

import { MuscularTorsoIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

type MuscleGroupIconProps = {
  svg: string | null | undefined
  className?: string
}

export function MuscleGroupIcon({ svg, className }: MuscleGroupIconProps) {
  if (svg) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-full",
          className
        )}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }

  return (
    <MuscularTorsoIcon
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    />
  )
}
