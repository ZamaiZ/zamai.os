"use client"

import { BellFillIcon, BellIcon } from "@/components/icons"
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/primitives/dropdownMenu"

import { NotificationList } from "../NotificationList"
import { NotificationUnreadBadge } from "../NotificationUnreadBadge"
import { useNotifications } from "../NotificationsProvider"
import { notificationsCopy } from "../shared/constants"

export function NotificationsMenuItem() {
  const { unreadCount } = useNotifications()
  const Icon = unreadCount > 0 ? BellFillIcon : BellIcon

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className="cursor-pointer"
        aria-label={
          unreadCount > 0
            ? `${notificationsCopy.menuLabel}, ${unreadCount > 9 ? "mais de 9" : unreadCount} não lidas`
            : `${notificationsCopy.menuLabel}, nenhuma nova`
        }
      >
        <Icon aria-hidden />
        <span className="flex-1">{notificationsCopy.menuLabel}</span>
        <NotificationUnreadBadge count={unreadCount} />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        align="start"
        side="inline-end"
        sideOffset={8}
        className="w-auto min-w-0 overflow-hidden p-0"
      >
        <NotificationList />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
