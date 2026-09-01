"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type NeonGlowCardProps = React.ComponentProps<"div"> & {
  disabled?: boolean
}

export function NeonGlowCard({
  disabled = false,
  ...props
}: NeonGlowCardProps) {
  if (disabled) {
    return <StaticCatalogCard {...props} />
  }

  return <GlowCatalogCard {...props} />
}

function StaticCatalogCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neon-glow-card"
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function GlowCatalogCard({
  className,
  children,
  onPointerMove,
  onPointerLeave,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const [glow, setGlow] = React.useState({ x: 50, y: 50 })
  const [active, setActive] = React.useState(false)
  const [reduceMotion, setReduceMotion] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return (
    <div
      data-slot="neon-glow-card"
      className={cn(
        "group/neon relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-[border-color,box-shadow] duration-200",
        "hover:border-primary/30 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_12%,transparent),0_8px_20px_-14px_color-mix(in_oklab,var(--primary)_22%,transparent)] dark:hover:border-primary/35 dark:hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_18%,transparent),0_8px_24px_-12px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
        className
      )}
      style={
        {
          ...style,
          "--glow-x": `${glow.x}%`,
          "--glow-y": `${glow.y}%`,
        } as React.CSSProperties
      }
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (reduceMotion) return
        const rect = event.currentTarget.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100
        const y = ((event.clientY - rect.top) / rect.height) * 100
        setGlow({ x, y })
        setActive(true)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setActive(false)
      }}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200",
          active && !reduceMotion && "opacity-60 dark:opacity-100",
          reduceMotion &&
            "group-hover/neon:opacity-40 dark:group-hover/neon:opacity-70"
        )}
        style={{
          background: `radial-gradient(120px circle at var(--glow-x) var(--glow-y), color-mix(in oklab, var(--primary) 16%, transparent), transparent 65%)`,
        }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200",
          active && !reduceMotion && "opacity-50 dark:opacity-100",
          reduceMotion &&
            "group-hover/neon:opacity-40 dark:group-hover/neon:opacity-80"
        )}
        style={{
          padding: 1,
          background: `radial-gradient(180px circle at var(--glow-x) var(--glow-y), color-mix(in oklab, var(--primary) 55%, transparent), transparent 55%)`,
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
