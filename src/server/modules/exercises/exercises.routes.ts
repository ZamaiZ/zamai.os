import type { Router } from "@/server/http/router"
import { authenticate } from "@/server/http/middleware/authenticate"

import {
  createExerciseHandler,
  getExerciseHandler,
  listExercisesHandler,
  listMuscleGroupsHandler,
  updateExerciseHandler,
} from "./exercises.handlers"

export function registerExerciseRoutes(router: Router): void {
  router.get(
    "/exercises/muscle-groups",
    authenticate(),
    listMuscleGroupsHandler
  )
  router.get("/exercises", authenticate(), listExercisesHandler)
  router.get("/exercises/:id", authenticate(), getExerciseHandler)
  router.post("/exercises", authenticate(), createExerciseHandler)
  router.patch("/exercises/:id", authenticate(), updateExerciseHandler)
}
