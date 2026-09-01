import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons"

import type { ThemeMeta } from "./types"

export const themeMeta: ThemeMeta = {
  system: {
    icon: MonitorIcon,
    current: "Tema do sistema",
    next: "tema claro",
  },
  light: {
    icon: SunIcon,
    current: "Tema claro",
    next: "tema escuro",
  },
  dark: {
    icon: MoonIcon,
    current: "Tema escuro",
    next: "tema do sistema",
  },
}
