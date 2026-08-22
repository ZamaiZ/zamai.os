# Life Protected Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one accessible, responsive shadcn sidebar shell for all protected Life routes, with only Início, Showcase, three-state theme control, and logout, while removing superseded configuration and restoring a clean verification baseline.

**Architecture:** Keep authentication and cookie reads in the protected Server Component layout. Compose the installed Base UI shadcn `SidebarProvider`, `Sidebar`, and `SidebarInset` in focused application components; keep pathname, theme, Sheet-closing, and pending-submit behavior in small Client Components. Preserve the existing auth and Showcase systems and remove only generated, obsolete, duplicated, or proven-unused artifacts.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.4, TypeScript 5, shadcn CLI 4 Base UI (`base-maia`), Tailwind CSS 4, next-themes 0.4.6, Supabase SSR, Vitest 4, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-22-life-protected-sidebar-design.md`

## Global Constraints

- Protected navigation contains exactly `Início` (`/`) and `Showcase` (`/showcase`).
- Theme cycle is exactly `system → light → dark → system` and the keyboard shortcut is physical `Ctrl+Alt+T`.
- Sidebar collapse remains the shadcn primitive's `Ctrl+B`/`Cmd+B` behavior and `sidebar_state` cookie.
- Use the installed Base UI `render` prop for element composition; do not copy Radix-only `asChild` examples.
- Do not port Motion, React Icons, custom NavTree, or separate mobile navigation from the sibling `next` project.
- Do not add a PWA, service worker, Workbox, Serwist, or `/sw.js` source route.
- Preserve Supabase auth, Proxy, route groups, the complete Showcase, its contained sidebar demo, user documents, assets, environment files, and unrelated worktree changes.
- Localize user-facing sidebar assistive strings to Portuguese.
- Active navigation must expose both `isActive` visual state and `aria-current="page"`.
- Icon-only controls must retain an accessible name and collapsed tooltip.
- Shortcuts must ignore repeat, prevented events, editable targets, Meta, and AltGraph.
- Final clean `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` must pass.

---

## File Structure

### Create

- `src/lib/theme.ts` — three-state theme domain and cycle helper.
- `src/components/theme-provider.test.tsx` — global shortcut behavior.
- `src/components/layout/protected-navigation.ts` — immutable navigation registry and route matching.
- `src/components/layout/protected-navigation.test.ts` — exact route semantics.
- `src/components/layout/sidebar-theme-toggle.tsx` — visible and collapsed theme action.
- `src/components/layout/sidebar-theme-toggle.test.tsx` — theme action semantics.
- `src/components/layout/sidebar-logout-button.tsx` — pending-aware submit control.
- `src/components/layout/sidebar-logout-button.test.tsx` — accessible pending behavior.
- `src/components/layout/app-sidebar.tsx` — application-specific shadcn sidebar composition.
- `src/components/layout/app-sidebar.test.tsx` — navigation, active state, controls, and mobile close behavior.
- `src/components/layout/protected-header.tsx` — standard trigger and route label.
- `src/components/layout/protected-header.test.tsx` — trigger and label behavior.
- `src/components/layout/app-shell.tsx` — provider, sidebar, inset, header, and scroll region.
- `src/components/layout/app-shell.test.tsx` — structural shell contract.
- `src/components/ui/sidebar-accessibility.test.tsx` — Portuguese mobile Sheet semantics.

### Modify

- `package.json` — pin `pnpm@10.34.5`.
- `src/app/showcase/sections/content-feedback.tsx` — provide explicit indeterminate Progress value.
- `src/app/showcase/sections/date-selection-inputs.tsx` — align grouped Combobox use with Base UI 1.7.
- `src/app/showcase/sections/field-inputs.tsx` — use Base UI Select `label/value` option records.
- `src/app/showcase/sections/forms-inputs.test.tsx` — remove unsupported `exact` role option.
- `src/app/ui-showcase.test.tsx` — remove unsupported `exact` role option.
- `src/app/showcase/showcase-catalog.test.ts` — preserve the `.tsx` template-literal filename type.
- `src/components/theme-provider.tsx` — replace the old `D` toggle with the approved chord.
- `src/components/ui/sidebar.tsx` — localize assistive strings without changing primitive behavior.
- `src/app/(protected)/layout.tsx` — authenticate, read sidebar cookie, and render the shell.

### Generated state to remove and regenerate

- `.next/` — stale Next development and route-type output.
- `tsconfig.tsbuildinfo` — stale TypeScript incremental state.

---

### Task 1: Stabilize the Package and Showcase Baseline

**Files:**
- Modify: `package.json`
- Modify: `src/app/showcase/sections/content-feedback.tsx`
- Modify: `src/app/showcase/sections/date-selection-inputs.tsx`
- Modify: `src/app/showcase/sections/field-inputs.tsx`
- Modify: `src/app/showcase/sections/forms-inputs.test.tsx`
- Modify: `src/app/ui-showcase.test.tsx`
- Modify: `src/app/showcase/showcase-catalog.test.ts`
- Regenerate: `node_modules/`
- Regenerate: `.next/`
- Remove generated: `tsconfig.tsbuildinfo`

**Interfaces:**
- Consumes: Base UI 1.7 `Progress.Root`, `Combobox.Group`, `Combobox.Collection`, and `Select.Root` installed types.
- Produces: A deterministic pnpm 10.34.5 install and a Showcase source baseline with no TypeScript API mismatch.

- [ ] **Step 1: Capture the current failing baseline**

Stop the running development server so `.next` can be safely regenerated, then run:

```powershell
pnpm typecheck
```

Expected: FAIL, including the missing `app-shell`, missing `src/lib/theme.ts`, stale `.next/types` routes, Progress without `value`, Combobox collection `items`, Select string arrays, unsupported Testing Library `exact`, and catalog filename type mismatch.

- [ ] **Step 2: Pin the package manager**

Add this top-level field to `package.json`:

```json
"packageManager": "pnpm@10.34.5"
```

Do not remove declared dependencies in this step. Authentication and Showcase currently consume them; dependency removal is allowed only after the final repository-wide usage audit.

- [ ] **Step 3: Correct the Progress indeterminate example**

Change the third Progress example in `content-feedback.tsx` from an omitted value to an explicit Base UI indeterminate value:

```tsx
<Progress value={null} aria-label="Sincronização em andamento">
  <ProgressLabel>Sincronizando referências</ProgressLabel>
