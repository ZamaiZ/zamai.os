import {
  ActivityIcon,
  HeartPulseIcon,
  HomeIcon,
  PeopleIcon,
  WeightIcon,
} from "@/components/icons"

import type {
  ProtectedNavigationEntry,
  ProtectedNavigationGroup,
  ProtectedNavigationLink,
} from "./types"

export const protectedNavigation = [
  { type: "link", label: "Início", href: "/", icon: HomeIcon },
  {
    type: "link",
    label: "Clientes",
    href: "/clients",
    icon: PeopleIcon,
  },
  {
    type: "group",
    id: "lifestyle",
    label: "Lifestyle",
    icon: ActivityIcon,
    matchPrefix: "/lifestyle",
    children: [
      {
        type: "link",
        label: "Exercícios",
        href: "/lifestyle/workouts/exercises",
        icon: HeartPulseIcon,
      },
      {
        type: "link",
        label: "Treinos",
        href: "/lifestyle/workouts/plans",
        icon: WeightIcon,
        activePrefixes: ["/lifestyle/workouts/sessions"],
      },
    ],
  },
] as const satisfies readonly ProtectedNavigationEntry[]

export function isProtectedRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isLinkActive(
  pathname: string,
  link: ProtectedNavigationLink
) {
  if (isProtectedRouteActive(pathname, link.href)) return true
  return (link.activePrefixes ?? []).some((prefix) =>
    isProtectedRouteActive(pathname, prefix)
  )
}

export function isGroupActive(
  pathname: string,
  group: ProtectedNavigationGroup
) {
  return isProtectedRouteActive(pathname, group.matchPrefix)
}

function collectLeaves(
  entries: readonly ProtectedNavigationEntry[]
): ProtectedNavigationLink[] {
  const leaves: ProtectedNavigationLink[] = []
  for (const entry of entries) {
    if (entry.type === "link") {
      leaves.push(entry)
    } else {
      leaves.push(...entry.children)
    }
  }
  return leaves
}

export function getNavigationLeaves(): readonly ProtectedNavigationLink[] {
  return collectLeaves(protectedNavigation)
}

export function getProtectedSectionLabel(pathname: string) {
  return (
    getNavigationLeaves().find((item) => isLinkActive(pathname, item))?.label ??
    "Zamai.OS"
  )
}
