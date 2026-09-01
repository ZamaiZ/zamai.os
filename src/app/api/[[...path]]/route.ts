import { apiRouter } from "@/server"

export const maxDuration = 60

async function handleRequest(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await context.params
  return apiRouter.handle(request, path)
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