</Progress>
```

- [ ] **Step 4: Correct grouped Combobox collection ownership**

Move each grouped slice to `ComboboxGroup`; `ComboboxCollection` receives only its render function:

```tsx
<ComboboxGroup items={timezones.slice(0, 2)}>
  <ComboboxLabel>Américas</ComboboxLabel>
  <ComboboxCollection>
    {(item) => (
      <ComboboxItem key={item} value={item}>
        {item}
      </ComboboxItem>
    )}
  </ComboboxCollection>
</ComboboxGroup>
```

Apply the same structure to `timezones.slice(2)`.

Type the custom country callbacks from the source data:

```tsx
type Country = (typeof countries)[number]

<Combobox
  items={countries}
  itemToStringValue={(country: Country) => country.label}
>
  {/* existing trigger/content */}
  <ComboboxList>
    {(country: Country) => (
      <ComboboxItem key={country.value} value={country}>
        {/* existing country content */}
      </ComboboxItem>
    )}
  </ComboboxList>
</Combobox>
```

- [ ] **Step 5: Replace Select string collections with label/value records**

Define reusable options beside `priorities`:

```tsx
const densityOptions = [
  { label: "Compacta", value: "Compact" },
  { label: "Confortável", value: "Comfort" },
]

const teamOptions = ["Design", "Produto", "Engenharia", "Finanças"].map(
  (value) => ({ label: value, value })
)

const planOptions = [{ label: "Gratuito", value: "free" }]

const regionOptions = [
  { label: "Brasil", value: "br" },
  { label: "Estados Unidos", value: "us" },
]
```

Inside `SelectDemo`, derive timezone records:

```tsx
const timezoneOptions = manyTimezones.map((value) => ({
  label: value,
  value,
}))
```

Replace the five string-array `items` props with the corresponding option collections:

```tsx
<Select items={densityOptions}>...</Select>
<Select items={teamOptions}>...</Select>
<Select items={timezoneOptions}>...</Select>
<Select items={planOptions} disabled>...</Select>
<Select items={regionOptions}>...</Select>
```

Keep existing `SelectItem` values aligned with those records (`Compact`, `Comfort`, team name, timezone, `free`, `br`, `us`).

- [ ] **Step 6: Correct compile-time test APIs without weakening assertions**

In `forms-inputs.test.tsx` and `ui-showcase.test.tsx`, remove `exact: true` from `getByRole`/`getAllByRole`. A string accessible-name matcher is exact by default.

In `showcase-catalog.test.ts`, narrow the filtered filenames:

```ts
const uiFiles = readdirSync(join(process.cwd(), "src/components/ui"))
  .filter((file): file is `${string}.tsx` => file.endsWith(".tsx"))
  .sort()
