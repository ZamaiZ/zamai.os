import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { PushService } from "@/server/modules/push"

import type {
  CreateNotificationInput,
  ListUnreadResult,
  NotificationCursor,
  NotificationOperationResult,
  NotificationRow,
} from "./notifications.types"

const DEFAULT_PAGE_SIZE = 10

export class NotificationService {
  static async deliver(
    userId: string,
    input: CreateNotificationInput
  ): Promise<NotificationRow> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title: input.title,
        body: input.body,
      })
      .select("id, user_id, title, body, read_at, created_at")
      .single()

    if (error || !data) {
      throw new Error("Unable to create notification", { cause: error })
    }

    try {
      await PushService.sendToUser(userId, {
        title: input.title,
        body: input.body,
        tag: data.id,
        url: "/notifications",
      })
    } catch (pushError) {
      console.error("Push delivery failed after notification insert", pushError)
    }

    return data
  }

  static async listUnread(
    userId: string,
    options?: {
      limit?: number
      cursor?: NotificationCursor
    }
  ): Promise<ListUnreadResult> {
    const limit = options?.limit ?? DEFAULT_PAGE_SIZE
    const supabase = createAdminClient()

    let query = supabase
      .from("notifications")
      .select("id, user_id, title, body, read_at, created_at")
      .eq("user_id", userId)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1)

    if (options?.cursor) {
      const { createdAt, id } = options.cursor
      query = query.or(
        `created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt.${id})`
      )
    }

    const { data, error } = await query

    if (error) {
      throw new Error("Unable to list unread notifications", { cause: error })
    }

    const rows = data ?? []
    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows

    return { items, hasMore }
  }

  static async countUnread(userId: string): Promise<number> {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null)

    if (error) {
      throw new Error("Unable to count unread notifications", { cause: error })
    }

    return count ?? 0
  }

  static async markAsRead(userId: string, notificationId: string): Promise<void> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .is("read_at", null)
      .select("id")
      .maybeSingle()

    if (error) {
      throw new Error("Unable to mark notification as read", { cause: error })
    }

    if (!data) {
      throw new Error("Notification not found")
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null)

    if (error) {
      throw new Error("Unable to mark all notifications as read", {
        cause: error,
      })
    }
  }

  static async sendTest(userId: string): Promise<NotificationOperationResult> {
    try {
      await NotificationService.deliver(userId, {
        title: "Notificação de teste",
        body: "Esta é uma notificação de teste do Zamai.OS.",
      })
      return { ok: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      const code = message.includes("VAPID")
        ? "configuration"
        : message.includes("Unable to")
          ? "persistence"
          : "provider"
      console.error("Notification test failed", { code })
      return { ok: false, code }
    }
  }
}
