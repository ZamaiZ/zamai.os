<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project layout

| Path | Role |
|---|---|
| `src/app/` | Next.js routes, layouts, and thin Server Action adapters |
| `src/app/actions/` | Form adapters (`"use server"`) — delegate to `src/server/modules/*` |
| `src/app/api/[[...path]]/route.ts` | Single HTTP entrypoint; dispatches to `apiRouter` |
| `src/server/` | Backend domain logic (`server-only`) — services, handlers, routes |
| `src/server/http/` | Express-style router, middleware, response helpers |
| `src/server/modules/` | Feature modules (`auth`, `push`, `health`, …) |
| `src/lib/` | Infrastructure only — Supabase clients, validations, theme, utils |
| `proxy.ts` | Edge auth (root); do not move |
| `data/` | Static data files (e.g. workout sheets) |

## Adding a new API module

1. Create `src/server/modules/<name>/` with `*.service.ts`, `*.handlers.ts`, `*.routes.ts`, `index.ts`
2. Register routes in `src/server/index.ts` via `register<Name>Routes(router)`
3. Add public API paths to `PUBLIC_API_PATHS` in `src/lib/auth/routePolicy.ts` if unauthenticated
4. Optionally add a Server Action wrapper in `src/app/actions/` for form-based UI

## Conventions

- Business logic lives in `*Service` classes, not in actions or route handlers
- Handlers parse HTTP; services parse domain
- Reuse Zod schemas from `src/lib/validations/`
- Client components must not import from `@/server/*`
