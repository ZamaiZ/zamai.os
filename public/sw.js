self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request))
})

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      const hasVisibleClient = clientList.some(
        (client) => client.visibilityState === "visible" || client.focused
      )
      if (hasVisibleClient) return

      let payload = {}

      try {
        payload = event.data ? event.data.json() : {}
      } catch {
        payload = { body: event.data ? event.data.text() : "" }
      }

      const data = payload && typeof payload === "object" ? payload : {}
      const options = {
        badge: "/apple-icon",
        body: typeof data.body === "string" ? data.body : "",
        data: { url: typeof data.url === "string" ? data.url : "/" },
        icon: "/icon",
        tag: typeof data.tag === "string" ? data.tag : undefined,
      }

      await self.registration.showNotification(
        typeof data.title === "string" ? data.title : "Zamai.OS",
        options
      )
    })()
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting()
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    (async () => {
      const requestedUrl = new URL(event.notification.data?.url || "/", self.location.origin)
      const targetUrl =
        requestedUrl.origin === self.location.origin
          ? requestedUrl
          : new URL("/", self.location.origin)
      const clientList = await clients.matchAll({ type: "window", includeUncontrolled: true })
      const matchingClient = clientList.find((client) => client.url === targetUrl.href)

      if (matchingClient && "focus" in matchingClient) return matchingClient.focus()
      return clients.openWindow(targetUrl.href)
    })()
  )
})
