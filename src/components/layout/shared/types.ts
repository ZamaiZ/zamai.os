import type { AppIcon } from "@/components/icons"

import type { ThemeValue } from "@/lib/theme"

export type ThemeMetaEntry = {
  icon: AppIcon
  current: string
  next: string
}

export type ThemeMeta = Record<ThemeValue, ThemeMetaEntry>
