import { json } from "@/server/http/response"
import type { ApiHandler } from "@/server/http/types"
import type { LoginInput, SignUpInput } from "@/lib/validations/auth"

import { AuthService } from "./auth.service"

export const loginHandler: ApiHandler = async (ctx) => {
  const result = await AuthService.login(ctx.body as LoginInput, { ip: ctx.ip })
  return json(result, { status: result.status === "error" ? 400 : 200 })
}

export const signUpHandler: ApiHandler = async (ctx) => {
  const result = await AuthService.signUp(ctx.body as SignUpInput, { ip: ctx.ip })
  return json(result, { status: result.status === "error" ? 400 : 201 })
}

export const logoutHandler: ApiHandler = async () => {
  await AuthService.logout()
  return json({ status: "success" })
}
