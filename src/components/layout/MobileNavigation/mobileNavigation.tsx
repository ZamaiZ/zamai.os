"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, LogOutIcon, MenuIcon } from "@/components/icons"
import { useTheme } from "next-themes"
import { useFormStatus } from "react-dom"

import { logout } from "@/app/actions/logout"
import {
  getNavigationLeaves,
  isProtectedRouteActive,
} from "@/components/layout/ProtectedNavigation"
import { getInitials } from "@/components/layout/shared/getInitials"
import { themeMeta } from "@/components/layout/shared/themeMeta"
import { NotificationsMenuItem } from "@/components/notifications/NotificationsMenuItem"
import { NotificationUnreadBadge } from "@/components/notifications/NotificationUnreadBadge"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { PwaActions } from "@/components/pwa/PwaActions"
import { Avatar, AvatarFallback } from "@/components/primitives/avatar"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/primitives/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"
import { Spinner } from "@/components/primitives/spinner"
import { isThemeValue, nextTheme, type ThemeValue } from "@/lib/theme"
import { cn } from "@/lib/utils"

import { mobileNavigationCopy } from "./constants"
import type { MobileNavigationProps } from "./types"

function MobileThemeItem() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const current: ThemeValue = mounted && isThemeValue(theme) ? theme : "system"
  const meta = themeMeta[current]
  const Icon = meta.icon

  return (
    <DropdownMenuItem
      closeOnClick={false}
      disabled={!mounted}
      aria-label={`${meta.current}. Alterar para ${meta.next}.`}
      onClick={() => setTheme(nextTheme(current))}
      className="min-h-11 cursor-pointer"
    >
      <Icon aria-hidden />
      <span className="flex-1">{mobileNavigationCopy.themeLabel}</span>
      <span className="text-xs text-muted-foreground">{meta.current}</span>
    </DropdownMenuItem>
  )
}

function MobileLogoutItem() {
  const { pending } = useFormStatus()

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={pending}
      nativeButton
      render={<button type="submit" />}
      aria-busy={pending || undefined}
      aria-label={mobileNavigationCopy.logout}
      className="min-h-11 w-full cursor-pointer"
    >
      {pending ? <Spinner aria-hidden /> : <LogOutIcon aria-hidden />}
      {pending ? mobileNavigationCopy.loggingOut : mobileNavigationCopy.logout}
    </DropdownMenuItem>
  )
}

export function MobileNavigation({ userName }: MobileNavigationProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const initials = getInitials(userName)
  const isHome = pathname === "/"
  const { unreadCount } = useNotifications()

  React.useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <nav
      aria-label={mobileNavigationCopy.navAriaLabel}
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:hidden"
    >
      <div className="grid h-[4.25rem] grid-cols-3 items-center rounded-2xl border border-border/70 bg-background/85 px-3 shadow-2xl shadow-foreground/10 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label={mobileNavigationCopy.accountMenuLabel(userName)}
                  className="flex size-11 items-center justify-center gap-0.5 rounded-xl outline-none transition-[background-color,transform] duration-150 hover:bg-accent active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                />
              }
            >
              <span className="relative flex items-center">
                <Avatar className="size-9 bg-muted">
                  <AvatarFallback className="bg-muted text-xs font-semibold tracking-wide text-foreground/75">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <NotificationUnreadBadge
                  count={unreadCount}
                  className="absolute -top-1 -end-2 shadow-sm ring-2 ring-background"
                />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={12}
              className="w-60"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="min-w-0">
                  <span className="block truncate font-medium text-foreground">
                    {userName}
                  </span>
                  <span className="mt-0.5 block text-[0.68rem] tracking-wide uppercase">
                    {mobileNavigationCopy.accountSection}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <NotificationsMenuItem />
                <DropdownMenuSeparator />
                <MobileThemeItem />
                <PwaActions compact />
                <DropdownMenuSeparator />
                <form action={logout}>
                  <MobileLogoutItem />
                </form>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            aria-label={mobileNavigationCopy.homeAriaLabel}
            aria-current={isHome ? "page" : undefined}
            className={cn(
              "relative -translate-y-3.5 flex size-14 items-center justify-center rounded-[1.125rem] border outline-none shadow-lg transition-[color,background-color,border-color,transform] duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
              isHome
                ? "border-primary bg-primary text-primary-foreground shadow-primary/20"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <HomeIcon aria-hidden className="size-5.5" />
          </Link>
        </div>

        <div className="flex justify-end">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} showSwipeHandle>
            <DrawerTrigger
              render={
                <button
                  type="button"
                  aria-label={drawerOpen ? mobileNavigationCopy.closeNav : mobileNavigationCopy.openNav}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl text-muted-foreground outline-none transition-[color,background-color,transform] duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
                    drawerOpen && "bg-accent text-accent-foreground"
                  )}
                />
              }
            >
              <MenuIcon aria-hidden className="size-5" />
            </DrawerTrigger>
            <DrawerContent className="md:hidden">
              <DrawerHeader className="px-5 pt-2 pb-4 text-start">
                <DrawerTitle>{mobileNavigationCopy.drawerTitle}</DrawerTitle>
                <DrawerDescription>{mobileNavigationCopy.drawerDescription}</DrawerDescription>
              </DrawerHeader>
              <div className="min-h-0 overflow-y-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="space-y-1">
                  {getNavigationLeaves().map((item) => {
                    const isActive = isProtectedRouteActive(pathname, item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-[color,background-color,transform] duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                            isActive
                              ? "border-primary/20 bg-primary/10"
                              : "border-border/70 bg-muted/45"
                          )}
                        >
                          <item.icon aria-hidden className="size-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{item.label}</span>
                          {item.subtitle ? (
                            <span className="mt-0.5 block truncate text-[0.68rem] font-normal tracking-wide text-muted-foreground">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </span>
                        {isActive ? (
                          <span
                            aria-hidden
                            className="ms-auto size-1.5 shrink-0 rounded-full bg-primary"
                          />
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  )
}
