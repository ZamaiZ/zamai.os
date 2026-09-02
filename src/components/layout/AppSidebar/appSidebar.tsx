"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDownIcon, ChevronRightIcon, SettingsIcon, UserRoundIcon } from "@/components/icons"

import { logout } from "@/app/actions/logout"
import {
  isGroupActive,
  isLinkActive,
  protectedNavigation,
} from "@/components/layout/ProtectedNavigation"
import type {
  ProtectedNavigationEntry,
  ProtectedNavigationGroup,
  ProtectedNavigationLink,
} from "@/components/layout/ProtectedNavigation"
import { getInitials } from "@/components/layout/shared/getInitials"
import { SidebarBoundaryToggle } from "@/components/layout/SidebarBoundaryToggle"
import { SidebarLogoutButton } from "@/components/layout/SidebarLogoutButton"
import { SidebarThemeToggle } from "@/components/layout/SidebarThemeToggle"
import { NotificationsMenuItem } from "@/components/notifications/NotificationsMenuItem"
import { NotificationUnreadBadge } from "@/components/notifications/NotificationUnreadBadge"
import { useNotifications } from "@/components/notifications/NotificationsProvider"
import { Avatar, AvatarFallback } from "@/components/primitives/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/primitives/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/primitives/dropdownMenu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/primitives/sidebar"
import { cn } from "@/lib/utils"

import type { AppSidebarProps } from "./types"

const menuButtonClassName =
  "relative min-h-10 h-auto gap-3 rounded-lg px-3 py-1.5 text-sidebar-foreground/65 transition-[color,background-color,box-shadow,transform] duration-150 ease-out before:absolute before:start-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground active:scale-[0.98] data-active:bg-sidebar-accent/80 data-active:text-sidebar-accent-foreground data-active:shadow-[inset_0_0_0_1px_var(--sidebar-border)] data-active:before:bg-sidebar-primary data-active:[&>svg]:text-sidebar-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:before:hidden motion-reduce:transition-none"

function SidebarNavLink({
  item,
  pathname,
}: {
  item: ProtectedNavigationLink
  pathname: string
}) {
  const isActive = isLinkActive(pathname, item)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.label}
        isActive={isActive}
        className={menuButtonClassName}
        render={
          <Link
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          />
        }
      >
        <item.icon aria-hidden />
        <span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:hidden">
          {item.label}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarNavGroup({
  group,
  pathname,
}: {
  group: ProtectedNavigationGroup
  pathname: string
}) {
  const { state } = useSidebar()
  const groupActive = isGroupActive(pathname, group)
  const [open, setOpen] = React.useState(groupActive)

  React.useEffect(() => {
    if (groupActive) setOpen(true)
  }, [groupActive])

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            tooltip={group.label}
            isActive={groupActive}
            className={menuButtonClassName}
            render={<DropdownMenuTrigger />}
            aria-label={`${group.label}, menu`}
          >
            <group.icon aria-hidden />
            <span className="sr-only">{group.label}</span>
          </SidebarMenuButton>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-auto min-w-48"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              {group.children.map((child) => {
                const isActive = isLinkActive(pathname, child)

                return (
                  <DropdownMenuItem
                    key={child.href}
                    render={<Link href={child.href} />}
                    className={cn(
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <child.icon aria-hidden />
                    {child.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarMenuButton
          isActive={groupActive}
          className={menuButtonClassName}
          render={<CollapsibleTrigger />}
          aria-expanded={open}
          aria-label={group.label}
        >
          <group.icon aria-hidden />
          <span className="min-w-0 flex-1 truncate">{group.label}</span>
          <ChevronRightIcon
            aria-hidden
            className={cn(
              "size-3.5 shrink-0 text-sidebar-foreground/45 transition-transform duration-150 ease-out motion-reduce:transition-none",
              open && "rotate-90"
            )}
          />
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.children.map((child) => {
              const isActive = isLinkActive(pathname, child)

              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton
                    isActive={isActive}
                    render={
                      <Link
                        href={child.href}
                        aria-current={isActive ? "page" : undefined}
                      />
                    }
                  >
                    <child.icon aria-hidden />
                    <span>{child.label}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function SidebarNavEntry({
  entry,
  pathname,
}: {
  entry: ProtectedNavigationEntry
  pathname: string
}) {
  if (entry.type === "group") {
    return <SidebarNavGroup group={entry} pathname={pathname} />
  }

  return <SidebarNavLink item={entry} pathname={pathname} />
}

export function AppSidebar({ userName }: AppSidebarProps) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const initials = getInitials(userName)
  const { unreadCount } = useNotifications()

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-sidebar-border"
    >
      <SidebarBoundaryToggle />

      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-3 py-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Abrir menu da conta de ${userName}`}
                className="flex h-11 w-full min-w-0 items-center gap-3 rounded-lg px-1.5 text-start outline-none transition-[color,background-color,transform] duration-150 ease-out hover:bg-sidebar-accent/55 focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-[0.98] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:-translate-x-1.5 motion-reduce:transition-none"
              />
            }
          >
            <span className="relative shrink-0">
              <Avatar className="bg-sidebar-accent">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground/65">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <NotificationUnreadBadge
                count={unreadCount}
                className="absolute -top-1 -end-2 shadow-sm ring-2 ring-sidebar"
              />
            </span>
            <span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-[0.72rem] font-semibold tracking-[0.18em] text-sidebar-foreground uppercase">
                {userName}
              </span>
              <span className="mt-1 truncate text-[0.68rem] text-sidebar-foreground/55">
                Zamai.OS
              </span>
            </span>
            <ChevronDownIcon
              aria-hidden
              className="size-3.5 shrink-0 text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserRoundIcon aria-hidden />
                Perfil
              </DropdownMenuItem>
              <NotificationsMenuItem />
              <DropdownMenuItem disabled>
                <SettingsIcon aria-hidden />
                Configurações
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent id="app-sidebar-navigation">
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="h-7 px-3 text-[0.6rem] font-semibold tracking-[0.17em] text-sidebar-foreground/45 uppercase">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Navegação principal">
              <SidebarMenu className="gap-1">
                {protectedNavigation.map((entry) => (
                  <SidebarNavEntry
                    key={entry.type === "group" ? entry.id : entry.href}
                    entry={entry}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2.5">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logout} className="w-full">
              <SidebarLogoutButton />
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
