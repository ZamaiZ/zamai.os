"use client"

import { ChevronLeftIcon } from "@/components/icons"

import { useSidebar } from "@/components/primitives/sidebar"
import { cn } from "@/lib/utils"

import { sidebarBoundaryToggleCopy } from "./constants"

export function SidebarBoundaryToggle() {
  const { state, toggleSidebar } = useSidebar()
  const isExpanded = state === "expanded"
  const label = isExpanded
    ? sidebarBoundaryToggleCopy.collapse
    : sidebarBoundaryToggleCopy.expand

  return (
    <button
      type="button"
      aria-controls={sidebarBoundaryToggleCopy.navigationId}
      aria-expanded={isExpanded}
      aria-label={label}
      title={`${label} (${sidebarBoundaryToggleCopy.shortcut})`}
      onClick={toggleSidebar}
      className={cn(
        "absolute top-4 right-0 z-30 hidden size-8 translate-x-1/2 items-center justify-center rounded-full border border-dashed border-sidebar-border bg-sidebar text-sidebar-foreground/60 md:flex",
        "transition-[color,background-color,border-color,transform] duration-150 ease-out",
        "hover:border-sidebar-primary/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring",
        "active:scale-95 motion-reduce:transition-none"
      )}
    >
      <ChevronLeftIcon
        aria-hidden
        className={cn(
          "size-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          !isExpanded && "rotate-180"
        )}
      />
    </button>
  )
}
