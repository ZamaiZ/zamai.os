"use client"

import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { LayersIcon, PeopleIcon } from "@/components/icons"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/primitives/toggleGroup"
import { cn } from "@/lib/utils"

import type { CreationMode } from "./drafts"

type ModeSwitchProps = {
  value: CreationMode
  onChange: (mode: CreationMode) => void
  disabled?: boolean
  canSwitchToSingle?: boolean
}

export function ModeSwitch({
  value,
  onChange,
  disabled = false,
  canSwitchToSingle = true,
}: ModeSwitchProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(values) => {
        const next = values[0]
        if (next !== "single" && next !== "bulk") return
        if (next === "single" && !canSwitchToSingle) return
        onChange(next)
      }}
      multiple={false}
      variant="outline"
      size="sm"
      spacing={0}
      className="mx-auto h-10 w-full max-w-sm rounded-2xl"
      disabled={disabled}
    >
      <ToggleGroupItem
        value="single"
        disabled={disabled}
        className={cn(
          "h-10 flex-1 rounded-s-2xl px-3 text-xs sm:text-sm",
          "aria-pressed:bg-primary/12 aria-pressed:text-primary"
        )}
      >
        <PeopleIcon data-icon="inline-start" className="size-3.5" aria-hidden />
        {exercisesCatalogCopy.creationModeIndividual}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="bulk"
        disabled={disabled}
        className={cn(
          "h-10 flex-1 rounded-e-2xl px-3 text-xs sm:text-sm",
          "aria-pressed:bg-primary/12 aria-pressed:text-primary"
        )}
      >
        <LayersIcon data-icon="inline-start" className="size-3.5" aria-hidden />
        {exercisesCatalogCopy.creationModeBulk}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
