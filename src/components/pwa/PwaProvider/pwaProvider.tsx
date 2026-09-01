"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

import { pwaProviderError, pwaServiceWorkerConfig } from "./constants"
import type {
  BeforeInstallPromptEvent,
  PwaContextValue,
  PwaProviderProps,
} from "./types"

const PwaContext = createContext<PwaContextValue | null>(null)

export function PwaProvider({ children }: PwaProviderProps) {
  const [browserSubscription, setBrowserSubscription] = useState<PushSubscription | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported")
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const waitingWorker = useRef<ServiceWorker | null>(null)
  const shouldReload = useRef(false)

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsInstalled(standalone)
    setNotificationPermission("Notification" in window ? Notification.permission : "unsupported")

    function onInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function onInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    function onControllerChange() {
      if (shouldReload.current) window.location.reload()
    }

    window.addEventListener("beforeinstallprompt", onInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
      void navigator.serviceWorker
        .register(pwaServiceWorkerConfig.path, {
          scope: pwaServiceWorkerConfig.scope,
          updateViaCache: pwaServiceWorkerConfig.updateViaCache,
        })
        .then(async (registration) => {
          waitingWorker.current = registration.waiting
          setUpdateAvailable(Boolean(registration.waiting))
          const subscription = await registration.pushManager.getSubscription()
          setBrowserSubscription(subscription)
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                waitingWorker.current = registration.waiting
                setUpdateAvailable(Boolean(registration.waiting))
              }
            })
          })
        })
        .catch(() => undefined)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  const value = useMemo<PwaContextValue>(() => ({
    browserSubscription,
    installAvailability: isInstalled ? "unavailable" : deferredPrompt ? "prompt" : /iPad|iPhone|iPod/.test(typeof navigator === "undefined" ? "" : navigator.userAgent) ? "ios" : "unavailable",
    isInstalled,
    notificationPermission,
    updateAvailable,
    async install() {
      if (!deferredPrompt) return
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    },
    update() {
      if (!waitingWorker.current) return
      shouldReload.current = true
      waitingWorker.current.postMessage({ type: "SKIP_WAITING" })
    },
  }), [browserSubscription, deferredPrompt, isInstalled, notificationPermission, updateAvailable])

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export function usePwa() {
  const value = useContext(PwaContext)
  if (!value) throw new Error(pwaProviderError)
  return value
}
