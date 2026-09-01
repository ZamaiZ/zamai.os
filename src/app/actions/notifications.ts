"use server"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import {
  NotificationService,
  type ListUnreadResult,
  type NotificationCursor,
  type NotificationOperationResult,
} from "@/server/modules/notifications"

export async function listUnreadNotifications(options?: {
  limit?: number
  cursor?: NotificationCursor
}): Promise<ListUnreadResult> {
  const user = await requireAuthenticatedUser()
  return NotificationService.listUnread(user.id, options)
}

export async function countUnreadNotifications(): Promise<number> {
  const user = await requireAuthenticatedUser()
  return NotificationService.countUnread(user.id)
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireAuthenticatedUser()
  await NotificationService.markAsRead(user.id, notificationId)
}

export async function markAllNotificationsAsRead() {
  const user = await requireAuthenticatedUser()
  await NotificationService.markAllAsRead(user.id)
}

export async function sendNotificationTest(): Promise<NotificationOperationResult> {
  const user = await requireAuthenticatedUser()
  return NotificationService.sendTest(user.id)
}
