import type { Router } from "@/server/http/router"

import { healthHandler } from "./health.handlers"

export function registerHealthRoutes(router: Router): void {
  router.get("/health", healthHandler)
}
