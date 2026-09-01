"use client"

import * as React from "react"

import { exercisesCatalogCopy } from "@/components/exercises/shared/constants"
import { LightningIcon, XIcon } from "@/components/icons"
import { Button } from "@/components/primitives/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/primitives/drawer"
import { cn } from "@/lib/utils"

import { ModeSwitch } from "./modeSwitch"
import type { CreationMode } from "./drafts"

type CreationShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isMobile: boolean
  mode: CreationMode
  onModeChange: (mode: CreationMode) => void
  canSwitchToSingle: boolean
  pending: boolean
  children: React.ReactNode
  footer: React.ReactNode
}

export function CreationShell({
  open,
  onOpenChange,
  isMobile,
  mode,
  onModeChange,
  canSwitchToSingle,
  pending,
  children,
  footer,
}: CreationShellProps) {
  const header = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <LightningIcon className="size-5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1 pe-8 text-start">
          {isMobile ? (
            <>
              <DrawerTitle>{exercisesCatalogCopy.addExercisesTitle}</DrawerTitle>
              <DrawerDescription>
                {exercisesCatalogCopy.addExercisesDescriptionMobile}
              </DrawerDescription>
            </>
          ) : (
            <>
              <DialogTitle>{exercisesCatalogCopy.addExercisesTitle}</DialogTitle>
              <DialogDescription>
                {exercisesCatalogCopy.addExercisesDescription}
              </DialogDescription>
            </>
          )}
        </div>
        {isMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 end-4"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            aria-label="Fechar"
          >
            <XIcon />
          </Button>
        ) : null}
      </div>
      <ModeSwitch
        value={mode}
        onChange={onModeChange}
        disabled={pending}
        canSwitchToSingle={canSwitchToSingle}
      />
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent className="[--drawer-content-max-height:calc(100dvh-0.75rem)]">
          <DrawerHeader className="relative gap-0 pb-3 text-start">
            {header}
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {children}
          </div>
          <DrawerFooter className="flex-row gap-2 border-t border-border/60 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(57.5rem,calc(100vw-2rem))]"
        )}
      >
        <DialogHeader className="shrink-0 gap-0 px-6 pt-6 pb-4">
          {header}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">{children}</div>
        <DialogFooter className="shrink-0 flex-row justify-between border-t border-border/60 px-6 py-4">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
