import type { Router } from "@/server/http/router"
import { authenticate } from "@/server/http/middleware/authenticate"
import { validateBody } from "@/server/http/middleware/validateBody"
import {
  pushSubscriptionSchema,
  pushUnsubscribeSchema,
} from "@/lib/validations/push"

import {
  statusHandler,
  subscribeHandler,
  testHandler,
  unsubscribeHandler,
} from "./push.handlers"

export function registerPushRoutes(router: Router): void {
  router.post(
    "/push/subscribe",
    authenticate(),
    validateBody(pushSubscriptionSchema),
    subscribeHandler
  )
  router.post(
    "/push/unsubscribe",
    authenticate(),
    validateBody(pushUnsubscribeSchema),
    unsubscribeHandler
  )
  router.get("/push/status", authenticate(), statusHandler)
  router.post("/push/test", authenticate(), testHandler)
}
