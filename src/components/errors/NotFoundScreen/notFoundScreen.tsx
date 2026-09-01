"use client"

import { CompassIcon, HomeIcon, LogInIcon } from "@/components/icons"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@/components/primitives/button"
import { cn } from "@/lib/utils"

import { notFoundCopy, revealVariants } from "./constants"
import type { NotFoundScreenProps } from "./types"

export function NotFoundScreen({
  ctaHref,
  ctaLabel,
}: NotFoundScreenProps): React.JSX.Element {
  const reduceMotion = useReducedMotion()
  const CtaIcon = ctaHref === "/login" ? LogInIcon : HomeIcon

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-1/4 left-1/2 size-[120vmin] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute right-[-10%] bottom-[-20%] size-[80vmin] rounded-full bg-foreground/5 blur-3xl motion-safe:animate-pulse motion-safe:[animation-delay:1.2s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklch,var(--background)_40%,transparent)_100%)]" />
      </div>

      <section className="relative z-10 flex min-h-svh flex-col items-center justify-center px-5 py-12 text-center sm:px-10">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          transition={{ staggerChildren: reduceMotion ? 0 : 0.08 }}
          className="mx-auto flex w-full max-w-lg flex-col items-center"
        >
          <motion.div
            variants={revealVariants}
            className="mb-8 grid size-20 place-items-center rounded-2xl border border-primary/20 bg-primary/5 text-primary motion-safe:animate-pulse"
          >
            <CompassIcon
              aria-hidden
              className="size-9 motion-safe:animate-[spin_12s_linear_infinite] motion-reduce:animate-none"
            />
          </motion.div>

          <motion.p
            variants={revealVariants}
            className="font-mono text-5xl font-semibold tracking-tight text-primary sm:text-6xl"
          >
            {notFoundCopy.code}
          </motion.p>

          <motion.h1
            variants={revealVariants}
            className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {notFoundCopy.title}
          </motion.h1>

          <motion.p
            variants={revealVariants}
            className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base"
          >
            {notFoundCopy.description}
          </motion.p>

          <motion.div variants={revealVariants} className="mt-9 flex justify-center">
            <Link
              href={ctaHref}
              className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-6")}
            >
              <CtaIcon aria-hidden className="size-4" />
              {ctaLabel}
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
