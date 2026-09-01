import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .email("Digite um e-mail válido.")
  .max(254, "O e-mail deve ter no máximo 254 caracteres.")
  .transform((email) => email.toLowerCase())

const passwordSchema = z
  .string()
  .min(1, "Digite sua senha.")
  .max(128, "A senha deve ter no máximo 128 caracteres.")

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter no mínimo 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .transform((name) => name.replace(/\s+/g, " ")),
  email: emailSchema,
  password: passwordSchema.min(
    12,
    "A senha deve ter no mínimo 12 caracteres."
  ),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
