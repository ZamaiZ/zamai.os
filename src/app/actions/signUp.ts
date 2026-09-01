"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import type { AuthActionState } from "./authState"
import { getClientIp } from "@/lib/auth/clientIp"
import { checkRateLimit } from "@/lib/rateLimit"
import { signUpSchema } from "@/lib/validations/auth"
import { AuthService } from "@/server/modules/auth/auth.service"
import { RATE_LIMIT_MESSAGE } from "@/server/modules/auth/auth.types"

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const headerStore = await headers()
  const ip = getClientIp(headerStore)

  if (!(await checkRateLimit("signup-ip", ip))) {
    return { status: "error", message: RATE_LIMIT_MESSAGE }
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const result = await AuthService.signUp(parsed.data, { ip })

  if (result.status === "success") {
    redirect("/")
  }

  return result
}
