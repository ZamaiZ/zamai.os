# Life Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a rota `/login` com formulário localmente validado, poster estático resiliente e uma cena humana procedural contemplativa carregada somente no cliente.

**Architecture:** A página permanece um Server Component e delega a interatividade ao `LoginScreen`. O loader 3D é uma fronteira Client Component que começa sempre pelo poster, avalia viewport, reduced motion e WebGL após a montagem e só então renderiza uma importação dinâmica com `ssr: false`. A figura e o sistema orbital são gerados por meshes React Three Fiber, sem GLB ou vídeo.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, shadcn/Base UI, React Hook Form, Zod, Motion, Three.js, React Three Fiber, Drei, Vitest e Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-22-life-login-design.md`

## Global Constraints

- Preservar o style Maia, a base Mist, Cyan como fluxo principal e Yellow somente para insight ou integração.
- Não criar HUD, estética cyberpunk, neon excessivo, corpo musculoso, cards, métricas ou números fictícios.
- A figura humana deve ser procedural, neutra, sem rosto, gênero marcado ou anatomia fitness.
- O formulário valida somente no cliente e não usa rede, armazenamento, sessão ou navegação após envio.
- O Canvas não deve ser solicitado no mobile nem para `prefers-reduced-motion: reduce`.
- `next/dynamic` com `ssr: false` deve permanecer no topo de `life-scene-loader.tsx`, que deve começar com `"use client"`, conforme o guia local `dist/docs/01-app/02-guides/lazy-loading.md` do Next 16.2.6.
- O poster deve ocupar a mesma caixa da cena para evitar layout shift e deve permanecer utilizável quando WebGL falhar.
- Todos os alvos interativos devem ter pelo menos 44 por 44 pixels, rótulos visíveis e foco perceptível.
- Não criar `public/models/life-figure.glb`.
- O worktree contém alterações do usuário anteriores a este plano. Adicionar aos commits somente os caminhos explicitamente criados nesta implementação; não incluir outros arquivos modificados ou não rastreados.

## File Map

- Create `src/components/three/life-scene-poster.tsx`: poster SVG/CSS estático e decorativo.
- Create `src/components/three/life-scene-loader.tsx`: decisão client-only, dynamic import e error boundary.
- Create `src/components/three/life-scene-loader.test.tsx`: comportamento de mobile, reduced motion, WebGL e fallback.
- Create `src/components/auth/login-schema.ts`: contrato Zod e tipo `LoginValues`.
- Create `src/components/auth/login-screen.tsx`: layout, formulário, validação, senha e Motion.
- Create `src/components/auth/login-screen.test.tsx`: testes de formulário e acessibilidade.
- Create `src/components/three/life-scene-config.ts`: fases, duração, cores WebGL e curvas orbitais determinísticas.
- Create `src/components/three/life-scene.tsx`: wrapper DOM, Canvas e arte procedural.
- Create `src/components/three/life-scene.test.tsx`: loop conceitual e smoke test sem WebGL real.
- Create `src/app/login/page.tsx`: rota e metadata estáticos.
- Create `src/app/login/page.test.tsx`: contrato da rota.
- Modify `src/app/layout.tsx`: corrigir o idioma raiz de `en` para `pt-BR`; não adicionar este arquivo a um commit enquanto ele continuar sendo uma alteração não rastreada anterior do usuário.

---

### Task 1: Poster resiliente e fronteira de carregamento 3D

**Files:**
- Create: `src/components/three/life-scene-poster.tsx`
- Create: `src/components/three/life-scene-loader.tsx`
- Test: `src/components/three/life-scene-loader.test.tsx`

**Interfaces:**
- Consumes: `window.matchMedia`, `HTMLCanvasElement.getContext` e `next/dynamic`.
- Produces: `LifeScenePoster(): React.JSX.Element`, `supportsWebGL(): boolean` e `LifeSceneLoader(): React.JSX.Element`.

- [ ] **Step 1: Restaurar os links locais de dependências sem alterar versões**

Run:

```powershell
pnpm install --offline --frozen-lockfile
```

Expected: exit 0, `package.json` e `pnpm-lock.yaml` sem diff novo, e `node_modules/.bin/vitest` disponível.

- [ ] **Step 2: Escrever os testes que definem quando o Canvas pode existir**

Crie `life-scene-loader.test.tsx` com um mock de `next/dynamic` que retorna um marcador `data-testid="life-scene"`. Inclua este helper e os cinco casos:

```tsx
import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const dynamicScene = vi.hoisted(() => ({ throws: false }))

vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicSceneMock() {
      if (dynamicScene.throws) throw new Error("webgl failed")
      return <div data-testid="life-scene" />
    },
}))

import { LifeSceneLoader } from "./life-scene-loader"

function setMedia({ mobile = false, reduced = false } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("max-width") ? mobile : reduced,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  )
}

describe("LifeSceneLoader", () => {
  beforeEach(() => {
    dynamicScene.throws = false
    setMedia()
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as never
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("shows the poster when reduced motion is enabled", async () => {
    setMedia({ reduced: true })
    render(<LifeSceneLoader />)
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
    expect(screen.queryByTestId("life-scene")).not.toBeInTheDocument()
  })

  it("shows the poster on a mobile viewport", async () => {
    setMedia({ mobile: true })
    render(<LifeSceneLoader />)
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
    expect(screen.queryByTestId("life-scene")).not.toBeInTheDocument()
  })

  it("loads the scene only on a motion-enabled WebGL desktop", async () => {
    render(<LifeSceneLoader />)
    await waitFor(() =>
      expect(screen.getByTestId("life-scene")).toBeInTheDocument()
    )
  })

  it("keeps the poster when WebGL is unavailable", () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    render(<LifeSceneLoader />)
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
    expect(screen.queryByTestId("life-scene")).not.toBeInTheDocument()
  })

  it("returns to the poster when the dynamic scene throws", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    dynamicScene.throws = true
    render(<LifeSceneLoader />)
    await waitFor(() => expect(consoleError).toHaveBeenCalled())
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Executar o teste e confirmar a falha correta**

Run:

```powershell
pnpm test src/components/three/life-scene-loader.test.tsx
```

Expected: FAIL porque `life-scene-loader.tsx` ainda não existe.

- [ ] **Step 4: Implementar o poster estático**

Crie `life-scene-poster.tsx` como SVG decorativo, sem animação CSS. Use `currentColor` e os tokens locais definidos no wrapper para manter Mist, Cyan e Yellow sem duplicar a cena em raster:

```tsx
import { cn } from "@/lib/utils"

export function LifeScenePoster({ className }: { className?: string }) {
  return (
    <div
      data-testid="life-scene-poster"
      aria-hidden="true"
      className={cn(
        "relative isolate h-full min-h-64 w-full overflow-hidden bg-[var(--life-space)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,color-mix(in_oklch,var(--life-flow)_13%,transparent),transparent_32%),radial-gradient(circle_at_50%_110%,color-mix(in_oklch,var(--life-mist)_8%,transparent),transparent_42%)]" />
      <svg
        viewBox="0 0 720 860"
        className="absolute inset-0 h-full w-full text-[var(--life-mist)]"
        fill="none"
      >
        <g opacity="0.28" stroke="var(--life-flow)" strokeWidth="1.25">
          <ellipse cx="360" cy="430" rx="225" ry="82" />
          <ellipse cx="360" cy="430" rx="225" ry="82" transform="rotate(58 360 430)" />
          <ellipse cx="360" cy="430" rx="225" ry="82" transform="rotate(-58 360 430)" />
        </g>
        <g fill="currentColor" opacity="0.82">
          <ellipse cx="360" cy="228" rx="48" ry="56" />
          <rect x="341" y="278" width="38" height="48" rx="19" />
          <rect x="288" y="314" width="144" height="220" rx="68" />
          <ellipse cx="360" cy="526" rx="70" ry="54" />
          <rect x="255" y="332" width="45" height="245" rx="23" transform="rotate(7 255 332)" />
          <rect x="420" y="332" width="45" height="245" rx="23" transform="rotate(-7 420 332)" />
          <rect x="302" y="552" width="50" height="260" rx="25" transform="rotate(2 302 552)" />
          <rect x="368" y="552" width="50" height="260" rx="25" transform="rotate(-2 368 552)" />
        </g>
        <g fill="var(--life-flow)">
          <circle cx="177" cy="401" r="5" />
          <circle cx="505" cy="319" r="4" />
          <circle cx="432" cy="610" r="4" />
        </g>
        <circle cx="536" cy="472" r="4" fill="var(--life-insight)" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--life-space)] to-transparent" />
    </div>
  )
}
```

- [ ] **Step 5: Implementar o loader client-only e seu error boundary**

Crie `life-scene-loader.tsx` com `"use client"` antes dos imports. Declare o dynamic import no topo, exatamente com caminho literal e named export:

```tsx
"use client"

import { Component, useEffect, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"

import { LifeScenePoster } from "./life-scene-poster"

const DynamicLifeScene = dynamic(
  () => import("./life-scene").then((module) => module.LifeScene),
  {
    ssr: false,
    loading: () => <LifeScenePoster />,
  }
)

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <LifeScenePoster /> : this.props.children
  }
}

export function LifeSceneLoader() {
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)")
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () =>
      setCanRender(!mobile.matches && !reduced.matches && supportsWebGL())

    sync()
    mobile.addEventListener("change", sync)
    reduced.addEventListener("change", sync)

    return () => {
      mobile.removeEventListener("change", sync)
      reduced.removeEventListener("change", sync)
    }
  }, [])

  return (
    <SceneErrorBoundary key={canRender ? "scene" : "poster"}>
      {canRender ? <DynamicLifeScene /> : <LifeScenePoster />}
    </SceneErrorBoundary>
  )
}
```

- [ ] **Step 6: Executar o teste e confirmar verde**

Run:

```powershell
pnpm test src/components/three/life-scene-loader.test.tsx
```

Expected: 5 tests PASS, sem warnings não suprimidos.

- [ ] **Step 7: Commitar somente os arquivos deste task**

```powershell
git add -- src/components/three/life-scene-poster.tsx src/components/three/life-scene-loader.tsx src/components/three/life-scene-loader.test.tsx
git commit -m "feat: add resilient life scene loader"
```

---

### Task 2: Formulário demonstrativo validado

**Files:**
- Create: `src/components/auth/login-schema.ts`
- Create: `src/components/auth/login-screen.tsx`
- Test: `src/components/auth/login-screen.test.tsx`

**Interfaces:**
- Consumes: `LifeSceneLoader`, componentes `Button`, `Input`, `Field`, React Hook Form, Zod e Motion.
- Produces: `loginSchema`, `LoginValues` e `LoginScreen(): React.JSX.Element`.

- [ ] **Step 1: Escrever os testes de comportamento do formulário**

Mocke somente a cena, não o formulário nem o resolver:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/components/three/life-scene-loader", () => ({
  LifeSceneLoader: () => <div data-testid="scene-boundary" />,
}))

import { LoginScreen } from "./login-screen"

describe("LoginScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("renders labelled credentials and the demonstrative disclosure", () => {
    render(<LoginScreen />)
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email")
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password")
    expect(
      screen.getByText("Demonstração: nenhuma credencial é enviada.")
    ).toBeInTheDocument()
  })

  it("shows field-level errors for an invalid submission", async () => {
    render(<LoginScreen />)
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "eduardo" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))
    expect(await screen.findByText("Digite um e-mail válido.")).toBeVisible()
    expect(screen.getByText("Digite sua senha.")).toBeVisible()
  })

  it("toggles password visibility with an accessible control", () => {
    render(<LoginScreen />)
    const password = screen.getByLabelText("Senha")
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }))
    expect(password).toHaveAttribute("type", "text")
    expect(
      screen.getByRole("button", { name: "Ocultar senha" })
    ).toBeInTheDocument()
  })

  it("keeps a valid submission local and on the same document", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const pushState = vi.spyOn(window.history, "pushState")
    const storage = vi.spyOn(Storage.prototype, "setItem")
    render(<LoginScreen />)
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "eduardo@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "segredo" },
    })
    fireEvent.submit(screen.getByRole("form", { name: "Entrar no Life" }))
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    )
    expect(pushState).not.toHaveBeenCalled()
    expect(storage).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Executar o teste e confirmar a falha correta**

