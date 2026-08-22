import type { Metadata } from "next"

import { LoginScreen } from "@/components/auth/login-screen"

export const metadata: Metadata = {
  title: "Entrar | Life",
  description: "Acesse seu sistema pessoal Life.",
}

export default function LoginPage() {
  return <LoginScreen />
}
