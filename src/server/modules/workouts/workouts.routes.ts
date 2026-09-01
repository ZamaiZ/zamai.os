import type { Router } from "@/server/http/router"
import { authenticate } from "@/server/http/middleware/authenticate"
import { validateBody } from "@/server/http/middleware/validateBody"
import { workoutMutationSchema } from "@/lib/validations/workouts"
import {
  completeWorkoutSessionSchema,
  patchWorkoutSessionSetSchema,
  skipWorkoutSessionExerciseSchema,
} from "@/lib/validations/workoutSessions"

import {
  createWorkoutHandler,
  deleteWorkoutHandler,
  getWorkoutHandler,
  listWorkoutsHandler,
  updateWorkoutHandler,
} from "./workouts.handlers"
import {
  completeWorkoutSessionHandler,
  createWorkoutSessionHandler,
  discardWorkoutSessionHandler,
  getWorkoutSessionHandler,
  patchWorkoutSessionSetHandler,
  skipWorkoutSessionExerciseHandler,
} from "./workoutSessions.handlers"

export function registerWorkoutRoutes(router: Router): void {
  router.get("/workouts", authenticate(), listWorkoutsHandler)
  router.get("/workouts/:id", authenticate(), getWorkoutHandler)
  router.post(
    "/workouts",
    authenticate(),
    validateBody(workoutMutationSchema),
    createWorkoutHandler
  )
  router.patch(
    "/workouts/:id",
    authenticate(),
    validateBody(workoutMutationSchema),
    updateWorkoutHandler
  )
  router.delete("/workouts/:id", authenticate(), deleteWorkoutHandler)
  router.post(
    "/workouts/:id/sessions",
    authenticate(),
    createWorkoutSessionHandler
  )
  router.get(
    "/workout-sessions/:id",
    authenticate(),
    getWorkoutSessionHandler
  )
  router.patch(
    "/workout-sessions/:id/sets",
    authenticate(),
    validateBody(patchWorkoutSessionSetSchema),
    patchWorkoutSessionSetHandler
  )
  router.post(
    "/workout-sessions/:id/skip-exercise",
    authenticate(),
    validateBody(skipWorkoutSessionExerciseSchema),
    skipWorkoutSessionExerciseHandler
  )
  router.post(
    "/workout-sessions/:id/complete",
    authenticate(),
    validateBody(completeWorkoutSessionSchema),
    completeWorkoutSessionHandler
  )
  router.delete(
    "/workout-sessions/:id",
    authenticate(),
    discardWorkoutSessionHandler
  )
}
