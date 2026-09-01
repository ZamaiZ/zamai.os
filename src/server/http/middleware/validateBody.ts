import type { ZodType } from "zod"

import { json } from "@/server/http/response"
import type { ApiMiddleware } from "@/server/http/types"

export function validateBody<T>(schema: ZodType<T>): ApiMiddleware {
  return async (ctx) => {
    const raw = ctx.body ?? (await ctx.request.json().catch(() => null))
    const parsed = schema.safeParse(raw)

    if (!parsed.success) {
      return json(
        {
          status: "error",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    ctx.body = parsed.data
  }
}
