"use server"

import { redirect } from "next/navigation"

import { requireAuthenticatedUser } from "@/lib/auth/session"
import { AuthService } from "@/server/modules/auth/auth.service"

export async function logout() {
  await requireAuthenticatedUser()
  await AuthService.logout()
  redirect("/login")
}
