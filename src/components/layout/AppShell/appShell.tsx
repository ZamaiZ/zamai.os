import { SidebarInset, SidebarProvider } from "@/components/primitives/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { MobileNavigation } from "@/components/layout/MobileNavigation"
import { ProtectedHeader } from "@/components/layout/ProtectedHeader"
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider"
import { PwaStatusBanner } from "@/components/pwa/PwaStatusBanner"

import { sidebarCssVars, skipLinkLabel } from "./constants"
import type { AppShellProps } from "./types"

export function AppShell({
  children,
  defaultOpen,
  userId,
  userName,
}: AppShellProps) {
  return (
    <NotificationsProvider userId={userId}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={sidebarCssVars}
      >
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0 motion-reduce:transition-none"
        >
          {skipLinkLabel}
        </a>
        <AppSidebar userName={userName} />
        <SidebarInset
          id="main-content"
          tabIndex={-1}
          className="h-svh min-w-0 overflow-hidden bg-background"
        >
          <ProtectedHeader />
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </div>
        </SidebarInset>
        <MobileNavigation userName={userName} />
        <PwaStatusBanner />
      </SidebarProvider>
    </NotificationsProvider>
  )
}
