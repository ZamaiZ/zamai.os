"use server"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import {
  PushService,
  type PushOperationResult,
  type SerializedPushSubscription,
} from "@/server/modules/push"

export async function subscribeToPush(subscription: SerializedPushSubscription) {
  const user = await requireAuthenticatedUser()
  await PushService.saveSubscription(user.id, subscription)
}

export async function unsubscribeFromPush(endpoint: string) {
  const user = await requireAuthenticatedUser()
  await PushService.removeSubscription(user.id, endpoint)
}

export async function sendPushTestNotification() {
  const user = await requireAuthenticatedUser()
  return PushService.sendTestNotification(user.id) satisfies Promise<PushOperationResult>
}

export async function getPushNotificationStatus(endpoint?: string) {
  const user = await requireAuthenticatedUser()
  return PushService.getSubscriptionStatus(user.id, endpoint)
}
