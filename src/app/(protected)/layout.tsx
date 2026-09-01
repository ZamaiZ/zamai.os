import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { AppShell } from "@/components/layout/AppShell"
import { getCurrentProfile, getUser } from "@/lib/auth/session"

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getUser()
  if (!user) notFound()
  const profile = await getCurrentProfile()
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"
  const userName = profile?.name || user.email || "Conta"

  return (
    <AppShell defaultOpen={defaultOpen} userId={user.id} userName={userName}>
      {children}
    </AppShell>
  )
}