Run:

```powershell
pnpm test src/components/auth/login-screen.test.tsx
```

Expected: FAIL porque `login-screen.tsx` ainda não existe.

- [ ] **Step 3: Criar o contrato de validação**

```ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
})

export type LoginValues = z.infer<typeof loginSchema>
```

- [ ] **Step 4: Implementar a composição e o formulário**

Em `login-screen.tsx`, use `"use client"`, `zodResolver(loginSchema)`, `useForm<LoginValues>({ defaultValues: { email: "", password: "" } })` e `handleSubmit(() => undefined)`. A estrutura deve ser exatamente um `main` de duas regiões, com o poster/cena primeiro no DOM mobile e à direita no desktop:

```tsx
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

export function LoginScreen() {
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
          <motion.div variants={reveal} className="mb-10 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-primary/25 bg-primary/10 text-sm font-semibold text-primary">
              L
            </span>
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">Life</span>
          </motion.div>
          <motion.p variants={reveal} className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Acesso ao sistema
          </motion.p>
          <motion.h1 variants={reveal} className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
            Volte ao seu centro.
          </motion.h1>
          <motion.p variants={reveal} className="mt-4 max-w-sm text-base leading-7 text-muted-foreground">
            Clareza para entender, alinhar e evoluir o que importa.
          </motion.p>

          <motion.form
            variants={reveal}
            className="mt-10 space-y-5"
            noValidate
            aria-label="Entrar no Life"
            onSubmit={handleSubmit(() => undefined)}
          >
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
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
                    {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
                  </Button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
              </FieldContent>
            </Field>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span aria-disabled="true">Esqueci minha senha</span>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase">Em breve</span>
            </div>

            <Button type="submit" size="lg" className="h-11 w-full">
              Entrar
            </Button>
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Demonstração: nenhuma credencial é enviada.
            </p>
          </motion.form>

          <motion.p variants={reveal} className="mt-8 text-center text-sm text-muted-foreground">
            Novo por aqui? <span aria-disabled="true" className="font-medium text-foreground">Criar conta em breve</span>
          </motion.p>
        </motion.div>
      </section>

      <aside className="relative order-1 h-64 overflow-hidden lg:order-2 lg:h-svh" aria-label="Identidade em alinhamento">
        <LifeSceneLoader />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent lg:hidden" />
      </aside>
    </main>
  )
}
```

