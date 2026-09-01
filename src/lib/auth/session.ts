import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export const getAuthClaims = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) {
    return null
  }

  return data.claims
})

export const getUser = cache(async () => {
  const claims = await getAuthClaims()
  if (!claims) return null

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) return null
  return user
})

export const getCurrentProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, created_at, updated_at")
    .eq("id", user.id)
    .single()

  if (error) {
    throw new Error("Unable to load the authenticated profile", {
      cause: error,
    })
  }

  return data
})

export async function requireAuthenticatedUser() {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
}
