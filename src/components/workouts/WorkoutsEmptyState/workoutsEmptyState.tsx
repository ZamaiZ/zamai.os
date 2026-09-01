"use client"

import { motion, useReducedMotion } from "motion/react"

import { PlusIcon, SearchIcon, WeightIcon } from "@/components/icons"
import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import { Button } from "@/components/primitives/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/primitives/empty"
import { cn } from "@/lib/utils"

type WorkoutsEmptyStateProps = {
  variant: "none" | "search" | "editor"
  onCreate?: () => void
  onClearSearch?: () => void
  className?: string
}

export function WorkoutsEmptyState({
  variant,
  onCreate,
  onClearSearch,
  className,
}: WorkoutsEmptyStateProps) {
  const reduceMotion = useReducedMotion()
  const isSearch = variant === "search"
  const isEditor = variant === "editor"
  const title = isSearch
    ? workoutsCatalogCopy.emptySearchTitle
    : isEditor
      ? workoutsCatalogCopy.emptyEditorTitle
      : workoutsCatalogCopy.emptyTitle
  const description = isSearch
    ? workoutsCatalogCopy.emptySearchDescription
    : isEditor
      ? workoutsCatalogCopy.emptyEditorDescription
      : workoutsCatalogCopy.emptyDescription

  return (
    <Empty
      className={cn(
        "border border-dashed border-border/80 bg-card/40 py-14",
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="default" className="relative mb-3 size-16">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/10"
            aria-hidden
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.08, 1],
                    opacity: [0.45, 0.75, 0.45],
                  }
            }
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-background text-primary shadow-sm"
            animate={
              reduceMotion ? undefined : { y: [0, -4, 0] }
            }
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {isSearch ? (
              <SearchIcon aria-hidden className="size-6" />
            ) : (
              <WeightIcon aria-hidden className="size-6" />
            )}
          </motion.div>
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isSearch ? (
          <Button type="button" size="sm" variant="outline" onClick={onClearSearch}>
            <SearchIcon data-icon="inline-start" aria-hidden />
            {workoutsCatalogCopy.emptyClearSearchCta}
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={onCreate}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            {isEditor
              ? workoutsCatalogCopy.addExercise
              : workoutsCatalogCopy.emptyCreateCta}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}