Acrescente `h-11` também ao campo de e-mail para manter ambos os alvos com 44 pixels.

- [ ] **Step 5: Executar o teste e confirmar verde**

Run:

```powershell
pnpm test src/components/auth/login-screen.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 6: Commitar somente os arquivos deste task**

```powershell
git add -- src/components/auth/login-schema.ts src/components/auth/login-screen.tsx src/components/auth/login-screen.test.tsx
git commit -m "feat: add demonstrative login form"
```

---

### Task 3: Loop conceitual e cena humana procedural

**Files:**
- Create: `src/components/three/life-scene-config.ts`
- Create: `src/components/three/life-scene.tsx`
- Test: `src/components/three/life-scene.test.tsx`

**Interfaces:**
- Consumes: `Canvas`, `useFrame`, `Line`, `Sparkles` e constantes de `life-scene-config.ts`.
- Produces: `LIFE_PHASES`, `PHASE_DURATION_SECONDS`, `phaseAtElapsed(seconds: number)`, `phaseProgress(seconds: number)`, `orbitPoints(radius: number)` e `LifeScene()`.

- [ ] **Step 1: Escrever testes para a sequência e o wrapper acessível**

Use timers falsos e descarte os children do mock de Canvas para não montar elementos WebGL no jsdom:

```tsx
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="life-canvas" aria-hidden="true" />,
  useFrame: vi.fn(),
}))

vi.mock("@react-three/drei", () => ({
  Line: () => null,
  Sparkles: () => null,
}))

import { LIFE_PHASES, phaseAtElapsed } from "./life-scene-config"
import { LifeScene } from "./life-scene"

