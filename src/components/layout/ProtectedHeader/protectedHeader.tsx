"use client"

import { usePathname } from "next/navigation"

import { getProtectedSectionLabel } from "@/components/layout/ProtectedNavigation"
import { PwaActions } from "@/components/pwa/PwaActions"

import { protectedHeaderCopy } from "./constants"

export function ProtectedHeader() {
  const pathname = usePathname()
  const sectionLabel = getProtectedSectionLabel(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
      <nav aria-label={protectedHeaderCopy.locationAriaLabel} className="flex min-w-0 items-center gap-2">
        <span className="hidden text-xs font-medium tracking-wide text-muted-foreground sm:inline">
          {protectedHeaderCopy.brandName}
        </span>
        <span aria-hidden className="hidden text-border sm:inline">
          /
        </span>
        <span className="truncate text-sm font-semibold">{sectionLabel}</span>
      </nav>
      <div className="hidden md:block">
        <PwaActions compact />
      </div>
    </header>
  )
}
