"use client"

import { PwaActions } from "@/components/pwa/PwaActions"
import { usePwa } from "@/components/pwa/PwaProvider"

import { pwaInstallHelpCopy } from "./constants"

export function PwaInstallHelp() {
  const { installAvailability, isInstalled } = usePwa()

  if (isInstalled) {
    return <p className="text-sm text-muted-foreground">{pwaInstallHelpCopy.installed}</p>
  }

  if (installAvailability === "ios") {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        No Safari, toque em Compartilhar e escolha <strong className="font-medium text-foreground">{pwaInstallHelpCopy.iosAction}</strong>.
      </p>
    )
  }

  if (installAvailability !== "prompt") {
    return <p className="text-sm text-muted-foreground">{pwaInstallHelpCopy.unavailable}</p>
  }

  return <PwaActions />
}
