export type PushState =
  | "checking"
  | "denied"
  | "subscribed"
  | "unsupported"
  | "unsubscribed"

export type PushNotificationSettingsProps = {
  vapidPublicKey: string
}
