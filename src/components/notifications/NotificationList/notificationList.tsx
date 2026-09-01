"use client"

import Link from "next/link"
import { BellIcon } from "@/components/icons"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/primitives/empty"
import { Button } from "@/components/primitives/button"
import { Spinner } from "@/components/primitives/spinner"
import { cn } from "@/lib/utils"

import { NotificationItem } from "../NotificationItem"
import { useNotifications } from "../NotificationsProvider"
import { notificationsCopy } from "../shared/constants"

type NotificationListProps = {
  className?: string
}

export function NotificationList({ className }: NotificationListProps) {
  const {
    items,
    unreadCount,
    isLoadingInitial,
    isLoadingMore,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  return (
    <div className={cn("flex w-[min(100vw-2.5rem,22rem)] flex-col", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <p className="text-sm font-medium">{notificationsCopy.panelTitle}</p>
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void markAllAsRead()
            }}
          >
            {notificationsCopy.markAll}
          </Button>
        ) : null}
      </div>

      <div className="max-h-80 min-h-28 overflow-y-auto px-1 py-1">
        {isLoadingInitial ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-5" />
          </div>
        ) : items.length === 0 ? (
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellIcon aria-hidden />
              </EmptyMedia>
              <EmptyTitle className="text-sm">
                {notificationsCopy.emptyTitle}
              </EmptyTitle>
              <EmptyDescription className="text-xs">
                {notificationsCopy.emptyDescription}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col">
            {items.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onMarkAsRead={(id) => void markAsRead(id)}
              />
            ))}
            {hasMore ? (
              <div className="px-2 pb-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={isLoadingMore}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    void loadMore()
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <Spinner className="size-3.5" />
                      {notificationsCopy.loadingMore}
                    </>
                  ) : (
                    notificationsCopy.loadMore
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 p-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-xs"
          nativeButton={false}
          render={<Link href={notificationsCopy.viewAllHref} />}
        >
          {notificationsCopy.viewAll}
        </Button>
      </div>
    </div>
  )
}
