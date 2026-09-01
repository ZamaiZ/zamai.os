import "server-only"

import { isSignUpAvailable } from "@/lib/auth/signUpAvailability"
import { createClient } from "@/lib/supabase/server"
import type { LoginInput, SignUpInput } from "@/lib/validations/auth"

import type { ActionContext, AuthActionState } from "./auth.types"

export class AuthService {
  static async login(
    input: LoginInput,
    _ctx: ActionContext
  ): Promise<AuthActionState> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword(input)

    if (error) {
      return {
        status: "error",
        message: "E-mail ou senha incorretos.",
      }
    }

    return { status: "success" }
  }

  static async signUp(
    input: SignUpInput,
    _ctx: ActionContext
  ): Promise<AuthActionState> {
    if (!(await isSignUpAvailable())) {
      return {
        status: "error",
        message: "O cadastro inicial não está mais disponível.",
      }
    }

    const { email, name, password } = input
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error || !data.user) {
      return {
        status: "error",
        message: "Não foi possível criar a conta.",
      }
    }

    if (!data.session) {
      return {
        status: "error",
        message:
          "A conta foi criada, mas exige confirmação de e-mail antes do acesso.",
      }
    }

    return { status: "success" }
  }

  static async logout(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
}
