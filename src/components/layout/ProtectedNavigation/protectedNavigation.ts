import { HomeIcon, HeartPulseIcon, PeopleIcon } from "@/components/icons"

import type { ProtectedNavigationItem } from "./types"

export const protectedNavigation = [
  { label: "Início", href: "/", icon: HomeIcon },
  {
    label: "Clientes",
    href: "/clients",
    icon: PeopleIcon,
  },
  {
    label: "Exercícios",
    href: "/lifestyle/workouts/exercises",
    icon: HeartPulseIcon,
    subtitle: "Lifestyle · Treinos",
  },
] as const satisfies readonly ProtectedNavigationItem[]

export function isProtectedRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getProtectedSectionLabel(pathname: string) {
  return (
    protectedNavigation.find((item) =>
      isProtectedRouteActive(pathname, item.href)
    )?.label ?? "Zamai.OS"
  )
}

export function getNavigationLeaves(): readonly ProtectedNavigationItem[] {
  return protectedNavigation
}
