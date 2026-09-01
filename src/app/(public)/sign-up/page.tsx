import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { SignUpScreen } from "@/components/auth/SignUpScreen"
import { isSignUpAvailable } from "@/lib/auth/signUpAvailability"

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Configure o acesso único ao seu sistema pessoal.",
}

export default async function SignUpPage() {
  if (!(await isSignUpAvailable())) redirect("/login")
  return <SignUpScreen />
}
