"use client"

import { motion, useReducedMotion } from "motion/react"

import { clientsCatalogCopy } from "@/components/clients/shared/constants"
import { PeopleIcon, SearchIcon } from "@/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/primitives/empty"
import { cn } from "@/lib/utils"

type ClientsEmptyStateProps = {
  variant: "saved" | "batch"
  className?: string
}

export function ClientsEmptyState({
  variant,
  className,
}: ClientsEmptyStateProps) {
  const reduceMotion = useReducedMotion()
  const isSaved = variant === "saved"
  const Icon = isSaved ? PeopleIcon : SearchIcon

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
            <Icon aria-hidden className="size-6" />
          </motion.div>
        </EmptyMedia>
        <EmptyTitle>
          {isSaved
            ? clientsCatalogCopy.emptySavedTitle
            : clientsCatalogCopy.emptyBatchTitle}
        </EmptyTitle>
        <EmptyDescription>
          {isSaved
            ? clientsCatalogCopy.emptySavedDescription
            : clientsCatalogCopy.emptyBatchDescription}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
