export type InstallAvailability = "ios" | "prompt" | "unavailable"

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export type PwaContextValue = {
  browserSubscription: PushSubscription | null
  installAvailability: InstallAvailability
  isInstalled: boolean
  notificationPermission: NotificationPermission | "unsupported"
  updateAvailable: boolean
  install: () => Promise<void>
  update: () => void
}

import type { ReactNode } from "react"

export type PwaProviderProps = {
  children: ReactNode
}
