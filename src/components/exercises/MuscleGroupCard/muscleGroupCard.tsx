"use client"

import { NeonGlowCard } from "@/components/exercises/NeonGlowCard"
import { MuscleGroupIcon } from "@/components/exercises/MuscleGroupIcon"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import type { MuscleGroupWithCount } from "@/components/exercises/shared/types"
import { MoreHorizontalIcon, PencilIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"

type MuscleGroupCardProps = {
  group: MuscleGroupWithCount
  onSelect: (slug: string) => void
  onEdit: (group: MuscleGroupWithCount) => void
}

export function MuscleGroupCard({
  group,
  onSelect,
  onEdit,
}: MuscleGroupCardProps) {
  return (
    <NeonGlowCard className="h-full">
      <div className="flex w-full items-center gap-2 p-3 pe-2">
        <button
          type="button"
          onClick={() => onSelect(group.slug)}
          className="flex min-w-0 flex-1 items-center gap-3 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/50 text-primary">
            <MuscleGroupIcon svg={group.iconSvg} className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold tracking-tight">
              {group.name}
            </span>
            <span className="mt-0.5 block text-[0.68rem] text-muted-foreground">
              {group.exerciseCount}{" "}
              {group.exerciseCount === 1 ? "exercício" : "exercícios"}
            </span>
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={exercisesCatalogCopy.openGroupMenu}
                className="shrink-0"
                onClick={(event) => event.stopPropagation()}
              />
            }
          >
            <MoreHorizontalIcon aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(group)
                }}
              >
                <PencilIcon aria-hidden />
                {exercisesCatalogCopy.editMuscleGroupMenu}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </NeonGlowCard>
  )
}