```

- [ ] **Step 7: Safely remove generated state and reinstall from the lockfile**

Run from `C:\Users\Eduardo Zamai\Documents\life` after the dev server is stopped:

```powershell
$projectRoot = (Resolve-Path -LiteralPath '.').Path
$nextPath = Join-Path $projectRoot '.next'
$expectedNextPath = 'C:\Users\Eduardo Zamai\Documents\life\.next'
if ($nextPath -ne $expectedNextPath) { throw "Unexpected .next path: $nextPath" }
if (Test-Path -LiteralPath $nextPath) {
  Remove-Item -LiteralPath $nextPath -Recurse -Force
}
$buildInfoPath = Join-Path $projectRoot 'tsconfig.tsbuildinfo'
if ($buildInfoPath -ne 'C:\Users\Eduardo Zamai\Documents\life\tsconfig.tsbuildinfo') {
  throw "Unexpected build info path: $buildInfoPath"
}
Remove-Item -LiteralPath $buildInfoPath -Force -ErrorAction SilentlyContinue
pnpm install --frozen-lockfile
```

Expected: install completes with pnpm 10.34.5 and does not change dependency versions in `pnpm-lock.yaml`.

- [ ] **Step 8: Run focused verification**

```powershell
pnpm vitest run src/app/showcase/showcase-catalog.test.ts src/app/showcase/sections/forms-inputs.test.tsx src/app/ui-showcase.test.tsx
pnpm typecheck
```

Expected: focused tests PASS. Typecheck may still FAIL only for the intentionally missing `src/lib/theme.ts` and `src/components/layout/app-shell.tsx`. Do not continue if Showcase, dependency-resolution, or stale `.next` errors remain.

- [ ] **Step 9: Commit the baseline stabilization**

```powershell
git add package.json pnpm-lock.yaml src/app/showcase/sections/content-feedback.tsx src/app/showcase/sections/date-selection-inputs.tsx src/app/showcase/sections/field-inputs.tsx src/app/showcase/sections/forms-inputs.test.tsx src/app/ui-showcase.test.tsx src/app/showcase/showcase-catalog.test.ts
git commit -m "fix: stabilize showcase baseline"
```

---

### Task 2: Implement the Three-State Theme Domain and Shortcut

**Files:**
- Create: `src/lib/theme.ts`
- Modify: `src/lib/theme.test.ts`
- Create: `src/components/theme-provider.test.tsx`
- Modify: `src/components/theme-provider.tsx`

**Interfaces:**
- Produces: `ThemeValue`, `isThemeValue(value)`, and `nextTheme(current)` for the provider and sidebar theme action.
- Produces: Global physical `Ctrl+Alt+T` handling inside the existing root `ThemeProvider`.

- [ ] **Step 1: Extend the failing theme-domain test**

Add type-guard coverage to `src/lib/theme.test.ts`:

```ts
import { isThemeValue, nextTheme } from "./theme"

it("recognizes only supported configured themes", () => {
  expect(isThemeValue("system")).toBe(true)
  expect(isThemeValue("light")).toBe(true)
  expect(isThemeValue("dark")).toBe(true)
  expect(isThemeValue("nope")).toBe(false)
  expect(isThemeValue(undefined)).toBe(false)
})
```

- [ ] **Step 2: Write the failing provider shortcut tests**

Create `src/components/theme-provider.test.tsx` with a partial `next-themes` mock and cover the valid chord and rejection cases:

```tsx
import type { ReactNode } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const themeMock = vi.hoisted(() => ({
  theme: "system" as string | undefined,
  setTheme: vi.fn(),
}))

vi.mock("next-themes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-themes")>()
  return {
    ...actual,
    ThemeProvider: ({ children }: { children: ReactNode }) => children,
    useTheme: () => themeMock,
  }
})

import { ThemeProvider } from "./theme-provider"

