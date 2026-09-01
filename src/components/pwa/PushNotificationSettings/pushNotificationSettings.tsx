"use client"

import { useEffect, useState } from "react"

import { sendNotificationTest } from "@/app/actions/notifications"
import {
  getPushNotificationStatus,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/app/actions/pushNotifications"
import { usePwa } from "@/components/pwa/PwaProvider"
import { Button } from "@/components/primitives/button"

import { pushNotificationSettingsCopy } from "./constants"
import type { PushNotificationSettingsProps, PushState } from "./types"
import { urlBase64ToUint8Array } from "./utils"

export function PushNotificationSettings({ vapidPublicKey }: PushNotificationSettingsProps) {
  const { browserSubscription } = usePwa()
  const [pushState, setPushState] = useState<PushState>("checking")
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [deviceCount, setDeviceCount] = useState<number | null>(null)
  const [isStored, setIsStored] = useState(false)

  useEffect(() => {
    async function loadSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushState("unsupported")
        return
      }

      if (Notification.permission === "denied") {
        setPushState("denied")
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        const currentSubscription = await registration.pushManager.getSubscription()
        setSubscription(currentSubscription)
        setPushState(currentSubscription ? "subscribed" : "unsubscribed")
        const status = await getPushNotificationStatus(currentSubscription?.endpoint)
        setDeviceCount(status.deviceCount)
        setIsStored(status.isCurrentDeviceStored)
      } catch {
        setPushState("unsupported")
      }
    }

    void loadSubscription()
  }, [browserSubscription])

  async function enableNotifications() {
    setIsPending(true)
    setMessage(null)

    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setPushState("denied")
        setMessage(pushNotificationSettingsCopy.permissionDenied)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const newSubscription = await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        userVisibleOnly: true,
      })

      await subscribeToPush(JSON.parse(JSON.stringify(newSubscription)))
      setSubscription(newSubscription)
      setPushState("subscribed")
      setDeviceCount((count) => (count ?? 0) + 1)
      setIsStored(true)
      setMessage(pushNotificationSettingsCopy.enableSuccess)
    } catch {
      setMessage(pushNotificationSettingsCopy.enableError)
    } finally {
      setIsPending(false)
    }
  }

  async function disableNotifications() {
    if (!subscription) return

    setIsPending(true)
    setMessage(null)

    try {
      await unsubscribeFromPush(subscription.endpoint)
      await subscription.unsubscribe()
      setSubscription(null)
      setPushState("unsubscribed")
      setIsStored(false)
      setMessage(pushNotificationSettingsCopy.disableSuccess)
    } catch {
      setMessage(pushNotificationSettingsCopy.disableError)
    } finally {
      setIsPending(false)
    }
  }

  async function sendTest() {
    setIsPending(true)
    setMessage(null)

    try {
      const result = await sendNotificationTest()
      setMessage(result.ok
        ? pushNotificationSettingsCopy.testSuccess
        : result.code === "configuration"
          ? pushNotificationSettingsCopy.testConfigError
          : result.code === "persistence"
            ? pushNotificationSettingsCopy.testPersistenceError
            : pushNotificationSettingsCopy.testRejectedError)
    } catch {
      setMessage(pushNotificationSettingsCopy.testGenericError)
    } finally {
      setIsPending(false)
    }
  }

  if (pushState === "checking") {
    return <p className="text-sm text-muted-foreground">{pushNotificationSettingsCopy.checking}</p>
  }

  if (pushState === "unsupported") {
    return <p className="text-sm text-muted-foreground">{pushNotificationSettingsCopy.unsupported}</p>
  }

  const deviceLabel = deviceCount === 1
    ? pushNotificationSettingsCopy.deviceSingular
    : pushNotificationSettingsCopy.devicePlural

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        {pushState === "subscribed"
          ? pushNotificationSettingsCopy.subscribed
          : pushNotificationSettingsCopy.unsubscribed}
      </p>
      {deviceCount !== null ? (
        <p className="text-sm text-muted-foreground" role="status">
          {deviceCount} {deviceLabel}. {pushState === "subscribed" && !isStored ? pushNotificationSettingsCopy.unconfirmedDevice : null}
        </p>
      ) : null}
      {message ? <p className="text-sm text-muted-foreground" role="status">{message}</p> : null}
      {pushState === "subscribed" ? (
        <div className="flex flex-wrap gap-2">
          <Button disabled={isPending} onClick={sendTest}>{pushNotificationSettingsCopy.testAction}</Button>
          <Button disabled={isPending} onClick={disableNotifications} variant="outline">{pushNotificationSettingsCopy.disableAction}</Button>
        </div>
      ) : (
        <Button disabled={isPending || pushState === "denied"} onClick={enableNotifications}>
          {pushNotificationSettingsCopy.enableAction}
        </Button>
      )}
    </div>
  )
}
