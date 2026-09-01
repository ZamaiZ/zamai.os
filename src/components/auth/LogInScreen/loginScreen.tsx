"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from "@/components/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { idleAuthState } from "@/app/actions/authState"
import { login } from "@/app/actions/login"
import { AuthScreenShell } from "@/components/auth/AuthScreenShell"
import { Button } from "@/components/primitives/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/primitives/field"
import { Input } from "@/components/primitives/input"
import { ensurePushSubscription } from "@/lib/push/clientSubscribe"

import { loginCopy } from "./constants"
import {
  loginDefaultValues,
  loginFieldIds,
  loginSchema,
  type LoginFormValues,
} from "./schema"
import type { LoginScreenProps } from "./types"

export function LoginScreen({
  redirectTo = "/",
  signUpAvailable = false,
  vapidPublicKey = "",
}: LoginScreenProps): React.JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
  })

  function onSubmit(values: LoginFormValues) {
    setServerMessage(null)
    form.clearErrors()
    const formData = new FormData()
    formData.set("email", values.email)
    formData.set("password", values.password)

    startTransition(async () => {
      const permissionPromise =
        typeof Notification !== "undefined" && Notification.permission === "default"
          ? Notification.requestPermission()
          : Promise.resolve(
              typeof Notification !== "undefined" ? Notification.permission : "denied"
            )

      const result = await login(idleAuthState, formData)
      if (result.status === "error") {
        if (result.fieldErrors?.email?.[0]) form.setError("email", { message: result.fieldErrors.email[0] })
        if (result.fieldErrors?.password?.[0]) form.setError("password", { message: result.fieldErrors.password[0] })
        setServerMessage(result.message ?? null)
        return
      }

      try {
        await permissionPromise
        await ensurePushSubscription(vapidPublicKey)
      } catch {
        // Login succeeds even if push setup fails; /notifications remains available.
      }

      router.push(redirectTo)
      router.refresh()
    })
  }

  const errors = form.formState.errors

  return (
    <AuthScreenShell title={loginCopy.title} description={loginCopy.description}>
      <form className="space-y-5" noValidate aria-label={loginCopy.formAriaLabel} onSubmit={form.handleSubmit(onSubmit)}>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor={loginFieldIds.email}>{loginCopy.emailLabel}</FieldLabel>
          <FieldContent>
            <Input id={loginFieldIds.email} type="email" autoComplete="email" placeholder={loginCopy.emailPlaceholder} className="h-11" disabled={isPending} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? loginFieldIds.emailError : undefined} {...form.register("email")} />
            <FieldError id={loginFieldIds.emailError}>{errors.email?.message}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor={loginFieldIds.password}>{loginCopy.passwordLabel}</FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input id={loginFieldIds.password} type={showPassword ? "text" : "password"} autoComplete="current-password" className="h-11 pe-12" disabled={isPending} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? loginFieldIds.passwordError : undefined} {...form.register("password")} />
              <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-0 size-11 -translate-y-1/2" disabled={isPending} aria-label={showPassword ? loginCopy.hidePassword : loginCopy.showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              </Button>
            </div>
            <FieldError id={loginFieldIds.passwordError}>{errors.password?.message}</FieldError>
          </FieldContent>
        </Field>

        {serverMessage ? <p role="alert" aria-live="polite" className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverMessage}</p> : null}

        <Button type="submit" size="lg" className="h-11 w-full" disabled={isPending}>
          {isPending ? <><LoaderCircleIcon aria-hidden className="animate-spin" />{loginCopy.submitting}</> : loginCopy.submit}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {signUpAvailable ? <>{loginCopy.signUpPrompt} <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">{loginCopy.signUpLink}</Link></> : loginCopy.privateAccess}
        </p>
      </form>
    </AuthScreenShell>
  )
}
