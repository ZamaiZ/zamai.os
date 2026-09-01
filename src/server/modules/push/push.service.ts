import "server-only"

import webpush from "web-push"

import { createAdminClient } from "@/lib/supabase/admin"

import type {
  PushMessage,
  PushOperationResult,
  SerializedPushSubscription,
} from "./push.types"

export type {
  PushOperationResult,
  SerializedPushSubscription,
} from "./push.types"

export class PushService {
  static async getSubscriptionStatus(userId: string, endpoint?: string) {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint", { count: "exact", head: true })
      .eq("user_id", userId)

    if (error) {
      throw new Error("Unable to load push subscription status", { cause: error })
    }

    if (!endpoint) {
      return { deviceCount: count ?? 0, isCurrentDeviceStored: false }
    }

    const { data, error: endpointError } = await supabase
      .from("push_subscriptions")
      .select("endpoint")
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .maybeSingle()

    if (endpointError) {
      throw new Error("Unable to load current push subscription", {
        cause: endpointError,
      })
    }

    return {
      deviceCount: count ?? 0,
      isCurrentDeviceStored: Boolean(data),
    }
  }

  static validateSubscription(subscription: SerializedPushSubscription) {
    if (
      !subscription ||
      typeof subscription.endpoint !== "string" ||
      subscription.endpoint.length === 0 ||
      subscription.endpoint.length > 2048 ||
      !subscription.keys ||
      typeof subscription.keys.auth !== "string" ||
      typeof subscription.keys.p256dh !== "string" ||
      subscription.keys.auth.length === 0 ||
      subscription.keys.p256dh.length === 0
    ) {
      throw new Error("Invalid push subscription")
    }
  }

  static async saveSubscription(
    userId: string,
    subscription: SerializedPushSubscription
  ) {
    PushService.validateSubscription(subscription)

    const supabase = createAdminClient()
    const { error } = await supabase.from("push_subscriptions").upsert({
      endpoint: subscription.endpoint,
      user_id: userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      expiration_time:
        typeof subscription.expirationTime === "number" &&
        Number.isFinite(subscription.expirationTime)
          ? new Date(subscription.expirationTime).toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error("Unable to save push subscription", { cause: error })
    }
  }

  static async removeSubscription(userId: string, endpoint: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("endpoint", endpoint)

    if (error) {
      throw new Error("Unable to remove push subscription", { cause: error })
    }
  }

  static async sendToUser(userId: string, message: PushMessage) {
    PushService.configureWebPush()

    const supabase = createAdminClient()
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId)

    if (error) {
      throw new Error("Unable to load push subscriptions", { cause: error })
    }

    const expiredEndpoints: string[] = []
    const payload = JSON.stringify(message)

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                auth: subscription.auth,
                p256dh: subscription.p256dh,
              },
            },
            payload
          )
        } catch (error) {
          const statusCode =
            typeof error === "object" && error !== null && "statusCode" in error
              ? error.statusCode
              : undefined

          if (statusCode === 404 || statusCode === 410) {
            expiredEndpoints.push(subscription.endpoint)
            return
          }

          throw error
        }
      })
    )

    if (expiredEndpoints.length > 0) {
      const { error: deleteError } = await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints)
        .eq("user_id", userId)

      if (deleteError) {
        throw new Error("Unable to remove expired push subscriptions", {
          cause: deleteError,
        })
      }
    }
  }

  static async sendTestNotification(userId: string): Promise<PushOperationResult> {
    try {
      await PushService.sendToUser(userId, {
        title: "Notificações ativas",
        body: "Esta é uma notificação de teste do Zamai.OS.",
        tag: "zamai-os-push-test",
        url: "/notifications",
      })
      return { ok: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      const code = message.includes("VAPID")
        ? "configuration"
        : message.includes("Unable to")
          ? "persistence"
          : "provider"
      console.error("Push test failed", { code })
      return { ok: false, code }
    }
  }

  private static configureWebPush() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const subject = process.env.VAPID_SUBJECT

    if (!publicKey || !privateKey || !subject) {
      throw new Error("Missing required VAPID configuration")
    }

    webpush.setVapidDetails(subject, publicKey, privateKey)
  }
}

// Backward-compatible function exports for lib shim
export const getPushSubscriptionStatus = PushService.getSubscriptionStatus.bind(
  PushService
)
export const validateSerializedSubscription =
  PushService.validateSubscription.bind(PushService)
export const savePushSubscription = PushService.saveSubscription.bind(PushService)
export const removePushSubscription = PushService.removeSubscription.bind(
  PushService
)
export const sendPushToUser = PushService.sendToUser.bind(PushService)
