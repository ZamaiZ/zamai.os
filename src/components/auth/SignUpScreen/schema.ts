export {
  signUpSchema,
  type SignUpInput as SignUpFormValues,
} from "@/lib/validations/auth"

export const signUpDefaultValues = {
  email: "",
  name: "",
  password: "",
} as const

export const signUpFieldIds = {
  name: "sign-up-name",
  email: "sign-up-email",
  password: "sign-up-password",
} as const
