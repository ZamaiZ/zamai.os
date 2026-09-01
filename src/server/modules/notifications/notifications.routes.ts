import type { Router } from "@/server/http/router"
import { authenticate } from "@/server/http/middleware/authenticate"
import { validateBody } from "@/server/http/middleware/validateBody"
import { markNotificationReadSchema } from "@/lib/validations/notifications"

import {
  countUnreadHandler,
  listUnreadHandler,
  markAllAsReadHandler,
  markAsReadHandler,
  testHandler,
} from "./notifications.handlers"

export function registerNotificationRoutes(router: Router): void {
  router.get("/notifications/unread", authenticate(), listUnreadHandler)
  router.get("/notifications/unread/count", authenticate(), countUnreadHandler)
  router.patch(
    "/notifications/read",
    authenticate(),
    validateBody(markNotificationReadSchema),
    markAsReadHandler
  )
  router.post("/notifications/read-all", authenticate(), markAllAsReadHandler)
  router.post("/notifications/test", authenticate(), testHandler)
}
