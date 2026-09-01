export {
  loginSchema,
  type LoginInput as LoginFormValues,
} from "@/lib/validations/auth"

export const loginDefaultValues = {
  email: "",
  password: "",
} as const

export const loginFieldIds = {
  email: "login-email",
  password: "login-password",
  emailError: "login-email-error",
  passwordError: "login-password-error",
} as const
