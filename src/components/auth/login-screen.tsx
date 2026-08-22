"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useForm } from "react-hook-form"

import { LifeSceneLoader } from "@/components/three/life-scene-loader"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginValues } from "./login-schema"

const reveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const emailErrorId = "login-email-error"
const passwordErrorId = "login-password-error"
const onValidSubmitNoop = () => undefined

type LoginScreenProps = {
  onValidSubmit?: () => void
}

export function LoginScreen({
  onValidSubmit = onValidSubmitNoop,
}: LoginScreenProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false)
  const reduceMotion = useReducedMotion()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <main className="min-h-svh bg-background [--life-flow:oklch(0.704_0.14_182.503)] [--life-insight:oklch(0.905_0.182_98.111)] [--life-mist:oklch(0.84_0.018_205)] [--life-space:oklch(0.145_0.012_220)] lg:grid lg:grid-cols-[42%_58%]">
      <section className="relative z-10 order-2 flex min-h-[calc(100svh-16rem)] items-center bg-background px-5 py-12 sm:px-10 lg:order-1 lg:min-h-svh lg:px-12 xl:px-20">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          transition={{ staggerChildren: reduceMotion ? 0 : 0.07 }}
          className="mx-auto w-full max-w-md"
        >
          <motion.div
            variants={reveal}
            className="mb-10 flex items-center gap-3"
          >
            <span className="grid size-10 place-items-center rounded-full border border-primary/25 bg-primary/10 text-sm font-semibold text-primary">
              L
            </span>
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">
              Life
            </span>
          </motion.div>
          <motion.p
            variants={reveal}
            className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase"
          >
            Acesso ao sistema
          </motion.p>
          <motion.h1
            variants={reveal}
            className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl"
          >
            Volte ao seu centro.
          </motion.h1>
          <motion.p
            variants={reveal}
            className="mt-4 max-w-sm text-base leading-7 text-muted-foreground"
          >
            Clareza para entender, alinhar e evoluir o que importa.
          </motion.p>

          <motion.form
            variants={reveal}
            className="mt-10 space-y-5"
            noValidate
            aria-label="Entrar no Life"
            onSubmit={handleSubmit(onValidSubmit)}
          >
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  className="h-11"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? emailErrorId : undefined}
                  {...register("email")}
                />
                <FieldError id={emailErrorId}>
                  {errors.email?.message}
                </FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="login-password">Senha</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-11 pe-12"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? passwordErrorId : undefined
                    }
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-0 size-11 -translate-y-1/2"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? (
                      <EyeOffIcon aria-hidden />
                    ) : (
                      <EyeIcon aria-hidden />
                    )}
                  </Button>
                </div>
                <FieldError id={passwordErrorId}>
                  {errors.password?.message}
                </FieldError>
              </FieldContent>
            </Field>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span aria-disabled="true">Esqueci minha senha</span>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase">
                Em breve
              </span>
            </div>

            <Button type="submit" size="lg" className="h-11 w-full">
              Entrar
            </Button>
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Demonstração: nenhuma credencial é enviada.
            </p>
          </motion.form>

          <motion.p
            variants={reveal}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Novo por aqui?{" "}
            <span aria-disabled="true" className="font-medium text-foreground">
              Criar conta em breve
            </span>
          </motion.p>
        </motion.div>
      </section>

      <aside
        className="relative order-1 h-64 overflow-hidden lg:order-2 lg:h-svh"
        aria-label="Identidade em alinhamento"
      >
        <LifeSceneLoader />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent lg:hidden" />
      </aside>
    </main>
  )
}
