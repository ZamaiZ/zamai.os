export type SerializedPushSubscription = {
  endpoint: string
  expirationTime?: number | null
  keys: {
    auth: string
    p256dh: string
  }
}

export type PushOperationResult =
  | { ok: true }
  | { ok: false; code: "configuration" | "persistence" | "provider" }

type PushMessage = {
  body: string
  tag?: string
  title: string
  url?: string
}

export type { PushMessage }
