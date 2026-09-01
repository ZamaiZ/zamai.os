import type { User } from "@supabase/supabase-js"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type ApiContext = {
  request: Request
  ip: string
  path: string
  pathSegments: string[]
  params: Record<string, string>
  user?: User
  body?: unknown
}

export type ApiHandler = (ctx: ApiContext) => Promise<Response>

export type ApiMiddleware = (ctx: ApiContext) => Promise<Response | void>

export type RouteDefinition = {
  method: HttpMethod
  path: string
  middleware: ApiMiddleware[]
  handler: ApiHandler
}
