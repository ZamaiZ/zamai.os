export type NotificationRow = {
  id: string
  user_id: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

export type CreateNotificationInput = {
  title: string
  body: string
}

export type NotificationCursor = {
  createdAt: string
  id: string
}

export type ListUnreadResult = {
  items: NotificationRow[]
  hasMore: boolean
}

export type NotificationOperationResult =
  | { ok: true }
  | { ok: false; code: "configuration" | "persistence" | "provider" }
