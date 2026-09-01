"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from "@/components/icons"
import Link from "next/link"
import { useForm } from "react-hook-form"

import { idleAuthState } from "@/app/actions/authState"
import { signUp } from "@/app/actions/signUp"
import { AuthScreenShell } from "@/components/auth/AuthScreenShell"
import { Button } from "@/components/primitives/button"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/primitives/field"
import { Input } from "@/components/primitives/input"

import { signUpCopy } from "./constants"
import {
  signUpDefaultValues,
  signUpFieldIds,
  signUpSchema,
  type SignUpFormValues,
} from "./schema"

export function SignUpScreen(): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
  })

  function onSubmit(values: SignUpFormValues) {
    setServerMessage(null)
    form.clearErrors()
    const formData = new FormData()
    formData.set("email", values.email)
    formData.set("name", values.name)
    formData.set("password", values.password)

    startTransition(async () => {
      const result = await signUp(idleAuthState, formData)
      if (result.status === "error") {
        for (const field of ["name", "email", "password"] as const) {
          const message = result.fieldErrors?.[field]?.[0]
          if (message) form.setError(field, { message })
        }
        setServerMessage(result.message ?? null)
      }
    })
  }

  const errors = form.formState.errors

  return (
    <AuthScreenShell title={signUpCopy.title} description={signUpCopy.description}>
      <form className="space-y-5" noValidate aria-label={signUpCopy.formAriaLabel} onSubmit={form.handleSubmit(onSubmit)}>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor={signUpFieldIds.name}>{signUpCopy.nameLabel}</FieldLabel>
          <FieldContent>
            <Input id={signUpFieldIds.name} autoComplete="name" className="h-11" disabled={isPending} aria-invalid={Boolean(errors.name)} {...form.register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </FieldContent>
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor={signUpFieldIds.email}>{signUpCopy.emailLabel}</FieldLabel>
          <FieldContent>
            <Input id={signUpFieldIds.email} type="email" autoComplete="email" className="h-11" disabled={isPending} aria-invalid={Boolean(errors.email)} {...form.register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </FieldContent>
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor={signUpFieldIds.password}>{signUpCopy.passwordLabel}</FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input id={signUpFieldIds.password} type={showPassword ? "text" : "password"} autoComplete="new-password" className="h-11 pe-12" disabled={isPending} aria-invalid={Boolean(errors.password)} {...form.register("password")} />
              <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-0 size-11 -translate-y-1/2" disabled={isPending} aria-label={showPassword ? signUpCopy.hidePassword : signUpCopy.showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
              </Button>
            </div>
            <FieldError>{errors.password?.message}</FieldError>
          </FieldContent>
        </Field>

        {serverMessage ? <p role="alert" aria-live="polite" className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverMessage}</p> : null}

        <Button type="submit" size="lg" className="h-11 w-full" disabled={isPending}>
          {isPending ? <><LoaderCircleIcon aria-hidden className="animate-spin" />{signUpCopy.submitting}</> : signUpCopy.submit}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {signUpCopy.loginPrompt} <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">{signUpCopy.loginLink}</Link>
        </p>
      </form>
    </AuthScreenShell>
  )
}
