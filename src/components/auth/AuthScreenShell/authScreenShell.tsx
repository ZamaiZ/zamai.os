"use client"

import { motion, useReducedMotion } from "motion/react"

import { authScreenShellCopy, revealVariants } from "./constants"
import type { AuthScreenShellProps } from "./types"

export function AuthScreenShell({ children, description, title }: AuthScreenShellProps) {
  const reduceMotion = useReducedMotion()

  return (
    <main className="relative min-h-svh overflow-hidden bg-background lg:grid lg:grid-cols-[42%_58%]">
      <section className="relative z-10 flex min-h-svh items-center px-5 py-12 sm:px-10 lg:bg-background lg:px-12 xl:px-20">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          transition={{ staggerChildren: reduceMotion ? 0 : 0.07 }}
          className="mx-auto w-full max-w-md"
        >
          <motion.div variants={revealVariants} className="mb-10 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-primary/25 bg-primary/10 text-sm font-semibold text-primary">
              {authScreenShellCopy.brandShort}
            </span>
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">
              {authScreenShellCopy.brandName}
            </span>
          </motion.div>
          <motion.p variants={revealVariants} className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            {authScreenShellCopy.tagline}
          </motion.p>
          <motion.h1 variants={revealVariants} className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </motion.h1>
          <motion.p variants={revealVariants} className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </motion.p>
          <motion.div variants={revealVariants} className="mt-9">{children}</motion.div>
        </motion.div>
      </section>

      <aside aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-foreground lg:relative lg:z-auto lg:h-svh">
        <video autoPlay className="absolute inset-0 h-full w-full scale-105 object-cover object-center blur-sm brightness-75 lg:scale-100 lg:blur-none lg:brightness-100" loop muted playsInline preload="auto">
          <source src={authScreenShellCopy.videoSrc} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-background/75 lg:hidden" />
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(110deg,color-mix(in_oklch,var(--background)_24%,transparent),transparent_48%,color-mix(in_oklch,var(--foreground)_18%,transparent))] lg:block" />
        <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_72%_36%,transparent_0%,color-mix(in_oklch,var(--foreground)_24%,transparent)_74%)] lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-36 bg-gradient-to-t from-background/20 via-transparent to-transparent lg:block" />
      </aside>
    </main>
  )
}
