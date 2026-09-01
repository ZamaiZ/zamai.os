export type AuthField = "email" | "name" | "password"

export type AuthActionState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error"
      fieldErrors?: Partial<Record<AuthField, string[]>>
      message?: string
    }

export const idleAuthState = { status: "idle" } as const

export const RATE_LIMIT_MESSAGE =
  "Muitas tentativas. Tente novamente mais tarde."

export type ActionContext = {
  ip: string
}
