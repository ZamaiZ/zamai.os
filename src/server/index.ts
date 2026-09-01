import "server-only"

import { Router } from "@/server/http/router"
import { registerAuthRoutes } from "@/server/modules/auth"
import { registerExerciseRoutes } from "@/server/modules/exercises"
import { registerHealthRoutes } from "@/server/modules/health"
import { registerNotificationRoutes } from "@/server/modules/notifications"
import { registerProspectRoutes } from "@/server/modules/prospects"
import { registerPushRoutes } from "@/server/modules/push"
import { registerWorkoutRoutes } from "@/server/modules/workouts"

function createApiRouter(): Router {
  const router = new Router()
  registerHealthRoutes(router)
  registerAuthRoutes(router)
  registerPushRoutes(router)
  registerNotificationRoutes(router)
  registerExerciseRoutes(router)
  registerProspectRoutes(router)
  registerWorkoutRoutes(router)
  return router
}

export const apiRouter = createApiRouter()
