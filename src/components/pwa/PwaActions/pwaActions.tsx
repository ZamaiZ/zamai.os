"use client"

import { DownloadIcon, RefreshCwIcon } from "@/components/icons"

import { usePwa } from "@/components/pwa/PwaProvider"
import { Button } from "@/components/primitives/button"

import { pwaActionsCopy } from "./constants"
import type { PwaActionsProps } from "./types"

export function PwaActions({ compact = false }: PwaActionsProps) {
  const { install, installAvailability, isInstalled, update, updateAvailable } = usePwa()

  if (updateAvailable) {
    return <Button onClick={update} size={compact ? "sm" : "default"}><RefreshCwIcon aria-hidden />{pwaActionsCopy.update}</Button>
  }

  if (isInstalled || installAvailability !== "prompt") return null

  return <Button onClick={() => void install()} size={compact ? "sm" : "default"}><DownloadIcon aria-hidden />{pwaActionsCopy.install}</Button>
}