describe("ThemeProvider shortcut", () => {
  beforeEach(() => {
    themeMock.theme = "system"
    themeMock.setTheme.mockReset()
  })

  it("cycles the configured theme with Ctrl+Alt+T", () => {
    render(<ThemeProvider><div /></ThemeProvider>)
    fireEvent.keyDown(window, { code: "KeyT", ctrlKey: true, altKey: true })
    expect(themeMock.setTheme).toHaveBeenCalledWith("light")
  })

  it("ignores the chord in editable targets", () => {
    render(<ThemeProvider><input aria-label="Editor" /></ThemeProvider>)
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Editor" }), {
      code: "KeyT",
      ctrlKey: true,
      altKey: true,
    })
    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it.each([
    { code: "KeyT", ctrlKey: true, altKey: false },
    { code: "KeyT", ctrlKey: false, altKey: true },
    { code: "KeyT", ctrlKey: true, altKey: true, metaKey: true },
    { code: "KeyT", ctrlKey: true, altKey: true, repeat: true },
  ])("ignores invalid shortcut state %#", (eventInit) => {
    render(<ThemeProvider><div /></ThemeProvider>)
    fireEvent.keyDown(window, eventInit)
    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores AltGraph input", () => {
    render(<ThemeProvider><div /></ThemeProvider>)
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      code: "KeyT",
      ctrlKey: true,
      altKey: true,
    })
    Object.defineProperty(event, "getModifierState", {
      value: (modifier: string) => modifier === "AltGraph",
    })
    window.dispatchEvent(event)
    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run the tests to verify the missing implementation**

```powershell
pnpm vitest run src/lib/theme.test.ts src/components/theme-provider.test.tsx
```

Expected: FAIL because `src/lib/theme.ts` does not exist and the provider still implements plain `D` light/dark toggling.

- [ ] **Step 4: Implement the theme domain**

Create `src/lib/theme.ts`:

```ts
export type ThemeValue = "system" | "light" | "dark"

const THEME_CYCLE: Record<ThemeValue, ThemeValue> = {
  system: "light",
  light: "dark",
  dark: "system",
}

export function isThemeValue(value: unknown): value is ThemeValue {
  return value === "system" || value === "light" || value === "dark"
}

export function nextTheme(current: string | undefined): ThemeValue {
  if (current === undefined) return THEME_CYCLE.system
  if (!isThemeValue(current)) return "system"
  return THEME_CYCLE[current]
}
```

- [ ] **Step 5: Replace the old shortcut implementation**

Keep `isTypingTarget`. Update `ThemeHotkey` to consume configured `theme`, not `resolvedTheme`:

```tsx
function ThemeHotkey() {
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.getModifierState("AltGraph")) return
      if (!event.ctrlKey || !event.altKey || event.code !== "KeyT") return
      if (isTypingTarget(event.target)) return

      event.preventDefault()
      setTheme(nextTheme(theme))
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [theme, setTheme])

  return null
}
```

Import `nextTheme` from `@/lib/theme`. Remove all `D`, `event.key`, and resolved-light/dark logic.

- [ ] **Step 6: Run theme tests and commit**

```powershell
pnpm vitest run src/lib/theme.test.ts src/components/theme-provider.test.tsx
git add src/lib/theme.ts src/lib/theme.test.ts src/components/theme-provider.tsx src/components/theme-provider.test.tsx
git commit -m "feat: add accessible three-state theme shortcut"
```

Expected: theme tests PASS.

---

### Task 3: Define the Protected Navigation Contract

**Files:**
- Create: `src/components/layout/protected-navigation.ts`
- Create: `src/components/layout/protected-navigation.test.ts`

**Interfaces:**
- Produces: `ProtectedNavigationItem`, `protectedNavigation`, `isProtectedRouteActive(pathname, href)`, and `getProtectedSectionLabel(pathname)`.
- Consumers: `AppSidebar` and `ProtectedHeader`.

- [ ] **Step 1: Write the failing navigation tests**

Create `src/components/layout/protected-navigation.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import {
  getProtectedSectionLabel,
  isProtectedRouteActive,
  protectedNavigation,
} from "./protected-navigation"

describe("protected navigation", () => {
  it("contains only Início and Showcase", () => {
    expect(protectedNavigation.map(({ label, href }) => ({ label, href }))).toEqual([
      { label: "Início", href: "/" },
      { label: "Showcase", href: "/showcase" },
    ])
  })

  it("matches root exactly", () => {
    expect(isProtectedRouteActive("/", "/")).toBe(true)
    expect(isProtectedRouteActive("/showcase", "/")).toBe(false)
  })

  it("matches non-root routes and descendants", () => {
    expect(isProtectedRouteActive("/showcase", "/showcase")).toBe(true)
    expect(isProtectedRouteActive("/showcase/sidebar", "/showcase")).toBe(true)
    expect(isProtectedRouteActive("/login", "/showcase")).toBe(false)
  })

  it("derives a neutral label for unknown paths", () => {
    expect(getProtectedSectionLabel("/")).toBe("Início")
    expect(getProtectedSectionLabel("/showcase")).toBe("Showcase")
    expect(getProtectedSectionLabel("/unknown")).toBe("Life")
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```powershell
pnpm vitest run src/components/layout/protected-navigation.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the immutable registry and helpers**

Create `src/components/layout/protected-navigation.ts`:

```ts
import type { LucideIcon } from "lucide-react"
import { HomeIcon, PanelsTopLeftIcon } from "lucide-react"

export type ProtectedNavigationItem = {
  readonly label: string
  readonly href: string
  readonly icon: LucideIcon
}

export const protectedNavigation = [
  { label: "Início", href: "/", icon: HomeIcon },
  { label: "Showcase", href: "/showcase", icon: PanelsTopLeftIcon },
] as const satisfies readonly ProtectedNavigationItem[]

export function isProtectedRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getProtectedSectionLabel(pathname: string) {
  return (
    protectedNavigation.find((item) =>
      isProtectedRouteActive(pathname, item.href)
    )?.label ?? "Life"
  )
}
```

- [ ] **Step 4: Run the test and commit**

```powershell
pnpm vitest run src/components/layout/protected-navigation.test.ts
git add src/components/layout/protected-navigation.ts src/components/layout/protected-navigation.test.ts
git commit -m "feat: define protected navigation"
```

Expected: navigation tests PASS.

---

### Task 4: Build the Accessible Sidebar Theme Action

**Files:**
- Create: `src/components/layout/sidebar-theme-toggle.tsx`
- Create: `src/components/layout/sidebar-theme-toggle.test.tsx`

**Interfaces:**
- Consumes: `ThemeValue`, `isThemeValue`, and `nextTheme` from `@/lib/theme`.
- Consumes: `SidebarMenuButton` and `Kbd` shadcn primitives.
- Produces: `SidebarThemeToggle`, rendered inside one `SidebarMenuItem`.

- [ ] **Step 1: Write the failing theme-action tests**

Create `src/components/layout/sidebar-theme-toggle.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SidebarProvider } from "@/components/ui/sidebar"

const themeMock = vi.hoisted(() => ({
  theme: "system" as string | undefined,
  setTheme: vi.fn(),
}))

vi.mock("next-themes", () => ({
  useTheme: () => themeMock,
}))

import { SidebarThemeToggle } from "./sidebar-theme-toggle"

function renderToggle() {
  return render(
    <SidebarProvider>
      <SidebarThemeToggle />
    </SidebarProvider>
  )
}

describe("SidebarThemeToggle", () => {
  beforeEach(() => {
    themeMock.theme = "system"
    themeMock.setTheme.mockReset()
  })

  it("announces the configured theme and next action", () => {
    renderToggle()
    expect(
      screen.getByRole("button", {
        name: "Tema do sistema. Alterar para tema claro.",
      })
    ).toBeInTheDocument()
  })

  it("advances the configured theme on click", () => {
    renderToggle()
    fireEvent.click(screen.getByRole("button", { name: /Tema do sistema/ }))
    expect(themeMock.setTheme).toHaveBeenCalledWith("light")
  })

  it("falls back safely for an unknown configured value", () => {
    themeMock.theme = "legacy"
    renderToggle()
    expect(screen.getByRole("button", { name: /Tema do sistema/ })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```powershell
pnpm vitest run src/components/layout/sidebar-theme-toggle.test.tsx
```

Expected: FAIL because `SidebarThemeToggle` does not exist.

- [ ] **Step 3: Implement the theme action**

Create `src/components/layout/sidebar-theme-toggle.tsx`:

```tsx
"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Kbd } from "@/components/ui/kbd"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import {
  isThemeValue,
  nextTheme,
  type ThemeValue,
} from "@/lib/theme"

const THEME_META: Record<
  ThemeValue,
  { icon: typeof MonitorIcon; current: string; next: string }
> = {
  system: {
    icon: MonitorIcon,
    current: "Tema do sistema",
    next: "tema claro",
  },
  light: { icon: SunIcon, current: "Tema claro", next: "tema escuro" },
  dark: { icon: MoonIcon, current: "Tema escuro", next: "tema do sistema" },
}

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme()
  const current: ThemeValue = isThemeValue(theme) ? theme : "system"
  const meta = THEME_META[current]
  const accessibleLabel = `${meta.current}. Alterar para ${meta.next}.`
  const Icon = meta.icon

  return (
    <SidebarMenuButton
      type="button"
      tooltip={accessibleLabel}
      aria-label={accessibleLabel}
      onClick={() => setTheme(nextTheme(current))}
    >
      <Icon aria-hidden />
      <span>Tema</span>
      <Kbd className="ms-auto group-data-[collapsible=icon]:hidden">
        Ctrl Alt T
      </Kbd>
    </SidebarMenuButton>
  )
}
```

- [ ] **Step 4: Run the test and commit**

```powershell
pnpm vitest run src/components/layout/sidebar-theme-toggle.test.tsx
git add src/components/layout/sidebar-theme-toggle.tsx src/components/layout/sidebar-theme-toggle.test.tsx
git commit -m "feat: add sidebar theme action"
```

Expected: theme-action tests PASS.

---

### Task 5: Build the Pending-Aware Logout Control

**Files:**
- Create: `src/components/layout/sidebar-logout-button.tsx`
- Create: `src/components/layout/sidebar-logout-button.test.tsx`

**Interfaces:**
- Consumes: React 19 `useFormStatus()` from an ancestor form.
- Produces: `SidebarLogoutButton`, always accessible as "Sair" and safe against duplicate submission.

- [ ] **Step 1: Write the failing logout-control tests**

Create `src/components/layout/sidebar-logout-button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SidebarProvider } from "@/components/ui/sidebar"

