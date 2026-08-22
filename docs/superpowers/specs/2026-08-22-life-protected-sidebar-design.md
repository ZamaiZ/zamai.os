# Life Protected Sidebar Design

## Context

The protected route group currently imports `@/components/layout/app-shell`, but that module does not exist. The application therefore fails before rendering `/` or `/showcase`. The repository already contains the current shadcn Base UI sidebar primitive, the protected authentication guard, the logout Server Action, sidebar design tokens, and a local sidebar showcase. The missing work is the application-level composition that connects these pieces.

The sibling `next` project is a behavioral reference only. Its custom sidebar uses Motion, React Icons, project-specific tokens, a custom navigation tree, and separate mobile navigation. Those dependencies and abstractions are not appropriate for the intentionally small Life navigation.

## Goal

Provide every route inside `src/app/(protected)` with a polished, accessible, responsive shell built from the installed shadcn sidebar primitives. The shell exposes only Início, Showcase, the three-state theme control, and logout. It also removes or supersedes incomplete configuration from earlier implementation attempts and restores a trustworthy development and build baseline.

## Non-goals

- Redesigning the Home or Showcase page content.
- Porting the custom sidebar, animation system, navigation tree, or mobile navigation from `next`.
- Adding a PWA, service worker, Workbox, Serwist, or offline cache.
- Refactoring authentication beyond what the shell requires.
- Deleting user documents, showcase components, tests, assets, or unrelated worktree changes.
- Adding nested navigation, account menus, workspace switchers, badges, or role-based navigation.

## Repository Findings

1. `src/app/(protected)/layout.tsx` is a Server Component and correctly calls `requireAuthenticatedUser()`, but imports a nonexistent `AppShell`.
2. `src/components/ui/sidebar.tsx` already provides the required shadcn composition: `SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, `SidebarRail`, menu primitives, icon collapse, cookie persistence, keyboard collapse, and mobile Sheet behavior.
3. `src/components/theme-provider.tsx` currently binds the plain `D` key and toggles only resolved light/dark values. `src/lib/theme.test.ts` already describes the desired `system → light → dark → system` cycle, but `src/lib/theme.ts` is missing.
4. `src/app/actions/logout.ts` already signs out through Supabase and redirects to `/login`.
5. `src/app/(protected)/page.tsx` is intentionally empty and `src/app/(protected)/showcase/page.tsx` renders the existing showcase.
6. No source file registers or serves `/sw.js`. Browser requests for `/sw.js` are stale client state, not an application feature to implement.
7. `.next` contains generated route types for deleted pre-migration paths. `tsconfig.tsbuildinfo` is also generated state. Both may be regenerated after the source layout is valid.
8. The installed dependency tree was produced with pnpm 10.34.5, while `package.json` does not declare a package manager. The project must pin `pnpm@10.34.5` so local and agent verification use the same layout.
9. The current source baseline contains Showcase typing errors independent of the sidebar. They must be corrected without visual or behavioral redesign because they otherwise prevent typecheck and build from proving the shell is valid.

## Chosen Approach

Use native shadcn composition rather than either copying the sibling implementation or installing a full sidebar block.

The official primitive remains the state and responsive behavior owner. Application components provide only Life-specific content and accessible semantics. This keeps the sidebar aligned with the installed `base-maia` shadcn configuration and avoids parallel layout systems.

## Architecture

### Protected layout

`src/app/(protected)/layout.tsx` remains a Server Component. It:

1. Awaits `requireAuthenticatedUser()` before rendering protected content.
2. Reads the `sidebar_state` cookie through the asynchronous Next.js `cookies()` API.
3. Passes the derived `defaultOpen` boolean to `AppShell`.

Authentication and request-bound cookie access stay on the server. No user or Supabase object is serialized into the interactive sidebar.

### Application shell

`src/components/layout/app-shell.tsx` is responsible only for composition:

```text
SidebarProvider
├── AppSidebar
└── SidebarInset
    ├── ProtectedHeader
    └── scrollable protected content
