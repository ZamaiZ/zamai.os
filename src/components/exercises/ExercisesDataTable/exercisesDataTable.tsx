"use client"

import * as React from "react"
import {
  useTable,
  type SortingState,
} from "@tanstack/react-table"
import { motion, useReducedMotion } from "motion/react"

import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import type { CatalogExercise } from "@/components/exercises/shared/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table"
import { cn } from "@/lib/utils"

import { createExercisesColumns } from "./columns"
import { exercisesTableFeatures } from "./dataTableFeatures"

type ExercisesDataTableProps = {
  data: CatalogExercise[]
  onEdit: (exercise: CatalogExercise) => void
}

export function ExercisesDataTable({ data, onEdit }: ExercisesDataTableProps) {
  const reduceMotion = useReducedMotion()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const columns = React.useMemo(
    () => createExercisesColumns(onEdit),
    [onEdit]
  )

  const table = useTable({
    features: exercisesTableFeatures,
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const rows = table.getRowModel().rows
  const columnCount = table.getAllColumns().length

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.column.id === "actions" && "w-12 text-end",
                    header.column.id === "thumbnail" && "w-14"
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row, index) => (
              <motion.tr
                key={row.id}
                data-slot="table-row"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.18,
                  delay: Math.min(index, 16) * 0.015,
                  ease: "easeOut",
                }}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id === "actions" && "text-end",
                      "py-2.5"
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="h-24 text-center text-muted-foreground"
              >
                {exercisesCatalogCopy.emptyExercisesTitle}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
