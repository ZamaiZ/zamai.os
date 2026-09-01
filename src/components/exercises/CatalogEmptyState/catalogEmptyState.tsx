"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import {
  LightningIcon,
  MuscularTorsoIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons"
import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
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

type CatalogEmptyStateProps = {
  variant: "exercises" | "groups"
  onCreateExercise?: () => void
  onClearSearch?: () => void
  className?: string
}

export function CatalogEmptyState({
  variant,
  onCreateExercise,
  onClearSearch,
  className,
}: CatalogEmptyStateProps) {
  const reduceMotion = useReducedMotion()
  const isExercises = variant === "exercises"
  const Icon = isExercises ? LightningIcon : MuscularTorsoIcon

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
          <motion.span
            aria-hidden
            className="absolute -top-1 -end-1 size-2.5 rounded-full bg-primary/70 shadow-[0_0_10px_2px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }
            }
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.span
            aria-hidden
            className="absolute -bottom-0.5 -start-1 size-1.5 rounded-full bg-primary/50"
            animate={
              reduceMotion
                ? undefined
                : { y: [0, 4, 0], opacity: [0.35, 0.9, 0.35] }
            }
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
          <motion.div
            className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-background text-primary shadow-sm"
            animate={
              reduceMotion ? undefined : { y: [0, -4, 0], rotate: [0, -3, 3, 0] }
            }
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon aria-hidden className="size-6" />
          </motion.div>
        </EmptyMedia>
        <EmptyTitle>
          {isExercises
            ? exercisesCatalogCopy.emptyExercisesTitle
            : exercisesCatalogCopy.emptyGroupsTitle}
        </EmptyTitle>
        <EmptyDescription>
          {isExercises
            ? exercisesCatalogCopy.emptyExercisesDescription
            : exercisesCatalogCopy.emptyGroupsDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isExercises ? (
          <Button type="button" size="sm" onClick={onCreateExercise}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            {exercisesCatalogCopy.emptyCreateCta}
          </Button>
        ) : onClearSearch ? (
          <Button type="button" size="sm" variant="outline" onClick={onClearSearch}>
            <SearchIcon data-icon="inline-start" aria-hidden />
            {exercisesCatalogCopy.emptyClearSearchCta}
          </Button>
        ) : null}
      </EmptyContent>
    </Empty>
  )
}
