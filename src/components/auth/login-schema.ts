import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
})

export type LoginValues = z.infer<typeof loginSchema>
