import { subscribeToPush } from "@/app/actions/pushNotifications"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

export async function ensurePushSubscription(vapidPublicKey: string) {
  if (
    !vapidPublicKey ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    Notification.permission !== "granted"
  ) {
    return
  }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) return

  const subscription = await registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    userVisibleOnly: true,
  })

  await subscribeToPush(JSON.parse(JSON.stringify(subscription)))
}