const formStatusMock = vi.hoisted(() => ({ pending: false }))

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>()
  return {
    ...actual,
    useFormStatus: () => ({
      pending: formStatusMock.pending,
      data: null,
      method: null,
      action: null,
    }),
  }
})

import { SidebarLogoutButton } from "./sidebar-logout-button"

function renderButton() {
  return render(
    <SidebarProvider>
      <SidebarLogoutButton />
    </SidebarProvider>
  )
}

describe("SidebarLogoutButton", () => {
  beforeEach(() => {
    formStatusMock.pending = false
  })

  it("submits with an accessible Sair label", () => {
    renderButton()
    const button = screen.getByRole("button", { name: "Sair" })
    expect(button).toHaveAttribute("type", "submit")
    expect(button).not.toBeDisabled()
  })

  it("disables duplicate submission and exposes busy state", () => {
    formStatusMock.pending = true
    renderButton()
    const button = screen.getByRole("button", { name: "Sair" })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Saindo…")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```powershell
pnpm vitest run src/components/layout/sidebar-logout-button.test.tsx
```

Expected: FAIL because `SidebarLogoutButton` does not exist.

- [ ] **Step 3: Implement the submit control**

Create `src/components/layout/sidebar-logout-button.tsx`:

```tsx
"use client"

import { LogOutIcon } from "lucide-react"
import { useFormStatus } from "react-dom"

import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"

export function SidebarLogoutButton() {
  const { pending } = useFormStatus()

  return (
    <SidebarMenuButton
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      aria-label="Sair"
      tooltip="Sair"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15 active:text-destructive"
    >
      {pending ? <Spinner aria-hidden /> : <LogOutIcon aria-hidden />}
      <span>{pending ? "Saindo…" : "Sair"}</span>
    </SidebarMenuButton>
  )
}
```

- [ ] **Step 4: Run the test and commit**

```powershell
pnpm vitest run src/components/layout/sidebar-logout-button.test.tsx
git add src/components/layout/sidebar-logout-button.tsx src/components/layout/sidebar-logout-button.test.tsx
git commit -m "feat: add pending sidebar logout control"
```

Expected: logout-control tests PASS.

---

### Task 6: Compose the Application Sidebar

**Files:**
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/app-sidebar.test.tsx`

**Interfaces:**
- Consumes: `protectedNavigation`, `isProtectedRouteActive`, `SidebarThemeToggle`, `SidebarLogoutButton`, and the existing `logout` Server Action.
- Produces: `AppSidebar`, mounted once inside `SidebarProvider` by `AppShell`.

- [ ] **Step 1: Write the failing desktop navigation test**

Create `src/components/layout/app-sidebar.test.tsx`. Mock only request-bound dependencies; use the real shadcn provider and sidebar:

```tsx
import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"

const navigationMock = vi.hoisted(() => ({ pathname: "/" }))

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMock.pathname,
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
}))

vi.mock("@/app/actions/logout", () => ({ logout: vi.fn() }))

import { AppSidebar } from "./app-sidebar"

function renderSidebar(children?: React.ReactNode) {
  return render(
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  )
}

describe("AppSidebar", () => {
  beforeEach(() => {
    navigationMock.pathname = "/"
  })

  it("exposes exactly the protected application links", () => {
    renderSidebar()
    const navigation = screen.getByRole("navigation", {
      name: "Navegação principal",
    })
    expect(navigation).toHaveTextContent("Início")
    expect(navigation).toHaveTextContent("Showcase")
    expect(navigation.querySelectorAll("a")).toHaveLength(2)
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "aria-current",
      "page"
    )
  })

  it("marks Showcase active without also activating root", () => {
    navigationMock.pathname = "/showcase"
    renderSidebar()
    expect(screen.getByRole("link", { name: "Showcase" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("keeps theme and logout visibly available", () => {
    renderSidebar()
    expect(screen.getByRole("button", { name: /Tema do sistema/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Add the failing mobile close test**

In the same file, define a harness:

```tsx
function MobileControl() {
  const { setOpenMobile } = useSidebar()
  return <button onClick={() => setOpenMobile(true)}>Abrir teste móvel</button>
}
```

Add this test. Override `matchMedia` for the test and restore it afterward:

```tsx
it("closes the mobile Sheet after pathname changes", async () => {
  const originalMatchMedia = window.matchMedia
  try {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const view = renderSidebar(<MobileControl />)
    fireEvent.click(screen.getByRole("button", { name: "Abrir teste móvel" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()

    navigationMock.pathname = "/showcase"
    view.rerender(
      <SidebarProvider>
        <AppSidebar />
        <MobileControl />
      </SidebarProvider>
    )

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  } finally {
    window.matchMedia = originalMatchMedia
  }
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```powershell
pnpm vitest run src/components/layout/app-sidebar.test.tsx
```

Expected: FAIL because `AppSidebar` does not exist.

- [ ] **Step 4: Implement the application sidebar**

Create `src/components/layout/app-sidebar.tsx`:

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SparklesIcon } from "lucide-react"

import { logout } from "@/app/actions/logout"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  isProtectedRouteActive,
  protectedNavigation,
} from "./protected-navigation"
import { SidebarLogoutButton } from "./sidebar-logout-button"
import { SidebarThemeToggle } from "./sidebar-theme-toggle"

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Life"
              render={<Link href="/" aria-label="Life — Início" />}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <SparklesIcon aria-hidden />
              </span>
              <span className="grid min-w-0 flex-1 text-start leading-tight">
                <span className="truncate font-semibold">Life</span>
                <span className="truncate text-xs text-muted-foreground">
                  Sistema pessoal
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Navegação principal">
          <SidebarMenu>
            {protectedNavigation.map((item) => {
              const isActive = isProtectedRouteActive(pathname, item.href)
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isActive}
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                      />
                    }
                  >
                    <item.icon aria-hidden />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logout} className="w-full">
              <SidebarLogoutButton />
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
```

- [ ] **Step 5: Run the sidebar tests and commit**

```powershell
pnpm vitest run src/components/layout/app-sidebar.test.tsx
git add src/components/layout/app-sidebar.tsx src/components/layout/app-sidebar.test.tsx
git commit -m "feat: compose protected app sidebar"
```

Expected: application-sidebar tests PASS.

---

### Task 7: Build the Protected Header and Application Shell

**Files:**
- Create: `src/components/layout/protected-header.tsx`
- Create: `src/components/layout/protected-header.test.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/app-shell.test.tsx`

**Interfaces:**
- Consumes: `getProtectedSectionLabel`, `SidebarProvider`, `SidebarInset`, `SidebarTrigger`, and `AppSidebar`.
- Produces: `ProtectedHeader` and `AppShell({ children, defaultOpen })` for the protected layout.

- [ ] **Step 1: Write the failing header test**

Create `src/components/layout/protected-header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SidebarProvider } from "@/components/ui/sidebar"

const navigationMock = vi.hoisted(() => ({ pathname: "/showcase" }))

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMock.pathname,
}))

import { ProtectedHeader } from "./protected-header"

describe("ProtectedHeader", () => {
  it("renders the standard trigger and current section label", () => {
    render(
      <SidebarProvider>
        <ProtectedHeader />
      </SidebarProvider>
    )
    expect(
      screen.getByRole("button", { name: "Alternar navegação" })
    ).toBeInTheDocument()
    expect(screen.getByText("Showcase")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write the failing shell structure test**

Create `src/components/layout/app-shell.test.tsx` with focused child mocks:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("./app-sidebar", () => ({
  AppSidebar: () => <aside>Sidebar protegida</aside>,
}))

vi.mock("./protected-header", () => ({
  ProtectedHeader: () => <header>Cabeçalho protegido</header>,
}))

import { AppShell } from "./app-shell"

describe("AppShell", () => {
  it("composes sidebar, header, and one scrollable main region", () => {
    render(
      <AppShell defaultOpen={false}>
        <article>Conteúdo protegido</article>
      </AppShell>
    )
    expect(screen.getByText("Sidebar protegida")).toBeInTheDocument()
    expect(screen.getByText("Cabeçalho protegido")).toBeInTheDocument()
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo protegido")
    expect(screen.getByTestId("protected-scroll-region")).toHaveClass(
      "overflow-y-auto"
    )
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```powershell
pnpm vitest run src/components/layout/protected-header.test.tsx src/components/layout/app-shell.test.tsx
```

Expected: FAIL because both modules do not exist.

- [ ] **Step 4: Implement the protected header**

Create `src/components/layout/protected-header.tsx`:

```tsx
"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getProtectedSectionLabel } from "./protected-navigation"

export function ProtectedHeader() {
  const pathname = usePathname()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger
        aria-label="Alternar navegação"
        title="Alternar navegação (Ctrl+B)"
        className="-ms-1"
      />
      <Separator orientation="vertical" className="me-2 h-4" />
      <p className="truncate text-sm font-medium">
        {getProtectedSectionLabel(pathname)}
      </p>
    </header>
  )
}
```

- [ ] **Step 5: Implement the shell composition**

Create `src/components/layout/app-shell.tsx`:

```tsx
import type { ReactNode } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { ProtectedHeader } from "./protected-header"

export function AppShell({
  children,
  defaultOpen,
}: {
  children: ReactNode
  defaultOpen: boolean
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="h-svh min-w-0 overflow-hidden">
        <ProtectedHeader />
        <div
          data-testid="protected-scroll-region"
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

- [ ] **Step 6: Run the tests and commit**

```powershell
pnpm vitest run src/components/layout/protected-header.test.tsx src/components/layout/app-shell.test.tsx
git add src/components/layout/protected-header.tsx src/components/layout/protected-header.test.tsx src/components/layout/app-shell.tsx src/components/layout/app-shell.test.tsx
git commit -m "feat: add protected application shell"
```

Expected: header and shell tests PASS.

---

### Task 8: Integrate the Server Layout, Localize the Primitive, and Verify End to End

**Files:**
- Modify: `src/components/ui/sidebar.tsx`
- Create: `src/components/ui/sidebar-accessibility.test.tsx`
- Modify: `src/app/(protected)/layout.tsx`
- Verify: all project source and configuration files.

**Interfaces:**
- Consumes: Next.js 16 asynchronous `cookies()`, `AppShell({ defaultOpen })`, and existing `requireAuthenticatedUser()`.
- Produces: One valid shell for every route in `(protected)` and Portuguese assistive text for the local primitive.

- [ ] **Step 1: Write the failing Portuguese mobile semantics test**

Create `src/components/ui/sidebar-accessibility.test.tsx`:

```tsx
import * as React from "react"
import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "./sidebar"

function OpenMobileSidebar() {
  const { setOpenMobile } = useSidebar()
  React.useEffect(() => setOpenMobile(true), [setOpenMobile])
  return <Sidebar />
}

describe("Sidebar accessibility copy", () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it("describes the mobile navigation in Portuguese", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <SidebarProvider>
        <OpenMobileSidebar />
      </SidebarProvider>
    )

    expect(
      await screen.findByRole("heading", { name: "Navegação principal" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Exibe a navegação principal em telas menores.")
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify the English default fails**

```powershell
pnpm vitest run src/components/ui/sidebar-accessibility.test.tsx
```

Expected: FAIL because the current hidden Sheet title is "Sidebar" and its description is English.

- [ ] **Step 3: Localize only user-facing primitive strings**

In `src/components/ui/sidebar.tsx`, make these exact replacements:

```tsx
<SheetTitle>Navegação principal</SheetTitle>
<SheetDescription>
  Exibe a navegação principal em telas menores.
</SheetDescription>
```

For `SidebarTrigger`:

```tsx
<span className="sr-only">Alternar navegação</span>
```

For `SidebarRail`:

```tsx
aria-label="Alternar navegação"
title="Alternar navegação"
```

Do not change widths, transitions, provider state, cookie name, breakpoint, logical positioning, or Base UI composition.

- [ ] **Step 4: Integrate the protected Server Component layout**

Replace `src/app/(protected)/layout.tsx` with:

```tsx
import type { ReactNode } from "react"
import { cookies } from "next/headers"

import { AppShell } from "@/components/layout/app-shell"
import { requireAuthenticatedUser } from "@/lib/auth/session"

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAuthenticatedUser()
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return <AppShell defaultOpen={defaultOpen}>{children}</AppShell>
}
```

- [ ] **Step 5: Run the complete automated verification**

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all four commands PASS. Treat warnings about accessibility, React updates outside `act`, hydration, or duplicate landmarks as failures to investigate rather than acceptable output.

- [ ] **Step 6: Audit dependencies and prohibited architecture**

Run:

```powershell
rg -n "MobileNavigation|NavTree|react-icons|serviceWorker|service-worker|sw\.js|workbox|serwist|next-pwa" src package.json next.config.ts public
rg -n "from \"motion|from 'motion" src
```

Expected:

- No custom `MobileNavigation`, custom `NavTree`, React Icons, PWA, service-worker, Workbox, Serwist, or next-pwa reference is introduced.
- Existing Motion imports may remain only where already required by legitimate auth or Showcase behavior; the new `src/components/layout` shell files contain no Motion import.
- Do not remove a dependency merely because it is absent from the new shell; remove it only if repository-wide search proves it is unused and rerun all four verification commands after removal.

- [ ] **Step 7: Perform the browser smoke test**

Run:

```powershell
pnpm dev
```

Verify in a signed-in session:

1. `/` returns 200 and shows the protected shell without a missing-module overlay.
2. `/showcase` returns 200 inside the same persistent shell.
3. Início is active only at `/`; Showcase is active at `/showcase`.
4. `Ctrl+B` collapses to icons, tooltips name all icon actions, and reload restores the cookie state.
5. `Ctrl+Alt+T` cycles system, light, dark, system; it does not fire while typing or using AltGraph.
6. At widths below 768px, the trigger opens the Sheet, Escape closes it, focus returns to the trigger, and choosing a route closes it.
7. Logout shows pending feedback and redirects to `/login`.
8. Keyboard-only navigation reaches every link/action with visible focus at 100% and 200% zoom.
9. The Showcase's contained sidebar demo still behaves independently.

If the browser still requests `/sw.js`, open DevTools → Application → Service Workers, unregister the worker for `http://localhost:3000`, clear site data for that origin, and hard reload. Do not add `/sw.js` to the repository.

- [ ] **Step 8: Commit the integration**

Stop the dev server, then run:

```powershell
git add src/components/ui/sidebar.tsx src/components/ui/sidebar-accessibility.test.tsx "src/app/(protected)/layout.tsx"
git commit -m "feat: integrate protected sidebar layout"
```

- [ ] **Step 9: Confirm the worktree scope**

```powershell
git status --short
git diff --stat HEAD~8..HEAD
```

Expected: the new commits contain only the files listed by this plan. Pre-existing unrelated dirty-worktree entries remain untouched and uncommitted.
