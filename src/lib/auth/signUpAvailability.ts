import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function isSignUpAvailable(): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })

    if (error) {
      console.error("[auth] Unable to determine sign-up availability")
      return false
    }

    return data.users.length === 0
  } catch {
    console.error("[auth] Unable to determine sign-up availability")
    return false
  }
}