```

The inset occupies the viewport height. `ProtectedHeader` is a non-overlaying, shrink-free row above a dedicated scroll container. This prevents the header from obscuring focused elements or the Showcase's own sticky catalog navigation.

### Application sidebar

`src/components/layout/app-sidebar.tsx` is a Client Component because it consumes the current pathname and mobile sidebar context. It uses:

- `Sidebar` with `variant="inset"` and `collapsible="icon"`.
- `SidebarHeader` for a compact Life brand link.
- `SidebarContent`, `SidebarGroup`, and `SidebarMenu` for the two routes.
- `SidebarFooter` for theme and logout.
- `SidebarRail` as the standard desktop secondary toggle.

It does not own width animation, persistence, breakpoint detection, focus trapping, or Sheet state; those stay inside the shadcn primitive.

### Navigation

`src/components/layout/protected-navigation.ts` exports a typed, immutable list:

- `Início`, `/`, `HomeIcon`
- `Showcase`, `/showcase`, `PanelsTopLeftIcon`

The same module exports `isProtectedRouteActive(pathname, href)`. `/` matches only `/`; other entries match their exact path and descendants. Links render through the Base UI `render` composition supported by the installed `SidebarMenuButton`, not the Radix-only `asChild` examples.

The active link receives both the primitive's `isActive` state and `aria-current="page"`. On pathname changes, the mobile Sheet closes. Desktop collapse state remains unchanged across client navigation.

### Header

`src/components/layout/protected-header.tsx` is a small Client Component containing:

- The standard `SidebarTrigger`.
- A visually separated current-section label derived from the same navigation configuration.

The label is not an additional page-level heading, so the Showcase keeps its existing `h1`. The trigger retains the primitive shortcut `Ctrl+B` on Windows/Linux and `Cmd+B` on macOS.

### Theme system

`src/lib/theme.ts` defines:

```ts
type ThemeValue = "system" | "light" | "dark"
nextTheme(current): ThemeValue
```

The transition is fixed:

```text
system → light → dark → system
```

Unknown values fall back to `system`; an undefined current value advances from the default `system` to `light`, matching the existing test contract.

`src/components/theme-provider.tsx` continues to wrap `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`. Its old plain-`D` shortcut is removed. The replacement shortcut fires only for physical `Ctrl+Alt+T`:

- Ignore `event.repeat` and already prevented events.
- Require `event.ctrlKey`, `event.altKey`, and `event.code === "KeyT"`.
- Reject `Meta` and `AltGraph`.
- Ignore inputs, textareas, selects, and contenteditable targets.
- Call `preventDefault()` only after the shortcut qualifies.

`src/components/layout/theme-toggle.tsx` is a visible button built with `SidebarMenuButton`. It displays the icon for the configured theme, not merely the resolved OS theme. Its accessible name states both the current state and the next action, for example: "Tema do sistema. Alterar para tema claro." In collapsed mode the same label is exposed through the primitive tooltip. The visible expanded label is "Tema" with a compact `Ctrl Alt T` hint.

### Logout

The existing `logout` Server Action remains the single logout implementation. The sidebar footer submits it through a form.

A focused client submit control uses `useFormStatus()` to:

- Disable duplicate submission while pending.
- Preserve the accessible name "Sair".
- Expose `aria-busy="true"` during submission.
- Replace the decorative logout icon with the existing shadcn spinner while pending.

Failure is not handled locally because the current action either redirects or allows the framework error boundary to handle an unexpected Supabase failure. No client-side duplicate sign-out path is introduced.

## Visual Direction

The visual language stays inside existing semantic tokens and shadcn component variants.

- Sidebar: inset, icon-collapsible, default shadcn width.
- Brand: quiet typographic identity with one restrained primary-color mark.
- Navigation: one group, no redundant group heading required for only two destinations.
- Active state: `sidebar-accent`, medium label weight, and semantic `aria-current`.
- Footer: neutral theme action and destructive logout action.
- Motion: only transitions already present in the shadcn primitive; no Motion dependency is added for the shell.
- Mobile: the primitive's full-height Sheet, opened only through `SidebarTrigger`.

"Premium" means spacing, hierarchy, state clarity, and restraint. It does not add decorative gradients, extra panels, nested menus, or custom animation infrastructure.

## Accessibility Requirements

The implementation must satisfy all of the following:

1. The sidebar landmark has the accessible label "Navegação principal".
2. Every interactive icon has a visible label or an accessible name; adjacent decorative icons use `aria-hidden="true"`.
3. The active route is communicated by color-independent text weight plus `aria-current="page"`.
4. Keyboard focus remains visible and is not covered by the header or footer.
5. The official Sheet behavior manages mobile focus entry, focus containment, Escape dismissal, and focus return.
6. Mobile navigation closes after route changes.
7. Theme and logout remain reachable and named in both expanded and icon-collapsed states.
8. Shortcut handling never hijacks editable targets, key repeat, or AltGraph input.
9. The UI does not rely on hover to reveal required actions.
10. Interactive targets use the dimensions supplied by the shadcn menu and trigger primitives.
11. No custom animation may bypass reduced-motion behavior.
12. Portuguese assistive text replaces the English default labels in the local sidebar primitive where those strings are user-facing: toggle, rail, mobile Sheet title, and mobile Sheet description.

## Cleanup and Removal Policy

Cleanup is part of this feature, but it is evidence-based rather than broad deletion.

### Remove or replace

- Replace the unresolved `AppShell` reference by creating the specified module.
- Remove the obsolete plain-`D` theme shortcut.
- Do not create a second theme provider, theme cycle, navigation registry, mobile navigation, or logout implementation.
- Remove stale generated `.next` output after the running dev server is stopped, then let Next.js regenerate it.
- Remove generated `tsconfig.tsbuildinfo` before the final clean typecheck.
- Correct stale Showcase API usages and test typings that block typecheck, preserving their rendered behavior.
- Reconcile `node_modules` from the lockfile with pnpm 10.34.5; never hand-edit package contents.
- Remove dependencies only if repository-wide search and the clean build prove they are unused after the shell is complete.

### Preserve

- The protected/public route-group structure.
- Supabase authentication, Proxy, migrations, and existing auth screens.
- The complete Showcase catalog and its local contained sidebar demo.
- Existing shadcn UI primitives unless a narrow Portuguese accessibility-label change is required.
- Existing user documentation, review notes, public assets, environment files, and unrelated dirty-worktree changes.

### Browser-only cleanup

Because the repository has no service worker implementation, `/sw.js` must not be added. After the source build succeeds, unregister any old service worker for `localhost:3000`, clear site data for that origin, and hard reload once. This is an environment cleanup step, not a source-code feature.

## Error Handling

- Missing authentication continues to redirect to `/login` on the server before the shell renders.
- Unknown pathnames produce no active navigation item and a neutral header label rather than throwing.
- Unknown theme values resolve to the safe `system` state.
- A failed logout is surfaced through the application error boundary; the control does not fake a successful local logout.
- Cookie absence or an invalid sidebar cookie defaults the sidebar to expanded.

## Testing Strategy

### Unit tests

- `nextTheme()` covers the complete cycle, undefined input, and unknown input.
- `isProtectedRouteActive()` covers exact root matching, Showcase, Showcase descendants, and unrelated routes.
- Shortcut tests cover the valid chord plus repeat, editable target, Meta, missing modifier, and AltGraph rejection.

### Component tests

- AppSidebar exposes exactly Início and Showcase as navigation links.
- The current link receives `aria-current="page"`.
- Theme and logout controls remain accessible in expanded and collapsed states.
- A pathname change closes the mobile Sheet.
- Pending logout exposes busy state and prevents duplicate submission.
- ProtectedHeader renders the standard trigger and correct section label.

### Integration and manual checks

- `/` and `/showcase` render inside the same protected shell.
- Direct unauthenticated access redirects to `/login`.
- `Ctrl+B`/`Cmd+B` controls sidebar collapse and persistence.
- `Ctrl+Alt+T` cycles system, light, and dark without firing in editable fields.
- Mobile Sheet opens, traps focus, dismisses with Escape, returns focus, and closes after navigation.
- Focus indicators remain visible at 200% zoom.
- Light and dark themes retain readable active, muted, destructive, and focus states.
- The Showcase's inner sidebar demo remains contained and independent of the outer provider.

### Required clean commands

After deterministic dependency installation and generated-cache cleanup:

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

All commands must complete successfully. A development smoke test then verifies `/`, `/showcase`, `/login`, logout, both shortcuts, desktop collapse persistence, and mobile Sheet behavior.

## Acceptance Criteria

1. `pnpm dev` serves `/` without the missing-module error.
2. Every protected page is wrapped by the same shadcn sidebar shell.
3. The only application navigation links are Início and Showcase.
4. Theme is controllable visibly and through `Ctrl+Alt+T`, cycling system, light, and dark.
5. Logout uses the existing Server Action and communicates pending state accessibly.
6. Desktop icon collapse, persistence, `Ctrl+B`/`Cmd+B`, rail interaction, and mobile Sheet behavior come from the shadcn primitive.
7. No custom sidebar framework, parallel mobile navigation, PWA, or service worker is added.
8. All accessibility requirements in this document are verified.
9. Stale generated output and superseded theme behavior are removed without deleting unrelated user work.
10. Tests, typecheck, lint, and production build all pass from a clean generated state.
