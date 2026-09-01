import "server-only"

import { createHash } from "node:crypto"

import { createAdminClient } from "@/lib/supabase/admin"

type Operation =
  | "login-email"
  | "login-ip"
  | "signup-ip"
  | "prospects-search"

const LIMITS: Record<
  Operation,
  { maxRequests: number; windowSeconds: number }
> = {
  "login-email": { maxRequests: 5, windowSeconds: 900 },
  "login-ip": { maxRequests: 10, windowSeconds: 900 },
  "signup-ip": { maxRequests: 5, windowSeconds: 3600 },
  "prospects-search": { maxRequests: 10, windowSeconds: 600 },
}

export function hashRateLimitSubject(subject: string): string {
  return createHash("sha256")
    .update(subject.trim().toLowerCase())
    .digest("hex")
}

export async function checkRateLimit(
  operation: Operation,
  subject: string
): Promise<boolean> {
  try {
    const { maxRequests, windowSeconds } = LIMITS[operation]
    const admin = createAdminClient()
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: `${operation}:${subject}`,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    })

    if (error) {
      console.error(`[rate-limit] ${operation} check failed`)
      return false
    }

    return data === true
  } catch {
    console.error(`[rate-limit] ${operation} check failed`)
    return false
  }
}
