"use server"

import { headers } from "next/headers"

import type { AuthActionState } from "./authState"
import { getClientIp } from "@/lib/auth/clientIp"
import { checkRateLimit, hashRateLimitSubject } from "@/lib/rateLimit"
import { loginSchema } from "@/lib/validations/auth"
import { AuthService } from "@/server/modules/auth/auth.service"
import { RATE_LIMIT_MESSAGE } from "@/server/modules/auth/auth.types"

export async function login(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const headerStore = await headers()
  const ip = getClientIp(headerStore)

  if (!(await checkRateLimit("login-ip", ip))) {
    return { status: "error", message: RATE_LIMIT_MESSAGE }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const emailSubject = hashRateLimitSubject(parsed.data.email)
  if (!(await checkRateLimit("login-email", emailSubject))) {
    return { status: "error", message: RATE_LIMIT_MESSAGE }
  }

  return AuthService.login(parsed.data, { ip })
}
