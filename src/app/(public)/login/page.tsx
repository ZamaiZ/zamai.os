import type { Metadata } from "next"

import { LoginScreen } from "@/components/auth/LogInScreen"
import { getSafeRedirectPath } from "@/lib/auth/safeRedirect"
import { isSignUpAvailable } from "@/lib/auth/signUpAvailability"

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse seu sistema pessoal Zamai.OS.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const redirectTo = getSafeRedirectPath(next)
  const signUpAvailable = await isSignUpAvailable()
  return (
    <LoginScreen
      redirectTo={redirectTo}
      signUpAvailable={signUpAvailable}
      vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
    />
  )
}
