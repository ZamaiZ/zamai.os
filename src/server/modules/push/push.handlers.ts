import { json } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"
import {
  pushStatusQuerySchema,
  type PushSubscriptionInput,
  type PushUnsubscribeInput,
} from "@/lib/validations/push"

import { PushService } from "./push.service"

export const subscribeHandler: ApiHandler = async (ctx) => {
  await PushService.saveSubscription(
    ctx.user!.id,
    ctx.body as PushSubscriptionInput
  )
  return json({ status: "success" }, { status: 201 })
}

export const unsubscribeHandler: ApiHandler = async (ctx) => {
  await PushService.removeSubscription(
    ctx.user!.id,
    (ctx.body as PushUnsubscribeInput).endpoint
  )
  return json({ status: "success" })
}

export const statusHandler: ApiHandler = async (ctx) => {
  const url = new URL(ctx.request.url)
  const parsed = pushStatusQuerySchema.safeParse({
    endpoint: url.searchParams.get("endpoint") ?? undefined,
  })

  if (!parsed.success) {
    return json({ error: "Invalid query" }, { status: 400 })
  }

  const status = await PushService.getSubscriptionStatus(
    ctx.user!.id,
    parsed.data.endpoint
  )
  return json(status)
}

export const testHandler: ApiHandler = async (ctx) => {
  const result = await PushService.sendTestNotification(ctx.user!.id)
  return json(result, { status: result.ok ? 200 : 500 })
}
