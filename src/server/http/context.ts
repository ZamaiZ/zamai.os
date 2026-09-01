import "server-only"

import { headers } from "next/headers"

import { getClientIp } from "@/lib/auth/clientIp"

import type { ApiContext } from "./types"

export function buildApiPath(pathSegments: string[] | undefined): string {
  if (!pathSegments || pathSegments.length === 0) {
    return "/"
  }

  return `/${pathSegments.join("/")}`
}

export function createApiContext(
  request: Request,
  pathSegments: string[] | undefined
): ApiContext {
  return {
    request,
    ip: getClientIp(request.headers),
    path: buildApiPath(pathSegments),
    pathSegments: pathSegments ?? [],
    params: {},
  }
}

export async function createActionContext(): Promise<{ ip: string }> {
  const headerStore = await headers()
  return { ip: getClientIp(headerStore) }
}
