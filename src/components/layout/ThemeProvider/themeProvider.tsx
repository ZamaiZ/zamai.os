"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

import { nextTheme } from "@/lib/theme"

import { themeHotkey, themeProviderConfig } from "./constants"
import type { ThemeProviderProps } from "./types"
import { isTypingTarget } from "./utils"

function ThemeHotkey() {
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      const isAltGraph =
        typeof event.getModifierState === "function" &&
        event.getModifierState("AltGraph")

      if (event.metaKey || isAltGraph) {
        return
      }

      if (!event.ctrlKey || !event.altKey || event.code !== themeHotkey.code) {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      event.preventDefault()
      setTheme(nextTheme(theme))
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [theme, setTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...themeProviderConfig}
      scriptProps={
        typeof window === "undefined"
          ? undefined
          : { type: "application/json" }
      }
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}
