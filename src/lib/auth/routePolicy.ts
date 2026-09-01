const PUBLIC_AUTH_PATHS = new Set(["/login", "/sign-up"])
const PUBLIC_API_PATHS = new Set([
  "/api/health",
  "/api/auth/login",
  "/api/auth/sign-up",
])

export type AuthRouteDecision =
  | { kind: "next" }
  | { kind: "unauthorized" }
  | { kind: "redirect"; destination: string }

export function decideAuthRoute({
  pathname,
  isAuthenticated,
}: {
  pathname: string
  isAuthenticated: boolean
}): AuthRouteDecision {
  const isPublicAuthPath = PUBLIC_AUTH_PATHS.has(pathname)

  if (isAuthenticated && isPublicAuthPath) {
    return { kind: "redirect", destination: "/" }
  }

  if (!isAuthenticated && !isPublicAuthPath) {
    if (pathname.startsWith("/api/") && !PUBLIC_API_PATHS.has(pathname)) {
      return { kind: "unauthorized" }
    }

    return { kind: "next" }
  }

  return { kind: "next" }
}
