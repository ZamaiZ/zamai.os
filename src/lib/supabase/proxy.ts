import { createServerClient } from "@supabase/ssr"
import type { NextRequest, NextResponse } from "next/server"

import { getSupabasePublicConfig } from "./config"
import type { Database } from "./database.types"

export function createProxyClient(
  request: NextRequest,
  response: NextResponse
) {
  const { publishableKey, url } = getSupabasePublicConfig()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}
