import { NextResponse, type NextRequest } from "next/server"

import { getClientIp } from "@/lib/auth/clientIp"
import {
  isClientIpAllowed,
  parseAllowedIps,
} from "@/lib/auth/ipAllowlist"
import { decideAuthRoute } from "@/lib/auth/routePolicy"
import { createProxyClient } from "@/lib/supabase/proxy"

const BLOCKED_IP_REDIRECT = "https://www.google.com/"

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options)
  })

  return target
}

export async function proxy(request: NextRequest) {
  const allowedIps = parseAllowedIps(process.env.ALLOWED_IPS)
  const clientIp = getClientIp(request.headers)

  if (!isClientIpAllowed(clientIp, allowedIps)) {
    return NextResponse.redirect(BLOCKED_IP_REDIRECT)
  }

  const response = NextResponse.next({ request })
  const supabase = createProxyClient(request, response)
  const { data, error } = await supabase.auth.getClaims()
  const decision = decideAuthRoute({
    pathname: request.nextUrl.pathname,
    isAuthenticated: !error && Boolean(data?.claims?.sub),
  })

  if (decision.kind === "unauthorized") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (decision.kind === "redirect") {
    return copyResponseCookies(
      response,
      NextResponse.redirect(new URL(decision.destination, request.url))
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|video/|sw\\.js|manifest\\.webmanifest|pwa/|icon|apple-icon).*)",
  ],
}
