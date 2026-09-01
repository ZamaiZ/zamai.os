import { z } from "zod"

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().min(1).max(2048),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    auth: z.string().min(1),
    p256dh: z.string().min(1),
  }),
})

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().min(1).max(2048),
})

export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>

export const pushStatusQuerySchema = z.object({
  endpoint: z.string().max(2048).optional(),
})
