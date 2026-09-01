import { getUser } from "@/lib/auth/session"
import { unauthorized } from "@/server/http/response"
import type { ApiMiddleware } from "@/server/http/types"

export function authenticate(): ApiMiddleware {
  return async (ctx) => {
    const user = await getUser()
    if (!user) {
      return unauthorized()
    }

    ctx.user = user
  }
}
