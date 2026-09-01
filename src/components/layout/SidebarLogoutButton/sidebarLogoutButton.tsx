"use client"

import { LogOutIcon } from "@/components/icons"
import { useFormStatus } from "react-dom"

import { SidebarMenuButton } from "@/components/primitives/sidebar"
import { Spinner } from "@/components/primitives/spinner"

import { sidebarLogoutButtonCopy } from "./constants"

export function SidebarLogoutButton() {
  const { pending } = useFormStatus()

  return (
    <SidebarMenuButton
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      aria-label={sidebarLogoutButtonCopy.label}
      tooltip={sidebarLogoutButtonCopy.tooltip}
      className="h-10 gap-3 rounded-lg border border-transparent px-3 text-destructive/85 transition-[color,background-color,border-color,transform] duration-150 ease-out hover:border-destructive/25 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] active:bg-destructive/15 active:text-destructive group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:border-destructive/25 group-data-[collapsible=icon]:bg-destructive/10 motion-reduce:transition-none"
    >
      {pending ? <Spinner aria-hidden /> : <LogOutIcon aria-hidden />}
      <span className="group-data-[collapsible=icon]:hidden">
        {pending ? sidebarLogoutButtonCopy.pending : sidebarLogoutButtonCopy.label}
      </span>
    </SidebarMenuButton>
  )
}
