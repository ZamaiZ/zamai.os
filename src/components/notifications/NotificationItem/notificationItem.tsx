"use client"

import { CheckIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"

import { notificationsCopy } from "../shared/constants"
import { formatNotificationTime } from "../shared/formatNotificationTime"
import type { NotificationItemData } from "../shared/types"

type NotificationItemProps = {
  item: NotificationItemData
  onMarkAsRead: (id: string) => void
  isPending?: boolean
}

export function NotificationItem({
  item,
  onMarkAsRead,
  isPending = false,
}: NotificationItemProps) {
  return (
    <div className="group/notification flex gap-2 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent/50">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {item.body}
        </p>
        <p className="mt-1.5 text-[0.68rem] text-muted-foreground/80">
          {formatNotificationTime(item.createdAt)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        aria-label={notificationsCopy.markAsRead}
        className="mt-0.5 shrink-0 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 group-hover/notification:opacity-100"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onMarkAsRead(item.id)
        }}
      >
        <CheckIcon aria-hidden />
      </Button>
    </div>
  )
}
