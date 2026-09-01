import { z } from "zod"

export const pushNotificationSettingsPropsSchema = z.object({
  vapidPublicKey: z.string().min(1),
})
