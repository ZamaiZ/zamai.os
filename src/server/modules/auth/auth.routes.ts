import type { Router } from "@/server/http/router"
import { authenticate } from "@/server/http/middleware/authenticate"
import {
  rateLimitByIp,
  rateLimitLoginEmail,
} from "@/server/http/middleware/rateLimit"
import { validateBody } from "@/server/http/middleware/validateBody"
import { loginSchema, signUpSchema } from "@/lib/validations/auth"

import { loginHandler, logoutHandler, signUpHandler } from "./auth.handlers"

export function registerAuthRoutes(router: Router): void {
  router.post(
    "/auth/login",
    rateLimitByIp("login-ip"),
    validateBody(loginSchema),
    rateLimitLoginEmail(),
    loginHandler
  )
  router.post(
    "/auth/sign-up",
    rateLimitByIp("signup-ip"),
    validateBody(signUpSchema),
    signUpHandler
  )
  router.post("/auth/logout", authenticate(), logoutHandler)
}
