"use client"

import { useState } from "react"

import { usePwa } from "@/components/pwa/PwaProvider"
import { Button } from "@/components/primitives/button"

import { pwaStatusBannerCopy } from "./constants"

export function PwaStatusBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { install, installAvailability, update, updateAvailable } = usePwa()

  if (dismissed || (installAvailability !== "prompt" && !updateAvailable)) return null

  const isUpdate = updateAvailable

  return (
    <aside className="fixed inset-x-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-sm items-center gap-3 rounded-xl border bg-card p-3 shadow-lg md:bottom-5">
      <p className="min-w-0 flex-1 text-sm">
        {isUpdate ? pwaStatusBannerCopy.updateMessage : pwaStatusBannerCopy.installMessage}
      </p>
      <Button size="sm" onClick={() => isUpdate ? update() : void install()}>
        {isUpdate ? pwaStatusBannerCopy.updateAction : pwaStatusBannerCopy.installAction}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
        {pwaStatusBannerCopy.dismiss}
      </Button>
    </aside>
  )
}
