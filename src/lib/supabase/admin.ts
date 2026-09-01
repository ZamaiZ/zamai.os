import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getSupabasePublicConfig } from "./config"
import type { Database } from "./database.types"

export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!secretKey) {
    throw new Error("Missing required environment variable: SUPABASE_SECRET_KEY")
  }

  const { url } = getSupabasePublicConfig()

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
