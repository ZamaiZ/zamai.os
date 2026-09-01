"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"

import {
  countUnreadNotifications,
  listUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/actions/notifications"
import { toast } from "@/components/primitives/toast"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

import { NOTIFICATIONS_PAGE_SIZE, notificationsCopy } from "../shared/constants"
import type { NotificationItemData, NotificationsContextValue } from "../shared/types"

import type { NotificationsProviderProps } from "./types"

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"]

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

function toItem(row: {
  id: string
  title: string
  body: string
  created_at: string
}): NotificationItemData {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  }
}

function isNotificationRow(value: unknown): value is NotificationRow {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.body === "string" &&
    typeof row.created_at === "string"
  )
}

/** Extracts the row from a realtime.broadcast_changes payload. */
function getBroadcastRecord(payload: unknown): NotificationRow | null {
  if (!payload || typeof payload !== "object") return null
  const root = payload as Record<string, unknown>
  const nested =
    root.payload && typeof root.payload === "object"
      ? (root.payload as Record<string, unknown>)
      : root

  if (isNotificationRow(nested.record)) return nested.record
  if (isNotificationRow(nested.new)) return nested.new
  if (isNotificationRow(nested)) return nested
  return null
}

export function NotificationsProvider({
  children,
  userId,
}: NotificationsProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<NotificationItemData[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [, startTransition] = useTransition()
  const itemsRef = useRef(items)
  itemsRef.current = items

  const refreshInitial = useCallback(async () => {
    const [count, list] = await Promise.all([
      countUnreadNotifications(),
      listUnreadNotifications({ limit: NOTIFICATIONS_PAGE_SIZE }),
    ])
    setUnreadCount(count)
    setItems(list.items.map(toItem))
    setHasMore(list.hasMore)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoadingInitial(true)
      try {
        await refreshInitial()
      } catch (error) {
        console.error("Failed to load notifications", error)
      } finally {
        if (!cancelled) setIsLoadingInitial(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [refreshInitial])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function subscribe() {
      await supabase.realtime.setAuth()
      if (cancelled) return

      channel = supabase
        .channel(`notifications:${userId}`, {
          config: { private: true },
        })
        .on("broadcast", { event: "INSERT" }, (message) => {
          const row = getBroadcastRecord(message)
          if (!row || row.read_at) return

          setUnreadCount((count) => count + 1)
          setItems((prev) => {
            if (prev.some((item) => item.id === row.id)) return prev
            return [toItem(row), ...prev]
          })

          toast.add({
            type: "info",
            title: row.title,
            description: row.body,
          })
        })
        .on("broadcast", { event: "UPDATE" }, (message) => {
          const row = getBroadcastRecord(message)
          if (!row?.read_at) return

          setItems((prev) => {
            const existed = prev.some((item) => item.id === row.id)
            if (existed) {
              setUnreadCount((count) => Math.max(0, count - 1))
            }
            return prev.filter((item) => item.id !== row.id)
          })
        })
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Notifications realtime subscription failed", status, err)
          }
        })
    }

    void subscribe()

    return () => {
      cancelled = true
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [userId])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    const last = itemsRef.current.at(-1)
    if (!last) return

    setIsLoadingMore(true)
    try {
      const list = await listUnreadNotifications({
        limit: NOTIFICATIONS_PAGE_SIZE,
        cursor: { createdAt: last.createdAt, id: last.id },
      })
      setItems((prev) => {
        const existing = new Set(prev.map((item) => item.id))
        const next = list.items
          .map(toItem)
          .filter((item) => !existing.has(item.id))
        return [...prev, ...next]
      })
      setHasMore(list.hasMore)
    } catch (error) {
      console.error("Failed to load more notifications", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoadingMore])

  const markAsRead = useCallback(async (id: string) => {
    const previousItems = itemsRef.current
    const existed = previousItems.some((item) => item.id === id)

    setItems((prev) => prev.filter((item) => item.id !== id))
    if (existed) {
      setUnreadCount((count) => Math.max(0, count - 1))
    }

    try {
      await markNotificationAsRead(id)
    } catch (error) {
      console.error("Failed to mark notification as read", error)
      startTransition(() => {
        void refreshInitial()
      })
    }
  }, [refreshInitial])

  const markAllAsRead = useCallback(async () => {
    const previousItems = itemsRef.current
    const previousCount = unreadCount

    setItems([])
    setUnreadCount(0)
    setHasMore(false)

    try {
      await markAllNotificationsAsRead()
    } catch (error) {
      console.error("Failed to mark all notifications as read", error)
      setItems(previousItems)
      setUnreadCount(previousCount)
      startTransition(() => {
        void refreshInitial()
      })
    }
  }, [refreshInitial, unreadCount])

  const value = useMemo<NotificationsContextValue>(
    () => ({
      unreadCount,
      items,
      isLoadingInitial,
      isLoadingMore,
      hasMore,
      loadMore,
      markAsRead,
      markAllAsRead,
    }),
    [
      unreadCount,
      items,
      isLoadingInitial,
      isLoadingMore,
      hasMore,
      loadMore,
      markAsRead,
      markAllAsRead,
    ]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const value = useContext(NotificationsContext)
  if (!value) throw new Error(notificationsCopy.providerError)
  return value
}
