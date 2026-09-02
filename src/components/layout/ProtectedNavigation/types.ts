import type { AppIcon } from "@/components/icons"

export type ProtectedNavigationLink = {
  readonly type: "link"
  readonly label: string
  readonly href: string
  readonly icon: AppIcon
  readonly activePrefixes?: readonly string[]
}

export type ProtectedNavigationGroup = {
  readonly type: "group"
  readonly id: string
  readonly label: string
  readonly icon: AppIcon
  readonly matchPrefix: string
  readonly children: readonly ProtectedNavigationLink[]
}

export type ProtectedNavigationEntry =
  | ProtectedNavigationLink
  | ProtectedNavigationGroup

/** @deprecated Use ProtectedNavigationLink */
export type ProtectedNavigationItem = ProtectedNavigationLink
