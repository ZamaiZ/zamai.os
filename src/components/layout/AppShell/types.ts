import type { CSSProperties, ReactNode } from "react"

export type AppShellProps = {
  children: ReactNode
  defaultOpen: boolean
  userId: string
  userName: string
}

export type SidebarCssVars = CSSProperties & {
  "--sidebar-width": string
  "--sidebar-width-icon": string
}
