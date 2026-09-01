import { z } from "zod"

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

export const markNotificationReadSchema = z.object({
  id: z.string().uuid(),
})

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>

export const listUnreadQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  cursorCreatedAt: z.string().min(1).optional(),
  cursorId: z.string().uuid().optional(),
})
