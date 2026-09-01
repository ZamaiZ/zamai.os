export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init)
}

export function badRequest(message: string): Response {
  return json({ error: message }, { status: 400 })
}

export function unauthorized(message = "Não autorizado"): Response {
  return json({ error: message }, { status: 401 })
}

export function notFound(message = "Rota não encontrada"): Response {
  return json({ error: message }, { status: 404 })
}

export function internalError(message = "Erro interno"): Response {
  return json({ error: message }, { status: 500 })
}
