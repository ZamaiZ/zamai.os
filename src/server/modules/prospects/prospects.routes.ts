import type { Router } from "@/server/http/router"
import { authenticate } from "@/server/http/middleware/authenticate"
import { validateBody } from "@/server/http/middleware/validateBody"
import {
  saveProspectsSchema,
  searchProspectsSchema,
  updateProspectStatusSchema,
} from "@/lib/validations/prospects"

import {
  listProspectsHandler,
  saveProspectsHandler,
  searchProspectsHandler,
  updateProspectStatusHandler,
} from "./prospects.handlers"

export function registerProspectRoutes(router: Router): void {
  router.get("/prospects", authenticate(), listProspectsHandler)
  router.post(
    "/prospects/search",
    authenticate(),
    validateBody(searchProspectsSchema),
    searchProspectsHandler
  )
  router.post(
    "/prospects",
    authenticate(),
    validateBody(saveProspectsSchema),
    saveProspectsHandler
  )
  router.patch(
    "/prospects/:id",
    authenticate(),
    validateBody(updateProspectStatusSchema),
    updateProspectStatusHandler
  )
}