describe("life scene cycle", () => {
  afterEach(() => vi.useRealTimers())

  it("loops through the five conceptual phases", () => {
    expect(LIFE_PHASES).toEqual([
      "breathe",
      "understand",
      "align",
      "sharpen",
      "integrate",
    ])
    expect(phaseAtElapsed(0)).toBe("breathe")
    expect(phaseAtElapsed(6)).toBe("understand")
    expect(phaseAtElapsed(30)).toBe("breathe")
  })

  it("renders a decorative canvas and advances the visible phase label", () => {
    vi.useFakeTimers()
    render(<LifeScene />)
    expect(screen.getByTestId("life-canvas")).toBeInTheDocument()
    expect(screen.getByText("breathe")).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(6000))
    expect(screen.getByText("understand")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Executar o teste e confirmar a falha correta**

Run:

```powershell
pnpm test src/components/three/life-scene.test.tsx
```

Expected: FAIL porque os dois módulos da cena ainda não existem.

- [ ] **Step 3: Implementar configuração determinística**

```ts
import { Vector3 } from "three"

export const LIFE_PHASES = [
  "breathe",
  "understand",
  "align",
  "sharpen",
  "integrate",
] as const

export type LifePhase = (typeof LIFE_PHASES)[number]
export const PHASE_DURATION_SECONDS = 6

export const SCENE_COLORS = {
  space: "#071719",
  mist: "#b8c9c8",
  flow: "#5cc8c3",
  insight: "#ead54f",
} as const

export function phaseAtElapsed(seconds: number): LifePhase {
  const index =
    Math.floor(Math.max(0, seconds) / PHASE_DURATION_SECONDS) %
    LIFE_PHASES.length
  return LIFE_PHASES[index]
}

export function phaseProgress(seconds: number) {
  return (Math.max(0, seconds) % PHASE_DURATION_SECONDS) / PHASE_DURATION_SECONDS
}

export function orbitPoints(radius: number) {
  return Array.from({ length: 97 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2
    return new Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.42,
      Math.sin(angle) * 0.28
    )
  })
}
```

- [ ] **Step 4: Implementar figura, órbitas, nós, partículas e luz**

Em `life-scene.tsx`, declare pequenos componentes focados:

- `BodyPart` recebe `position`, `rotation`, `scale` e `kind: "sphere" | "capsule"` e aplica um único `meshStandardMaterial` Mist.
- `HumanFigure` compõe cabeça, pescoço, tronco, pelve, dois braços e duas pernas com simetria suave; braços devem inclinar somente 0.08 radiano para evitar pose atlética.
- `Orbit` recebe `radius`, `rotation`, `speed` e `offset`, usa `orbitPoints(radius)` no `Line` e move um nó Cyan sobre a curva.
- `IdentitySystem` usa `useFrame` para respiração `1 + Math.sin(time * 0.62) * 0.008`, rotação orbital máxima de `time * 0.025` e um point light Yellow somente quando `phaseAtElapsed(time) === "integrate"`.

O wrapper e o Canvas devem seguir este contrato:

```tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Line, Sparkles } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import type { Group, Mesh, PointLight } from "three"

import {
  LIFE_PHASES,
  PHASE_DURATION_SECONDS,
  SCENE_COLORS,
  orbitPoints,
  phaseAtElapsed,
  phaseProgress,
} from "./life-scene-config"

type VectorTuple = [number, number, number]

function BodyPart({
  kind,
  position,
  rotation = [0, 0, 0],
  scale,
}: {
  kind: "sphere" | "capsule"
  position: VectorTuple
  rotation?: VectorTuple
  scale: VectorTuple
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      {kind === "sphere" ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        <capsuleGeometry args={[0.5, 1, 8, 24]} />
      )}
      <meshStandardMaterial color={SCENE_COLORS.mist} roughness={0.72} metalness={0.08} />
    </mesh>
  )
}

function HumanFigure() {
  return (
    <group>
      <BodyPart kind="sphere" position={[0, 1.85, 0]} scale={[0.43, 0.52, 0.45]} />
      <BodyPart kind="capsule" position={[0, 1.38, 0]} scale={[0.34, 0.34, 0.34]} />
      <BodyPart kind="capsule" position={[0, 0.63, 0]} scale={[1.05, 1.18, 0.72]} />
      <BodyPart kind="sphere" position={[0, -0.28, 0]} scale={[0.68, 0.48, 0.54]} />
      <BodyPart kind="capsule" position={[-0.88, 0.48, 0]} rotation={[0, 0, 0.08]} scale={[0.36, 1.28, 0.36]} />
      <BodyPart kind="capsule" position={[0.88, 0.48, 0]} rotation={[0, 0, -0.08]} scale={[0.36, 1.28, 0.36]} />
      <BodyPart kind="capsule" position={[-0.35, -1.42, 0]} rotation={[0, 0, 0.025]} scale={[0.43, 1.48, 0.43]} />
      <BodyPart kind="capsule" position={[0.35, -1.42, 0]} rotation={[0, 0, -0.025]} scale={[0.43, 1.48, 0.43]} />
    </group>
  )
}

function Orbit({ radius, rotation, speed, offset }: { radius: number; rotation: VectorTuple; speed: number; offset: number }) {
  const node = useRef<Mesh>(null)
  const points = useMemo(() => orbitPoints(radius), [radius])
  useFrame(({ clock }) => {
    if (!node.current) return
    const angle = clock.elapsedTime * speed + offset
    node.current.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.42, Math.sin(angle) * 0.28)
  })
  return (
    <group rotation={rotation}>
      <Line points={points} color={SCENE_COLORS.flow} transparent opacity={0.25} lineWidth={0.65} />
      <mesh ref={node}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={SCENE_COLORS.flow} />
      </mesh>
    </group>
  )
}

function IdentitySystem() {
  const root = useRef<Group>(null)
  const orbital = useRef<Group>(null)
  const insight = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    const breath = 1 + Math.sin(time * 0.62) * 0.008
    root.current?.scale.setScalar(breath)
    if (orbital.current) orbital.current.rotation.y = time * 0.025
    if (insight.current) {
      const pulse = Math.sin(phaseProgress(time) * Math.PI) ** 8
      insight.current.intensity = phaseAtElapsed(time) === "integrate" ? pulse * 2.2 : 0
    }
  })
  return (
    <group>
      <group ref={root}><HumanFigure /></group>
      <group ref={orbital}>
        <Orbit radius={2.05} rotation={[0.18, 0.12, 0]} speed={0.15} offset={0} />
        <Orbit radius={2.28} rotation={[1.02, 0.28, 0.62]} speed={0.11} offset={2.1} />
        <Orbit radius={2.42} rotation={[-0.82, -0.16, -0.54]} speed={0.09} offset={4.2} />
      </group>
      <pointLight ref={insight} position={[1.8, 0.4, 1.4]} color={SCENE_COLORS.insight} distance={4.5} intensity={0} />
    </group>
  )
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={[SCENE_COLORS.space]} />
      <ambientLight intensity={0.48} />
      <directionalLight position={[-3, 4, 4]} color={SCENE_COLORS.mist} intensity={2.1} />
      <pointLight position={[3, 0.8, 2]} color={SCENE_COLORS.flow} intensity={2.4} distance={7} />
      <IdentitySystem />
      <Sparkles count={42} scale={[6, 5.5, 3]} size={1.1} speed={0.08} opacity={0.22} color={SCENE_COLORS.flow} noise={[1, 0.35, 1]} />
    </>
  )
}

export function LifeScene() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(
      () => setPhaseIndex((index) => (index + 1) % LIFE_PHASES.length),
      PHASE_DURATION_SECONDS * 1000
    )
    return () => window.clearInterval(timer)
  }, [])
  return (
    <div className="relative h-full min-h-64 w-full bg-[var(--life-space)]">
      <Canvas
        aria-hidden="true"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.15, 7.3], fov: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <SceneContent />
      </Canvas>
      <div aria-hidden="true" className="absolute right-8 bottom-8 font-mono text-[10px] tracking-[0.18em] text-[var(--life-flow)] uppercase">
        {LIFE_PHASES[phaseIndex]}
      </div>
      <p className="sr-only">Um corpo humano abstrato respira enquanto compreender, alinhar, refinar e integrar formam um ciclo contínuo.</p>
    </div>
  )
}
```

- [ ] **Step 5: Executar teste, typecheck focado e confirmar verde**

Run:

```powershell
pnpm test src/components/three/life-scene.test.tsx
pnpm typecheck
```

Expected: 2 tests PASS e TypeScript exit 0. Se a tipagem R3F rejeitar `aria-hidden` no `Canvas`, mova o atributo para o wrapper imediatamente externo e mantenha o teste no wrapper.

- [ ] **Step 6: Commitar somente os arquivos deste task**

```powershell
git add -- src/components/three/life-scene-config.ts src/components/three/life-scene.tsx src/components/three/life-scene.test.tsx
git commit -m "feat: build procedural identity scene"
```

---

### Task 4: Rota `/login`, metadata e idioma

**Files:**
- Create: `src/app/login/page.tsx`
- Test: `src/app/login/page.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `LoginScreen`.
- Produces: rota `/login` e `metadata: Metadata` com título e descrição.

- [ ] **Step 1: Escrever o contrato da rota**

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/auth/login-screen", () => ({
  LoginScreen: () => <main>Login Life</main>,
}))

import LoginPage, { metadata } from "./page"

describe("LoginPage", () => {
  it("exports static metadata and renders the login screen", () => {
    render(<LoginPage />)
    expect(screen.getByRole("main")).toHaveTextContent("Login Life")
    expect(metadata.title).toBe("Entrar | Life")
    expect(metadata.description).toBe("Acesse seu sistema pessoal Life.")
  })
})
```

- [ ] **Step 2: Executar o teste e confirmar a falha correta**

Run:

```powershell
pnpm test src/app/login/page.test.tsx
```

Expected: FAIL porque `src/app/login/page.tsx` ainda não existe.

- [ ] **Step 3: Implementar o Server Component e metadata estáticos**

```tsx
import type { Metadata } from "next"

import { LoginScreen } from "@/components/auth/login-screen"

export const metadata: Metadata = {
  title: "Entrar | Life",
  description: "Acesse seu sistema pessoal Life.",
}

export default function LoginPage() {
  return <LoginScreen />
}
```

- [ ] **Step 4: Corrigir o idioma do documento sem sobrescrever outras mudanças**

Em `src/app/layout.tsx`, altere apenas `lang="en"` para `lang="pt-BR"` usando `apply_patch`. Confira o diff desse arquivo antes de continuar. Como ele já pertence ao conjunto de alterações do usuário, não o adicione ao commit deste task.

- [ ] **Step 5: Executar testes de rota e regressão**

Run:

```powershell
pnpm test src/app/login/page.test.tsx src/components/auth/login-screen.test.tsx src/components/three/life-scene-loader.test.tsx src/components/three/life-scene.test.tsx
```

Expected: todos os testes novos PASS.

- [ ] **Step 6: Commitar somente a rota e seu teste**

```powershell
git add -- src/app/login/page.tsx src/app/login/page.test.tsx
git commit -m "feat: add life login route"
```

---

### Task 5: Verificação visual, acessibilidade e produção

**Files:**
- Modify only if verification finds a defect: files created in Tasks 1–4.
- Read: `C:/Users/Eduardo Zamai/.codex/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/2.13.0/.claude/skills/ui-ux-pro-max/references/pro-rules.md`

**Interfaces:**
- Consumes: rota completa `/login`.
- Produces: evidência de comportamento responsivo, fallback, qualidade visual e build de produção.

- [ ] **Step 1: Rodar a suíte completa antes da inspeção visual**

```powershell
pnpm test
pnpm lint
pnpm typecheck
```

Expected: todos exit 0. Qualquer regressão deve receber primeiro um teste que falha pelo motivo correto, seguido da correção mínima.

- [ ] **Step 2: Iniciar o servidor local e abrir `/login` com a skill de browser**

```powershell
pnpm dev
```

Use `browser:control-in-app-browser` para abrir a URL indicada pelo servidor. Não use um navegador externo sem sessão controlável.

- [ ] **Step 3: Inspecionar os breakpoints obrigatórios**

Verifique 375, 768, 1024 e 1440 pixels:

- sem scroll horizontal;
- poster em 375 e abaixo de 768, sem criação de `canvas`;
- Canvas somente em desktop com movimento permitido;
- formulário legível sem depender da arte;
- alvos de 44 pixels e foco visível em ordem: e-mail, senha, mostrar senha, entrar;
- Yellow visível somente no pulso `integrate`;
- figura neutra e serena, sem silhueta muscular;
- órbitas finas, poucos nós e partículas discretas;
- texto sem órfãos ou sobreposição.

- [ ] **Step 4: Inspecionar reduced motion e falha de WebGL**

Emule `prefers-reduced-motion: reduce` e confirme poster estático sem Canvas e formulário sem deslocamento de entrada. Bloqueie WebGL ou force `getContext` a retornar `null` em um teste manual controlado e confirme que o poster permanece, sem afetar campos ou envio.

- [ ] **Step 5: Executar build de produção e suíte fresca**

Pare o servidor de desenvolvimento e execute:

```powershell
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Expected: todos os comandos exit 0, rota `/login` presente no output do build e nenhum erro de whitespace.

- [ ] **Step 6: Auditar o diff sem capturar trabalho anterior**

```powershell
git status --short
git diff -- src/app/layout.tsx
git diff --stat
```

Confirme que os commits contêm somente arquivos criados por este plano. Mantenha `src/app/layout.tsx` fora do stage se ele continuar não rastreado ou misturado às mudanças anteriores do usuário.

- [ ] **Step 7: Commitar apenas correções visuais adicionais criadas nesta etapa**

Se a inspeção exigiu mudanças nos arquivos novos, adicione os caminhos explicitamente e use:

```powershell
git commit -m "fix: polish life login experience"
```

Se nenhuma mudança adicional foi necessária, não crie commit vazio.
