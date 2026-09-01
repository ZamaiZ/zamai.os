"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { themeMeta } from "@/components/layout/shared/themeMeta"
import { Kbd } from "@/components/primitives/kbd"
import { SidebarMenuButton } from "@/components/primitives/sidebar"
import { isThemeValue, nextTheme, type ThemeValue } from "@/lib/theme"

import { sidebarThemeToggleCopy } from "./constants"

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const current: ThemeValue = mounted && isThemeValue(theme) ? theme : "system"
  const meta = themeMeta[current]
  const accessibleLabel = mounted
    ? `${meta.current}. Alterar para ${meta.next}.`
    : sidebarThemeToggleCopy.loading
  const Icon = meta.icon

  return (
    <SidebarMenuButton
      type="button"
      disabled={!mounted}
      tooltip={accessibleLabel}
      aria-label={accessibleLabel}
      onClick={() => setTheme(nextTheme(current))}
      className="h-10 gap-3 rounded-lg px-3 text-sidebar-foreground/65 transition-[color,background-color,transform] duration-150 ease-out hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground active:scale-[0.98] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 motion-reduce:transition-none"
    >
      <Icon aria-hidden />
      <span className="group-data-[collapsible=icon]:hidden">{sidebarThemeToggleCopy.label}</span>
      <Kbd className="ms-auto border border-sidebar-border bg-sidebar-accent/55 text-[0.6rem] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
        {sidebarThemeToggleCopy.hotkey}
      </Kbd>
    </SidebarMenuButton>
  )
}
