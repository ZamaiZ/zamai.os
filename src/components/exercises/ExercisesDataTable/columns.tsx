"use client"

import { createColumnHelper } from "@tanstack/react-table"

import {
  ArrowUpDownIcon,
  LightningIcon,
  MoreHorizontalIcon,
  PencilIcon,
} from "@/components/icons"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { parseEquipmentLabel } from "@/components/exercises/shared/equipmentMeta"
import type { CatalogExercise } from "@/components/exercises/shared/types"
import { Button } from "@/components/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"

import { type ExercisesTableFeatures } from "./dataTableFeatures"

const columnHelper = createColumnHelper<
  ExercisesTableFeatures,
  CatalogExercise
>()

function SortableHeader({
  label,
  sorted,
  onToggle,
}: {
  label: string
  sorted: false | "asc" | "desc"
  onToggle: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ms-2 h-8 gap-1.5 px-2 text-foreground"
      onClick={onToggle}
    >
      {label}
      <ArrowUpDownIcon
        aria-hidden
        className={sorted ? "size-3.5 text-primary" : "size-3.5 opacity-50"}
      />
    </Button>
  )
}

export function createExercisesColumns(
  onEdit: (exercise: CatalogExercise) => void
) {
  return columnHelper.columns([
  columnHelper.display({
    id: "thumbnail",
    header: () => <span className="sr-only">Mídia</span>,
    cell: ({ row }) => {
      const exercise = row.original
      const src = exercise.thumbnailUrl ?? exercise.gifUrl

      return (
        <div className="size-10 overflow-hidden rounded-lg bg-muted/60">
          {src ? (
            // External Supabase storage URLs; next/image not required for catalog thumbs.
            <img
              src={src}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <LightningIcon aria-hidden className="size-3.5 opacity-60" />
            </div>
          )}
        </div>
      )
    },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <SortableHeader
        label={exercisesCatalogCopy.columnName}
        sorted={column.getIsSorted()}
        onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    sortFn: "text",
    cell: ({ row }) => (
      <span className="font-medium tracking-tight">{row.original.name}</span>
    ),
  }),
  columnHelper.accessor((row) => row.muscleGroup.name, {
    id: "muscleGroup",
    header: ({ column }) => (
      <SortableHeader
        label={exercisesCatalogCopy.columnMuscleGroup}
        sorted={column.getIsSorted()}
        onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    sortFn: "text",
    cell: ({ row }) => (
      <span className="font-medium text-primary">
        {row.original.muscleGroup.name}
      </span>
    ),
  }),
  columnHelper.accessor((row) => parseEquipmentLabel(row.equipment) || "", {
    id: "equipment",
    header: ({ column }) => (
      <SortableHeader
        label={exercisesCatalogCopy.columnEquipment}
        sorted={column.getIsSorted()}
        onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    sortFn: "text",
    cell: ({ getValue }) => {
      const label = getValue() as string
      return (
        <span className="text-muted-foreground">
          {label || exercisesCatalogCopy.noEquipment}
        </span>
      )
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Ações</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={exercisesCatalogCopy.openRowMenu}
            />
          }
        >
          <MoreHorizontalIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <PencilIcon aria-hidden />
              {exercisesCatalogCopy.editExerciseMenu}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
])
}
