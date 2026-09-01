import { json } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"
import {
  listUnreadQuerySchema,
  markNotificationReadSchema,
  type MarkNotificationReadInput,
} from "@/lib/validations/notifications"

import { NotificationService } from "./notifications.service"

export const listUnreadHandler: ApiHandler = async (ctx) => {
  const url = new URL(ctx.request.url)
  const parsed = listUnreadQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    cursorCreatedAt: url.searchParams.get("cursorCreatedAt") ?? undefined,
    cursorId: url.searchParams.get("cursorId") ?? undefined,
  })

  if (!parsed.success) {
    return json({ error: "Invalid query" }, { status: 400 })
  }

  const { limit, cursorCreatedAt, cursorId } = parsed.data
  const cursor =
    cursorCreatedAt && cursorId
      ? { createdAt: cursorCreatedAt, id: cursorId }
      : undefined

  if ((cursorCreatedAt && !cursorId) || (!cursorCreatedAt && cursorId)) {
    return json({ error: "Invalid cursor" }, { status: 400 })
  }

  const result = await NotificationService.listUnread(ctx.user!.id, {
    limit,
    cursor,
  })
  return json(result)
}

export const countUnreadHandler: ApiHandler = async (ctx) => {
  const count = await NotificationService.countUnread(ctx.user!.id)
  return json({ count })
}

export const markAsReadHandler: ApiHandler = async (ctx) => {
  const body = ctx.body as MarkNotificationReadInput
  try {
    await NotificationService.markAsRead(ctx.user!.id, body.id)
    return json({ status: "success" })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message === "Notification not found") {
      return json({ error: "Not found" }, { status: 404 })
    }
    throw error
  }
}

export const markAllAsReadHandler: ApiHandler = async (ctx) => {
  await NotificationService.markAllAsRead(ctx.user!.id)
  return json({ status: "success" })
}

export const testHandler: ApiHandler = async (ctx) => {
  const result = await NotificationService.sendTest(ctx.user!.id)
  return json(result, { status: result.ok ? 200 : 500 })
}
