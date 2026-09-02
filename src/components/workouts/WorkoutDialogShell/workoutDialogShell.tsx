"use client"

import * as React from "react"

import { XIcon } from "@/components/icons"
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
import { workoutsCatalogCopy } from "@/components/workouts/shared/constants"
import { cn } from "@/lib/utils"

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

function subscribeMobileChange(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  mediaQuery.addEventListener("change", onStoreChange)
  return () => mediaQuery.removeEventListener("change", onStoreChange)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function getServerMobileSnapshot() {
  return false
}

export function useWorkoutDialogMobile() {
  return React.useSyncExternalStore(
    subscribeMobileChange,
    getMobileSnapshot,
    getServerMobileSnapshot
  )
}

type WorkoutDialogShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  icon: React.ReactNode
  footer?: React.ReactNode
  size?: "default" | "wide" | "fullscreen"
  dismissible?: boolean
  hideHeader?: boolean
  children: React.ReactNode
}

const SIZE_CLASS: Record<NonNullable<WorkoutDialogShellProps["size"]>, string> = {
  default: "sm:max-w-lg",
  wide: "sm:max-w-[min(57.5rem,calc(100vw-2rem))]",
  fullscreen: "sm:max-w-[min(40rem,calc(100vw-2rem))]",
}

export function WorkoutDialogShell({
  open,
  onOpenChange,
  title,
  description,
  icon,
  footer,
  size = "default",
  dismissible = true,
  hideHeader = false,
  children,
}: WorkoutDialogShellProps) {
  const isMobile = useWorkoutDialogMobile()

  const header = (
    <div className="flex items-start gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pe-8 text-start">
        {isMobile ? (
          <>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </>
        ) : (
          <>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
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
          disabled={!dismissible}
          aria-label={workoutsCatalogCopy.closeDialog}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent
          className={cn(
            "relative",
            size === "fullscreen"
              ? "[--drawer-content-max-height:calc(100dvh-0.25rem)]"
              : "[--drawer-content-max-height:calc(100dvh-0.75rem)]"
          )}
        >
          {hideHeader ? (
            <>
              <DrawerTitle className="sr-only">{title}</DrawerTitle>
              <DrawerDescription className="sr-only">{description}</DrawerDescription>
            </>
          ) : (
            <DrawerHeader className="relative gap-0 pb-3 text-start">
              {header}
            </DrawerHeader>
          )}
          {hideHeader && isMobile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 end-3 z-10"
              onClick={() => onOpenChange(false)}
              disabled={!dismissible}
              aria-label={workoutsCatalogCopy.closeDialog}
            >
              <XIcon />
            </Button>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
          {footer ? (
            <DrawerFooter className="flex-row flex-wrap gap-2 border-t border-border/60 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {footer}
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={dismissible}
        className={cn(
          "flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0",
          SIZE_CLASS[size]
        )}
      >
        {hideHeader ? (
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        ) : (
          <DialogHeader className="shrink-0 gap-0 px-6 pt-6 pb-4">
            {header}
          </DialogHeader>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">{children}</div>
        {footer ? (
          <DialogFooter className="shrink-0 flex-row flex-wrap justify-end gap-2 border-t border-border/60 px-6 py-4">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
