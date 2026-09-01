import type { AppIcon } from "@/components/icons"

export type ProtectedNavigationItem = {
  readonly label: string
  readonly href: string
  readonly icon: AppIcon
  readonly subtitle?: string
}
