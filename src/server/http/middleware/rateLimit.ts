import { checkRateLimit, hashRateLimitSubject } from "@/lib/rateLimit"
import { json } from "@/server/http/response"
import type { ApiContext, ApiMiddleware } from "@/server/http/types"
import { RATE_LIMIT_MESSAGE } from "@/server/modules/auth/auth.types"

type RateLimitOperation = "login-email" | "login-ip" | "signup-ip"

function rateLimitResponse(): Response {
  return json({ status: "error", message: RATE_LIMIT_MESSAGE }, { status: 429 })
}

export function rateLimit(
  operation: RateLimitOperation,
  resolveSubject: (ctx: ApiContext) => string
): ApiMiddleware {
  return async (ctx) => {
    const subject = resolveSubject(ctx)
    if (!(await checkRateLimit(operation, subject))) {
      return rateLimitResponse()
    }
  }
}

export function rateLimitByIp(
  operation: Extract<RateLimitOperation, "login-ip" | "signup-ip">
): ApiMiddleware {
  return rateLimit(operation, (ctx) => ctx.ip)
}

export function rateLimitLoginEmail(): ApiMiddleware {
  return rateLimit("login-email", (ctx) => {
    const body = ctx.body as { email?: string } | undefined
    return hashRateLimitSubject(body?.email ?? "")
  })
}
