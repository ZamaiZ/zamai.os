import { createApiContext } from "./context"
import { notFound } from "./response"
import type {
  ApiHandler,
  ApiMiddleware,
  HttpMethod,
  RouteDefinition,
} from "./types"

function normalizePath(path: string): string {
  if (path === "/") return path
  return path.replace(/\/+$/, "") || "/"
}

function matchPath(
  pattern: string,
  path: string
): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean)
  const pathParts = path.split("/").filter(Boolean)

  if (patternParts.length !== pathParts.length) {
    return null
  }

  const params: Record<string, string> = {}

  for (let index = 0; index < patternParts.length; index++) {
    const patternPart = patternParts[index]!
    const pathPart = pathParts[index]!

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = pathPart
      continue
    }

    if (patternPart !== pathPart) {
      return null
    }
  }

  return params
}

async function runMiddlewareChain(
  ctx: Parameters<ApiHandler>[0],
  middleware: ApiMiddleware[],
  handler: ApiHandler
): Promise<Response> {
  for (const middlewareFn of middleware) {
    const result = await middlewareFn(ctx)
    if (result instanceof Response) {
      return result
    }
  }

  return handler(ctx)
}

export class Router {
  private routes: RouteDefinition[] = []
  private globalMiddleware: ApiMiddleware[] = []

  use(middleware: ApiMiddleware): this {
    this.globalMiddleware.push(middleware)
    return this
  }

  private register(
    method: HttpMethod,
    path: string,
    handlers: [...ApiMiddleware[], ApiHandler]
  ): this {
    const handler = handlers[handlers.length - 1] as ApiHandler
    const middleware = handlers.slice(0, -1) as ApiMiddleware[]

    this.routes.push({
      method,
      path: normalizePath(path),
      middleware,
      handler,
    })

    return this
  }

  get(path: string, ...handlers: [...ApiMiddleware[], ApiHandler]): this {
    return this.register("GET", path, handlers)
  }

  post(path: string, ...handlers: [...ApiMiddleware[], ApiHandler]): this {
    return this.register("POST", path, handlers)
  }

  put(path: string, ...handlers: [...ApiMiddleware[], ApiHandler]): this {
    return this.register("PUT", path, handlers)
  }

  patch(path: string, ...handlers: [...ApiMiddleware[], ApiHandler]): this {
    return this.register("PATCH", path, handlers)
  }

  delete(path: string, ...handlers: [...ApiMiddleware[], ApiHandler]): this {
    return this.register("DELETE", path, handlers)
  }

  async handle(
    request: Request,
    pathSegments: string[] | undefined
  ): Promise<Response> {
    const ctx = createApiContext(request, pathSegments)
    const normalizedPath = normalizePath(ctx.path)

    const exactRoute = this.routes.find(
      (entry) =>
        entry.method === request.method && entry.path === normalizedPath
    )

    if (exactRoute) {
      return runMiddlewareChain(
        ctx,
        [...this.globalMiddleware, ...exactRoute.middleware],
        exactRoute.handler
      )
    }

    for (const entry of this.routes) {
      if (entry.method !== request.method) {
        continue
      }

      const params = matchPath(entry.path, normalizedPath)
      if (!params) {
        continue
      }

      ctx.params = params
      return runMiddlewareChain(
        ctx,
        [...this.globalMiddleware, ...entry.middleware],
        entry.handler
      )
    }

    return notFound()
  }
}
